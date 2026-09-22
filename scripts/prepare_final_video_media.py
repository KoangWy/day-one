#!/usr/bin/env python3
"""Build the three final-video demo clips from the shared timeline contract.

Sources are downloaded once into ignored runtime storage, kept untouched, and then
tone-mapped from HLG/BT.2020 into SDR BT.709 1080p H.264/AAC fast-start MP4s whose
narration, chime and original teacher audio are baked into one track.

Run from anywhere:
    cd apps/server && uv run python ../../scripts/prepare_final_video_media.py
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import math
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TIMELINE_PATH = ROOT / "apps/web/src/demo/timeline.json"
RUNTIME = ROOT / "data/runtime/final-video"
SOURCE_DIR = RUNTIME / "source"
WORK_DIR = RUNTIME / "generated"
TTS_DIR = WORK_DIR / "tts"
LOG_DIR = RUNTIME / "logs"
OUT_DIR = ROOT / "apps/web/public/demo-media"
DRIVE_URL = "https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"
HDR_TRANSFERS = {"arib-std-b67", "smpte2084", "bt2020-10", "bt2020-12"}
DURATION_TOLERANCE = 0.05


def run(cmd: list[str], label: str, capture: bool = False) -> str:
    printable = " ".join(str(part) for part in cmd)
    print(f"\n$ {printable}", flush=True)
    result = subprocess.run(cmd, check=False, text=True, capture_output=capture)
    if capture:
        if result.stdout:
            print(result.stdout.strip(), flush=True)
        if result.stderr:
            print(result.stderr.strip(), file=sys.stderr, flush=True)
    if result.returncode != 0:
        raise SystemExit(f"{label} failed with exit code {result.returncode}")
    return result.stdout or ""


def require_tools() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if shutil.which(tool) is None:
            raise SystemExit(f"{tool} is required on PATH")


def probe(path: Path) -> dict:
    raw = run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=index,codec_type,codec_name,width,height,pix_fmt,color_transfer,avg_frame_rate",
        "-of", "json", str(path),
    ], f"ffprobe {path.name}", capture=True)
    return json.loads(raw)


def probe_duration(path: Path) -> float:
    raw = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
              f"ffprobe duration {path.name}", capture=True)
    return float(raw.strip())


def download_source(spec: dict, force: bool = False) -> Path:
    target = SOURCE_DIR / spec["file"]
    if target.exists() and target.stat().st_size > 1_000_000 and not force:
        print(f"source present: {target} ({target.stat().st_size} bytes)")
        return target
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    url = DRIVE_URL.format(file_id=spec["fileId"])
    print(f"\ndownloading {spec['file']} from {url}", flush=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
    part = target.with_suffix(target.suffix + ".part")
    with urllib.request.urlopen(request, timeout=120) as response, part.open("wb") as handle:
        shutil.copyfileobj(response, handle, length=1 << 20)
    if part.stat().st_size < 1_000_000:
        raise SystemExit(f"{spec['file']} download looks truncated ({part.stat().st_size} bytes)")
    part.replace(target)
    print(f"downloaded {target} ({target.stat().st_size} bytes)")
    return target


def verify_source(spec: dict, path: Path) -> None:
    info = probe(path)
    duration = float(info["format"]["duration"])
    video = next(stream for stream in info["streams"] if stream["codec_type"] == "video")
    if abs(duration - spec["durationSeconds"]) > DURATION_TOLERANCE:
        raise SystemExit(f"{path.name}: duration {duration:.6f}s does not match contract {spec['durationSeconds']}s")
    if (video["width"], video["height"]) != (spec["width"], spec["height"]):
        raise SystemExit(f"{path.name}: {video['width']}x{video['height']} does not match contract")
    print(f"source ok: {path.name} {duration:.6f}s {video['width']}x{video['height']} {video['codec_name']} "
          f"{video.get('color_transfer')} {video.get('pix_fmt')}")


def scale_chain(width: int, height: int, fps: int, color_transfer: str | None, with_fps: bool = True) -> str:
    if color_transfer in HDR_TRANSFERS:
        scale = (
            f"scale={width}:{height}:flags=lanczos"
            f":in_primaries=bt2020:in_transfer={color_transfer}:in_color_matrix=bt2020nc"
            ":out_primaries=bt709:out_transfer=bt709:out_color_matrix=bt709:in_range=tv:out_range=tv"
        )
    else:
        scale = f"scale={width}:{height}:flags=lanczos"
    parts = [scale]
    if with_fps:
        parts.append(f"fps={fps}")
    parts += ["setsar=1", "format=yuv420p"]
    return ",".join(parts)


def encode_args(encode: dict) -> list[str]:
    return [
        "-c:v", "libx264", "-profile:v", "high", "-preset", encode["videoPreset"],
        "-crf", str(encode["videoCrf"]), "-pix_fmt", "yuv420p",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    ]


def tts_cache_key(voice: str, text: str, rate: str) -> str:
    return hashlib.sha1(f"{voice}\0{rate}\0{text}".encode()).hexdigest()[:16]


async def synthesize(text: str, voice: str, rate: str, target: Path) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(target))


def ensure_tts(timeline: dict, scene_id: str, cues: list[dict]) -> dict[str, Path]:
    import edge_tts  # noqa: F401  (fail fast with a clear message when the dependency is missing)

    TTS_DIR.mkdir(parents=True, exist_ok=True)
    voice = timeline["ttsVoice"]
    default_rate = timeline.get("ttsRate", "+0%")
    files: dict[str, Path] = {}
    for cue in cues:
        if cue.get("rate"):
            ladder = [cue["rate"]]
        else:
            ladder = list(dict.fromkeys([default_rate, "+0%", "+5%", "+10%", "+15%", "+20%", "+25%", "+30%"]))
        chosen: tuple[str, Path, float] | None = None
        last: tuple[str, float] | None = None
        for rate in ladder:
            raw = TTS_DIR / f"{scene_id}-{cue['id']}-{tts_cache_key(voice, cue['text'], rate)}.mp3"
            if not raw.exists() or raw.stat().st_size < 1024:
                print(f"\nsynthesizing {scene_id}/{cue['id']} at {rate}: {cue['text']!r} ({voice})", flush=True)
                asyncio.run(synthesize(cue["text"], voice, rate, raw))
            trimmed, duration = trim_speech(raw)
            last = (rate, duration)
            if duration <= cue["windowSeconds"]:
                chosen = (rate, trimmed, duration)
                break
        if chosen is None:
            assert last is not None
            raise SystemExit(
                f"{scene_id}/{cue['id']}: speech is {last[1]:.3f}s at {last[0]} but only "
                f"{cue['windowSeconds']}s is available; shorten the sentence or widen the window"
            )
        rate, trimmed, duration = chosen
        cue["rate"] = rate
        cue["measuredSeconds"] = round(duration, 3)
        print(f"tts {scene_id}/{cue['id']}: {duration:.3f}s / {cue['windowSeconds']}s window at {rate}")
        files[cue["id"]] = trimmed
    return files


SILENCE_THRESHOLD = "-45dB"
SILENCE_MINIMUM = 0.15
LEAD_PADDING = 0.05
TAIL_PADDING = 0.15


def silence_bounds(path: Path) -> tuple[float, float]:
    """Return the first and last audible moment of a speech clip.

    edge-tts pads every clip with roughly a second of leading and trailing silence, so
    the raw file duration is not the spoken duration. A trailing silence usually ends
    at the end of the file, which is why the end bound has to be matched against the
    file duration instead of only against an unmatched ``silence_start``.
    """
    total = probe_duration(path)
    result = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af",
         f"silencedetect=n={SILENCE_THRESHOLD}:d={SILENCE_MINIMUM}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    text = result.stderr
    starts = [float(value) for value in re.findall(r"silence_start: (-?[0-9.]+)", text)]
    ends = [float(value) for value in re.findall(r"silence_end: (-?[0-9.]+)", text)]
    leading = ends[0] if starts and starts[0] <= 0.02 and ends else 0.0
    trailing = total
    if starts:
        last_start = starts[-1]
        matched_to_end = bool(ends) and starts[-1] <= ends[-1] and abs(ends[-1] - total) <= 0.06
        if matched_to_end or (not ends) or (ends and last_start > ends[-1]):
            trailing = last_start
    if trailing - leading < 0.1:
        return 0.0, total
    return leading, trailing


def trim_speech(raw: Path) -> tuple[Path, float]:
    """Trim the padding edge-tts adds on both sides of the sentence."""
    total = probe_duration(raw)
    leading, trailing = silence_bounds(raw)
    start = max(0.0, leading - LEAD_PADDING)
    end = min(total, trailing + TAIL_PADDING)
    if end - start < 0.1:
        start, end = 0.0, total
    tag = hashlib.sha1(f"{start:.3f}:{end:.3f}".encode()).hexdigest()[:8]
    target = raw.with_name(f"{raw.stem}.t{int(LEAD_PADDING * 1000)}-{int(TAIL_PADDING * 1000)}-{tag}.wav")
    if target.exists() and target.stat().st_size > 1024:
        return target, probe_duration(target)
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(raw),
        "-af", f"atrim=start={start:.4f}:end={end:.4f},asetpts=N/SR/TB",
        "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(target),
    ], f"trim speech {target.name}")
    return target, probe_duration(target)


def anchor_seconds(scene: dict, anchor: str, source_seconds: float) -> float:
    if anchor == "lead":
        return 0.0
    if anchor == "loading":
        return scene["leadSeconds"] + source_seconds
    if anchor == "learned":
        return scene["leadSeconds"] + source_seconds + scene["loadingSeconds"]
    raise SystemExit(f"unknown anchor {anchor!r}")


def cue_times(scene: dict, source_seconds: float) -> list[dict]:
    cues = []
    for cue in scene["tts"]:
        if "anchor" in cue:
            at = anchor_seconds(scene, cue["anchor"], source_seconds) + cue.get("offset", 0)
        else:
            at = cue["at"]
        cues.append({**cue, "at": at})
    return cues


def extract_still(source: Path, chain: str, at: float, target: Path) -> None:
    run([
        "ffmpeg", "-y", "-v", "error", "-ss", f"{at:.3f}", "-i", str(source),
        "-frames:v", "1", "-vf", chain, str(target),
    ], f"still frame {target.name}")


def build_teach_video(scene: dict, spec: dict, source: Path, encode: dict, target: Path) -> None:
    width, height, fps = encode["width"], encode["height"], encode["fps"]
    total = scene["leadSeconds"] + spec["durationSeconds"] + scene["loadingSeconds"] + scene["tailSeconds"]
    total_frames = math.ceil(total * fps)
    source_chain = scale_chain(width, height, fps, spec.get("colorTransfer"))
    # Stills are tone-mapped once while they are extracted; the concat inputs only need the
    # same size, frame rate, sample aspect ratio and pixel format as the source segment.
    still_source_chain = scale_chain(width, height, fps, spec.get("colorTransfer"), with_fps=False)
    still_input_chain = scale_chain(width, height, fps, None)
    first, last = WORK_DIR / "teach-first.png", WORK_DIR / "teach-last.png"
    extract_still(source, still_source_chain, 0.0, first)
    extract_still(source, still_source_chain, max(0.0, spec["durationSeconds"] - 0.1), last)
    lead = scene["leadSeconds"]
    tail = scene["loadingSeconds"] + scene["tailSeconds"]
    graph = (
        f"[0:v]{still_input_chain}[v0];"
        f"[1:v]{source_chain}[v1];"
        f"[2:v]{still_input_chain}[v2];"
        f"[v0][v1][v2]concat=n=3:v=1:a=0[v]"
    )
    run([
        "ffmpeg", "-y", "-v", "error",
        "-loop", "1", "-framerate", str(fps), "-t", f"{lead:.3f}", "-i", str(first),
        "-i", str(source),
        "-loop", "1", "-framerate", str(fps), "-t", f"{tail:.3f}", "-i", str(last),
        "-filter_complex", graph, "-map", "[v]", "-an", *encode_args(encode),
        "-frames:v", str(total_frames), str(target),
    ], "teach base video")


def build_single_video(scene: dict, spec: dict, source: Path, encode: dict, target: Path) -> None:
    width, height, fps = encode["width"], encode["height"], encode["fps"]
    chain = scale_chain(width, height, fps, spec.get("colorTransfer"))
    clip_start = scene.get("clipStartSeconds", 0)
    seconds = scene.get("clipSeconds", spec["durationSeconds"])
    frames = math.ceil(seconds * fps) if "clipSeconds" in scene else math.ceil(spec["durationSeconds"] * fps)
    inputs: list[str] = []
    if clip_start:
        inputs += ["-ss", f"{clip_start:.3f}"]
    inputs += ["-i", str(source)]
    if "clipSeconds" in scene:
        inputs += ["-t", f"{scene['clipSeconds']:.3f}"]
    run([
        "ffmpeg", "-y", "-v", "error", *inputs, "-an", "-vf", chain, *encode_args(encode),
        "-frames:v", str(frames), str(target),
    ], f"{scene['media']} base video")


def chime_filters(scene: dict, first_index: int) -> tuple[list[str], list[str], int]:
    at = scene["chimeAtSeconds"]
    tones = [(880.0, 0.13, at), (659.25, 0.20, at + 0.13)]
    inputs: list[str] = []
    filters: list[str] = []
    labels: list[str] = []
    index = first_index
    for frequency, seconds, delay in tones:
        inputs += ["-f", "lavfi", "-t", f"{seconds:.3f}", "-i",
                   f"sine=frequency={frequency:.2f}:sample_rate=48000:duration={seconds:.3f}"]
        filters.append(
            f"[{index}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.35,"
            f"adelay=delays={int(round(delay * 1000))}:all=1[c{index}]"
        )
        labels.append(f"[c{index}]")
        index += 1
    return inputs, filters, index


def mix_audio(scene: dict, spec: dict, source: Path, cues: list[dict], tts_files: dict[str, Path],
              total: float, target: Path) -> None:
    inputs = ["-f", "lavfi", "-t", f"{total:.6f}", "-i", "anullsrc=r=48000:cl=stereo"]
    filters = [f"[0:a]atrim=0:{total:.6f},aformat=sample_rates=48000:channel_layouts=stereo[a0]"]
    labels = ["[a0]"]
    index = 1
    if scene.get("keepSourceAudio"):
        inputs += ["-i", str(source)]
        delay = int(round(scene["leadSeconds"] * 1000))
        filters.append(
            f"[{index}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
            f"adelay=delays={delay}:all=1[a{index}]"
        )
        labels.append(f"[a{index}]")
        index += 1
    for cue in cues:
        inputs += ["-i", str(tts_files[cue["id"]])]
        filters.append(
            f"[{index}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
            f"adelay=delays={int(round(cue['at'] * 1000))}:all=1[a{index}]"
        )
        labels.append(f"[a{index}]")
        index += 1
    if "chimeAtSeconds" in scene:
        chime_inputs, chime_filter, index = chime_filters(scene, index)
        inputs += chime_inputs
        filters += chime_filter
        labels += [f"[c{i}]" for i in range(index - 2, index)]
    filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:duration=longest:normalize=0[aout]")
    run([
        "ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filters),
        "-map", "[aout]", "-t", f"{total:.6f}", "-c:a", "pcm_s16le", str(target),
    ], f"{scene['media']} audio mix")


def mux(base: Path, audio: Path, encode: dict, total: float, target: Path) -> None:
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(base), "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
        "-c:a", "aac", "-b:a", encode["audioBitrate"], "-ar", str(encode["audioSampleRate"]), "-ac", "2",
        "-t", f"{total:.6f}", "-movflags", "+faststart", str(target),
    ], f"{target.name} mux")


def has_faststart(path: Path) -> bool:
    with path.open("rb") as handle:
        offset = 0
        for _ in range(16):
            handle.seek(offset)
            header = handle.read(8)
            if len(header) < 8:
                return False
            size = int.from_bytes(header[:4], "big")
            kind = header[4:8].decode("latin-1")
            if kind == "moov":
                return True
            if kind == "mdat" or size <= 0:
                return False
            offset += size
    return False


def verify_output(expected: float, encode: dict, path: Path) -> dict:
    info = probe(path)
    duration = float(info["format"]["duration"])
    size = int(info["format"]["size"])
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    problems = []
    frame = 1.0 / encode["fps"]
    if video is None or video["codec_name"] != "h264":
        problems.append("video is not H.264")
    if audio is None or audio["codec_name"] != "aac":
        problems.append("audio is not AAC")
    if video and (video["width"], video["height"]) != (encode["width"], encode["height"]):
        problems.append(f"resolution {video['width']}x{video['height']}")
    if video and video["pix_fmt"] != "yuv420p":
        problems.append(f"pixel format {video['pix_fmt']}")
    if abs(duration - expected) > max(frame, DURATION_TOLERANCE):
        problems.append(f"duration {duration:.4f}s vs {expected:.4f}s")
    if not has_faststart(path):
        problems.append("moov atom is not before mdat (fast-start)")
    if problems:
        raise SystemExit(f"{path.name}: " + "; ".join(problems))
    print(f"verified {path.name}: {duration:.3f}s (target {expected:.3f}s) {video['width']}x{video['height']} "
          f"{video['codec_name']}/{audio['codec_name']} {size / 1e6:.2f} MB fast-start")
    return {"file": path.name, "seconds": round(duration, 3), "targetSeconds": round(expected, 3),
            "bytes": size, "megabytes": round(size / 1e6, 2), "video": video["codec_name"],
            "audio": audio["codec_name"], "width": video["width"], "height": video["height"]}


def build_scene(scene_id: str, timeline: dict) -> dict:
    scene = timeline["scenes"][scene_id]
    spec = timeline["sources"][scene["source"]]
    encode = timeline["encode"]
    source = SOURCE_DIR / spec["file"]
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cues = cue_times(scene, spec["durationSeconds"])
    tts_files = ensure_tts(timeline, scene_id, cues)
    if "clipSeconds" in scene:
        total = scene["clipSeconds"]
    elif "leadSeconds" in scene:
        total = scene["leadSeconds"] + spec["durationSeconds"] + scene["loadingSeconds"] + scene["tailSeconds"]
    else:
        total = spec["durationSeconds"]
    base, audio = WORK_DIR / f"{scene_id}-video.mp4", WORK_DIR / f"{scene_id}-audio.wav"
    if "leadSeconds" in scene:
        build_teach_video(scene, spec, source, encode, base)
    else:
        build_single_video(scene, spec, source, encode, base)
    mix_audio(scene, spec, source, cues, tts_files, total, audio)
    target = OUT_DIR / scene["media"]
    mux(base, audio, encode, total, target)
    report = verify_output(total, encode, target)
    report["scene"] = scene_id
    report["source"] = spec["file"]
    report["media"] = scene["media"]
    report["tts"] = [{"id": cue["id"], "text": cue["text"], "at": round(cue["at"], 3),
                      "seconds": cue["measuredSeconds"], "rate": cue.get("rate")} for cue in cues]
    report["clipStartSeconds"] = scene.get("clipStartSeconds")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scene", action="append", choices=["teach", "route", "collision"],
                        help="build only this scene (repeatable)")
    parser.add_argument("--force-download", action="store_true", help="re-download the Drive sources")
    parser.add_argument("--verify-only", action="store_true", help="only verify the built clips")
    args = parser.parse_args()

    require_tools()
    timeline = json.loads(TIMELINE_PATH.read_text())
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    report_path = WORK_DIR / "media-report.json"
    scene_ids = args.scene or ["teach", "route", "collision"]
    reports = []
    for scene_id in scene_ids:
        scene = timeline["scenes"][scene_id]
        spec = timeline["sources"][scene["source"]]
        print(f"\n=== {scene_id} ({scene['media']}) ===")
        if not args.verify_only:
            source = download_source(spec, force=args.force_download)
            verify_source(spec, source)
            reports.append(build_scene(scene_id, timeline))
        else:
            target = OUT_DIR / scene["media"]
            if not target.exists():
                raise SystemExit(f"{target} is missing; run without --verify-only first")
            if "clipSeconds" in scene:
                total = scene["clipSeconds"]
            elif "leadSeconds" in scene:
                total = scene["leadSeconds"] + spec["durationSeconds"] + scene["loadingSeconds"] + scene["tailSeconds"]
            else:
                total = spec["durationSeconds"]
            previous = {}
            if report_path.exists():
                previous = next((item for item in json.loads(report_path.read_text()).get("clips", [])
                                 if item.get("scene") == scene_id), {})
            # Verification refreshes the measured fields but keeps the tts and clip metadata
            # recorded by the build that produced the file.
            report = {**previous, **verify_output(total, timeline["encode"], target),
                      "scene": scene_id, "source": spec["file"], "media": scene["media"]}
            reports.append(report)

    existing = {}
    if report_path.exists():
        existing = {item["scene"]: item for item in json.loads(report_path.read_text()).get("clips", [])}
    for item in reports:
        existing[item["scene"]] = item
    report_path.write_text(json.dumps({
        "voice": timeline["ttsVoice"],
        "encode": timeline["encode"],
        "clips": [existing[key] for key in ["teach", "route", "collision"] if key in existing],
    }, indent=2) + "\n")

    print("\n=== summary ===")
    for item in reports:
        print(f"{item['scene']:9s} {item['media']:14s} {item['seconds']:7.3f}s  {item['megabytes']:6.2f} MB  "
              f"{item['width']}x{item['height']} {item['video']}/{item['audio']}")
    print(f"\nreport: {report_path}")
    print(f"clips:  {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
