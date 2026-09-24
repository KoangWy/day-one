import asyncio
import json
import re
import shutil
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

MAX_BYTES = 120_000_000
MAX_SECONDS = 180
# Enough to see every landmark of a short leg; one VLM call must stay within its deadline.
MAX_FRAMES = 48
SUFFIXES = (".mp4", ".mov", ".webm")
CONTAINERS = {"mp4", "mov", "webm", "matroska"}
FAILED = "Video processing failed. Check the video and the FFmpeg installation."


class TeachError(Exception):
    def __init__(self, message, status=422):
        super().__init__(message)
        self.status = status


def tool(name):
    """FFmpeg/FFprobe from PATH, else the FFmpeg bundled with imageio-ffmpeg (no system install)."""
    found = shutil.which(name)
    if found or name != "ffmpeg":
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def run(command):
    if not command[0]:
        raise TeachError(FAILED)
    try:
        return subprocess.run(command, check=True, capture_output=True, timeout=180).stdout
    except (subprocess.SubprocessError, OSError):
        raise TeachError(FAILED) from None


def report(source: Path, *extra):
    """FFmpeg's stderr summary; used when FFprobe is missing. FFmpeg exits non-zero without output."""
    try:
        return subprocess.run([tool("ffmpeg") or "", "-hide_banner", "-nostdin", "-i", str(source),
                               *extra], capture_output=True, timeout=180
                              ).stderr.decode("utf-8", "replace")
    except (subprocess.SubprocessError, OSError):
        raise TeachError(FAILED) from None


def seconds(h, m, s):
    return int(h) * 3600 + int(m) * 60 + float(s)


def probe(source: Path):
    """(duration or 0 when unknown, container names, has audio)."""
    ffprobe = tool("ffprobe")
    if ffprobe:
        info = json.loads(run([ffprobe, "-v", "error", "-show_format", "-show_streams",
                               "-of", "json", str(source)]))
        try:
            duration = float(info.get("format", {}).get("duration", 0))
        except (TypeError, ValueError):
            duration = 0
        return (duration, set(info.get("format", {}).get("format_name", "").split(",")),
                any(s.get("codec_type") == "audio" for s in info.get("streams", [])))
    text = report(source)
    container = re.search(r"Input #0, (\S+), from", text)
    if not container:
        raise TeachError(FAILED)
    length = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", text)
    return (seconds(*length.groups()) if length else 0, set(container.group(1).split(",")),
            bool(re.search(r"Stream #\S+.*: Audio:", text)))


def measure(source: Path):
    """Browser WebM recordings carry no duration header; decode once to find it."""
    times = re.findall(r"time=(\d+):(\d+):(\d+(?:\.\d+)?)", report(source, "-f", "null", "-"))
    return seconds(*times[-1]) if times else 0


