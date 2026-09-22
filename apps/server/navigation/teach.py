import asyncio
import json
import re
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path


class TeachError(Exception):
    def __init__(self, message, status=422):
        super().__init__(message)
        self.status = status


def run(command):
    try:
        return subprocess.run(command, check=True, capture_output=True, timeout=180).stdout
    except (subprocess.SubprocessError, FileNotFoundError):
        raise TeachError("Video processing failed. Check MP4 and FFmpeg installation.") from None


def extract(source: Path, folder: Path):
    probe = json.loads(run([
        "ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(source)
    ]))
    duration = float(probe.get("format", {}).get("duration", 0))
    if not 0 < duration <= 180:
        raise TeachError("Teach video must be between 0 and 180 seconds")
    if "mp4" not in probe.get("format", {}).get("format_name", ""):
        raise TeachError("Teach requires an MP4 video")
    run([
        "ffmpeg", "-nostdin", "-v", "error", "-i", str(source),
        "-vf", "fps=1,scale=640:640:force_original_aspect_ratio=decrease",
        "-frames:v", "180", str(folder / "frame-%04d.jpg"),
    ])
    if not list(folder.glob("frame-*.jpg")):
        raise TeachError("Video has no readable frames")
    has_audio = any(s.get("codec_type") == "audio" for s in probe.get("streams", []))
    if has_audio:
        run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(source), "-vn",
             "-ac", "1", "-ar", "16000", str(folder / "speech.wav")])
    return has_audio, duration


def transcribe(path: Path):
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("base.en", device="cpu", compute_type="int8")
        segments, _ = model.transcribe(str(path), language="en", vad_filter=True)
        return [{"start": s.start, "end": s.end, "text": s.text.strip()} for s in segments]
    except Exception:
        raise TeachError("Transcription failed. Install teach dependencies or supply a transcript.") from None


def edited_segments(text, duration):
    if len(text) > 30_000:
        raise TeachError("Transcript is too long")
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        value = [{"start": 0, "end": duration, "text": text.strip()}]
    if not isinstance(value, list) or not value:
        raise TeachError("Transcript must be text or a timestamped JSON array")
    previous = -1
    for segment in value:
        if not isinstance(segment, dict) or set(segment) != {"start", "end", "text"}:
            raise TeachError("Each transcript segment needs start, end, text")
        start, end = segment["start"], segment["end"]
        if (type(start) not in (int, float) or type(end) not in (int, float)
                or not 0 <= start <= end <= duration or start < previous
                or not isinstance(segment["text"], str) or not segment["text"].strip()):
            raise TeachError("Invalid transcript timestamps or text")
        previous = start
    return value


def process_local(source, folder, transcript):
    has_audio, duration = extract(source, folder)
    if transcript is not None and transcript.strip():
        segments = edited_segments(transcript, duration)
    elif has_audio:
        segments = transcribe(folder / "speech.wav")
    else:
        raise TeachError("Video has no audio. Supply the guide's transcript before teaching.")
    if not segments:
        raise TeachError("No narration found; supply a corrected transcript")
    segments = [{**s, "start": min(s["start"], duration), "end": min(s["end"], duration)}
                for s in segments if s["start"] < duration]
    frames = [(i, p.read_bytes()) for i, p in enumerate(sorted(folder.glob("frame-*.jpg")))]
    return frames, segments


async def ingest_upload(upload, route_id, transcript, data, provider):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", route_id):
        raise TeachError("Invalid route ID")
    if (data / "routes" / route_id).exists() or (data / "drafts" / route_id).exists():
        raise TeachError("Route ID already exists; choose a new version", 409)
    if not (upload.filename or "").lower().endswith(".mp4"):
        raise TeachError("Upload an MP4 file")
    started = time.monotonic()
    started_at = datetime.now(timezone.utc).isoformat()
    events = []

    def event(name):
        events.append({"event": name, "seconds": round(time.monotonic()-started, 3),
                       "timestamp": datetime.now(timezone.utc).isoformat()})

    # All raw video, extracted speech and keyframes disappear on success AND exceptions.
    with tempfile.TemporaryDirectory(prefix="offixed-teach-") as tmp:
        folder = Path(tmp)
        source = folder / "source.mp4"
        size = 0
        with source.open("wb") as out:
            while chunk := await upload.read(1024 * 1024):
                size += len(chunk)
                if size > 120_000_000:
                    raise TeachError("Maximum video size is 120 MB", 413)
                out.write(chunk)
        event("video_imported")
        # Shield local worker so cancellation cannot remove files beneath FFmpeg/Whisper.
        worker = asyncio.create_task(asyncio.to_thread(process_local, source, folder, transcript))
        try:
            frames, segments = await asyncio.shield(worker)
        except asyncio.CancelledError:
            await worker
            raise
        event("transcribed_locally")
        route = await provider.draft(route_id, frames, segments)
        if route.route_id != route_id:
            raise TeachError("Draft route ID did not match request")
        spoken = " ".join(" ".join(s["text"].split()) for s in segments)
        for step in route.steps:
            if step.voice_cue and " ".join(step.voice_cue.split()) not in spoken:
                step.voice_cue = ""  # Never retain a cue invented from image content.
        event("draft_ready_for_human_review")
    destination = data / "drafts" / route_id
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Atomic publication of the draft bundle, never a replayable route.
    with tempfile.TemporaryDirectory(dir=destination.parent, prefix=".draft-") as staging:
        stage = Path(staging) / "bundle"
        stage.mkdir()
        (stage / "route.json").write_text(route.model_dump_json(indent=2), encoding="utf-8")
        (stage / "transcript.json").write_text(json.dumps(segments, indent=2), encoding="utf-8")
        (stage / "teach-log.json").write_text(json.dumps({
            "started_at": started_at, "pre_recorded": True, "events": events,
        }, indent=2), encoding="utf-8")
        # Blank short_name / expected_seconds make prepare refuse until a reviewer fills them.
        (stage / "review.json").write_text(json.dumps({
            "origin": {"description": "", "required_text": [], "required_features": [],
                       "short_name": ""},
            "checkpoints": [{"description": s.landmark, "required_text": [],
                             "required_features": [], "short_name": "",
                             "expected_seconds": 0} for s in route.steps],
            "arrival": "You have reached the outside of the toilet. Route finished.",
            "destination_is_exterior": False, "sample": False,
        }, indent=2), encoding="utf-8")
        stage.rename(destination)
    return route