def extract(source: Path, folder: Path):
    duration, containers, has_audio = probe(source)
    if not containers & CONTAINERS:
        raise TeachError("Teach needs an MP4, MOV or WebM video")
    if duration <= 0:
        duration = measure(source)
    if not 0 < duration <= MAX_SECONDS:
        raise TeachError(f"Teach video must be between 0 and {MAX_SECONDS} seconds")
    ffmpeg = tool("ffmpeg")
    run([
        ffmpeg, "-nostdin", "-v", "error", "-i", str(source),
        "-vf", "fps=1,scale=640:640:force_original_aspect_ratio=decrease",
        "-frames:v", str(MAX_SECONDS), str(folder / "frame-%04d.jpg"),
    ])
    if not list(folder.glob("frame-*.jpg")):
        raise TeachError("Video has no readable frames")
    if has_audio:
        run([ffmpeg, "-nostdin", "-v", "error", "-i", str(source), "-vn",
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


def live_segments(text, duration):
    """Speech the phone's browser recognised while recording; clocks can overrun the video slightly."""
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        raise TeachError("Live transcript must be a timestamped JSON array") from None
    if isinstance(value, list):
        value = [dict(s, start=min(s["start"], duration), end=min(s["end"], duration))
                 if isinstance(s, dict) and all(type(s.get(k)) in (int, float)
                                                for k in ("start", "end")) else s
                 for s in value]
    return edited_segments(json.dumps(value), duration)


def process_local(source, folder, transcript, live=None):
    has_audio, duration = extract(source, folder)
    if transcript is not None and transcript.strip():
        segments = edited_segments(transcript, duration)
    elif has_audio or live:
        segments = []
        if has_audio:
            try:
                segments = transcribe(folder / "speech.wav")
            except TeachError:
                if not live:
                    raise
        if not segments and live:
            segments = live_segments(live, duration)
    else:
        raise TeachError("Video has no audio. Supply the guide's transcript before teaching.")
    if not segments:
        raise TeachError("No narration found; supply a corrected transcript")
    segments = [{**s, "start": min(s["start"], duration), "end": min(s["end"], duration)}
                for s in segments if s["start"] < duration]
    paths = sorted(folder.glob("frame-*.jpg"))
    picked = range(len(paths)) if len(paths) <= MAX_FRAMES else sorted(
        {round(k * (len(paths) - 1) / (MAX_FRAMES - 1)) for k in range(MAX_FRAMES)})
    frames = [(i, paths[i].read_bytes()) for i in picked]  # Index = seconds at 1 frame/second.
    return frames, segments


def check_request(route_id, filename, data):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", route_id):
        raise TeachError("Invalid route ID")
    if (data / "routes" / route_id).exists() or (data / "drafts" / route_id).exists():
        raise TeachError("Route ID already exists; choose a new version", 409)
    if not (filename or "").lower().endswith(SUFFIXES):
        raise TeachError("Upload an MP4, MOV or WebM video")


async def save_upload(upload, source: Path):
    size = 0
    with source.open("wb") as out:
        while chunk := await upload.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                raise TeachError("Maximum video size is 120 MB", 413)
            out.write(chunk)


class Clock:
    def __init__(self):
        self.started = time.monotonic()
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.events = []

    def event(self, name):
        self.events.append({"event": name, "seconds": round(time.monotonic() - self.started, 3),
                            "timestamp": datetime.now(timezone.utc).isoformat()})


def place_name(text):
    """"this is our meeting room" → "Meeting room"."""
    name = re.sub(r"^(this|here|that)( is|'s)( the| our| your| a)?\s+", "", text.strip(),
                  flags=re.IGNORECASE).strip(" .!")
    return name[:1].upper() + name[1:]


def remembered(draft):
    """Names read back to the guide as "places remembered": start, named places, destination."""
    names = [draft.origin_label, *(p.name for p in draft.places), draft.destination_label]
    if len([n for n in names if n.strip()]) < 2:
        names += [c.short_name for c in draft.checkpoints]
    seen, unique = set(), []
    for name in map(place_name, names):
        if name and name.casefold() not in seen:
            seen.add(name.casefold())
            unique.append(name)
    return unique


async def learn(source, folder, route_id, transcript, data, provider, live=None, hints=None,
                clock=None):
    """Video → local frames and transcript → one VLM draft → a draft bundle for human review."""
    clock = clock or Clock()
    # Shield local worker so cancellation cannot remove files beneath FFmpeg/Whisper.
    worker = asyncio.create_task(asyncio.to_thread(process_local, source, folder, transcript, live))
    try:
        frames, segments = await asyncio.shield(worker)
    except asyncio.CancelledError:
        await worker
        raise
    clock.event("transcribed_locally")
    draft = await provider.draft(route_id, frames, segments, hints or {})
    route = draft.route
    if route.route_id != route_id:
        raise TeachError("Draft route ID did not match request")
    spoken = " ".join(" ".join(s["text"].split()) for s in segments)
    for step in route.steps:
        if step.voice_cue and " ".join(step.voice_cue.split()) not in spoken:
            step.voice_cue = ""  # Never retain a cue invented from image content.
    draft.hazards = [h for h in draft.hazards if h.step_index < len(route.steps)]
    draft.checkpoints = draft.checkpoints[:len(route.steps)]
    clock.event("draft_ready_for_human_review")
    destination = data / "drafts" / route_id
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Atomic publication of the draft bundle, never a replayable route.
    with tempfile.TemporaryDirectory(dir=destination.parent, prefix=".draft-") as staging:
        stage = Path(staging) / "bundle"
        stage.mkdir()
        (stage / "route.json").write_text(route.model_dump_json(indent=2), encoding="utf-8")
        (stage / "transcript.json").write_text(json.dumps(segments, indent=2), encoding="utf-8")
        (stage / "teach-log.json").write_text(json.dumps({
            "started_at": clock.started_at, "pre_recorded": True, "events": clock.events,
        }, indent=2), encoding="utf-8")
        # AI readings pre-fill the review form; they never publish by themselves.
        (stage / "suggestions.json").write_text(
            draft.model_dump_json(indent=2, exclude={"route"}), encoding="utf-8")
        # Blank short_name / expected_seconds make prepare refuse until a reviewer fills them.
        (stage / "review.json").write_text(json.dumps({
            "origin": {"description": "", "required_text": [], "required_features": [],
                       "short_name": ""},
            "checkpoints": [{"description": s.landmark, "required_text": [],
                             "required_features": [], "short_name": "",
                             "expected_seconds": 0} for s in route.steps],
            "arrival": "You have reached the outside of the destination. Route finished.",
            "destination_is_exterior": False, "sample": False,
        }, indent=2), encoding="utf-8")
        stage.rename(destination)
    return draft


async def ingest_upload(upload, route_id, transcript, data, provider, live=None, hints=None):
    check_request(route_id, upload.filename, data)
    clock = Clock()
    # All raw video, extracted speech and keyframes disappear on success AND exceptions.
    with tempfile.TemporaryDirectory(prefix="offixed-teach-") as tmp:
        folder = Path(tmp)
        source = folder / ("source" + Path(upload.filename).suffix.lower())
        await save_upload(upload, source)
        clock.event("video_imported")
        draft = await learn(source, folder, route_id, transcript, data, provider, live, hints,
                            clock)
    return draft.route
