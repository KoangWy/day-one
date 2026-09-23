import io
import json
import shutil
from pathlib import Path

import pytest
from fastapi import UploadFile
from pydantic import ValidationError

from navigation.config import ROOT
from navigation.models import Route, Suggestion, TeachDraft
from navigation.prepare import prepare
from navigation.provider import ProviderUnavailable
from navigation.storage import Store
from navigation.teach import TeachError, edited_segments, extract, ingest_upload

SAMPLE = ROOT / "data/examples/office-to-toilet-sample"
LIFT = ROOT / "data/examples/lift-lobby-to-toilet-v2"


async def dummy_tts(text, path):
    path.write_bytes(b"dummy-audio" * 100)


def teach_draft(route, **change):
    guess = Suggestion(short_name="", description="", sign_text=[], features=[], seen_at_second=0)
    return TeachDraft(**dict(dict(route=route, origin_label="Office", destination_label="Toilet",
                                  origin=guess, checkpoints=[], hazards=[], places=[]), **change))


async def test_publication_is_atomic_and_failed_audio_never_visible(tmp_path):
    calls = 0

    async def failing_tts(text, path):
        nonlocal calls
        calls += 1
        if calls == 4:
            raise RuntimeError("TTS unavailable")
        path.write_bytes(b"dummy-audio" * 100)

    with pytest.raises(RuntimeError):
        await prepare(SAMPLE, tmp_path, "Test reviewer", failing_tts)
    assert Store(tmp_path).list() == []
    assert list((tmp_path / "routes").iterdir()) == []


async def test_reviewed_unicode_text_survives_publication_on_any_locale(tmp_path):
    # Reviewers save UTF-8 in their editor; Windows defaults to cp1252 without explicit encoding.
    bundle = tmp_path / "input"
    shutil.copytree(SAMPLE, bundle)
    config = json.loads((bundle / "review.json").read_text(encoding="utf-8"))
    config["checkpoints"][0]["short_name"] = "café sign → Tường’s door"
    (bundle / "review.json").write_text(json.dumps(config, ensure_ascii=False), encoding="utf-8")
    spoken = []

    async def tts(text, path):
        spoken.append(text)
        path.write_bytes(b"dummy-audio" * 100)

    await prepare(bundle, tmp_path, "Reviewer Nguyễn", tts)
    published = Store(tmp_path).get("office-to-toilet-sample")
    phrase = "Café sign → Tường’s door reached. Tap Next or say next when ready."
    assert published.assets.phrases["s0-reached"] == phrase
    assert published.assets.steps[0].short_name == "café sign → Tường’s door"
    assert published.reviewer == "Reviewer Nguyễn"
    assert phrase in spoken


async def test_publication_requires_correct_checkpoint_count_and_exterior(tmp_path):
    bundle = tmp_path / "input"
    shutil.copytree(SAMPLE, bundle)
    config = json.loads((bundle / "review.json").read_text())
    config["destination_is_exterior"] = False
    (bundle / "review.json").write_text(json.dumps(config))
    with pytest.raises(ValueError, match="exterior"):
        await prepare(bundle, tmp_path, "Test")
    config["destination_is_exterior"] = True
    config["checkpoints"].pop()
    (bundle / "review.json").write_text(json.dumps(config))
    with pytest.raises(ValueError, match="Each step"):
        await prepare(bundle, tmp_path, "Test")


@pytest.mark.parametrize("fail", [True, False])
async def test_ingest_cleanup_draft_only_and_voice_quote_provenance(tmp_path, monkeypatch, fail):
    local_dirs = []

    def local(source, folder, transcript, live=None):
        local_dirs.append(folder)
        (folder / "speech.wav").write_bytes(b"private audio")
        (folder / "frame-0001.jpg").write_bytes(b"private frame")
        return [(0, b"FRAME")], [{"start": 0, "end": 1, "text": "A real guide cue"}]

    class Provider:
        async def draft(self, route_id, frames, segments, hints):
            assert frames[0][1] == b"FRAME"
            if fail:
                raise ProviderUnavailable()
            route = Route.model_validate_json((SAMPLE / "route.json").read_text())
            route.route_id = route_id
            route.steps[0].voice_cue = "Invented cold air"
            route.steps[1].voice_cue = "A real guide cue"
            return teach_draft(route)

    monkeypatch.setattr("navigation.teach.process_local", local)
    upload = UploadFile(filename="test.mp4", file=io.BytesIO(b"test video"))
    if fail:
        with pytest.raises(ProviderUnavailable):
            await ingest_upload(upload, "real-route", None, tmp_path, Provider())
        assert not (tmp_path / "drafts/real-route").exists()
    else:
        result = await ingest_upload(upload, "real-route", "manual", tmp_path, Provider())
        assert result.steps[0].voice_cue == ""
        assert result.steps[1].voice_cue == "A real guide cue"
        draft = tmp_path / "drafts/real-route"
        skeleton = json.loads((draft / "review.json").read_text(encoding="utf-8"))
        assert skeleton["checkpoints"][0]["short_name"] == ""
        assert skeleton["checkpoints"][0]["expected_seconds"] == 0
        assert skeleton["origin"]["short_name"] == ""
        # An unreviewed draft can never be published.
        with pytest.raises(ValidationError):
            await prepare(draft, tmp_path, "Test", dummy_tts)
        assert not (tmp_path / "routes/real-route").exists()
    assert all(not folder.exists() for folder in local_dirs)
    assert Store(tmp_path).list() == []
    assert not list(tmp_path.rglob("*.jpg"))
    assert not list(tmp_path.rglob("*.wav"))


async def test_cleanup_when_local_processing_fails(tmp_path, monkeypatch):
    folders = []

    def fail(source, folder, transcript, live=None):
        folders.append(folder)
        raise TeachError("Invalid video")

    monkeypatch.setattr("navigation.teach.process_local", fail)
    with pytest.raises(TeachError):
        await ingest_upload(UploadFile(filename="a.mp4", file=io.BytesIO(b"bad")), "a", None, tmp_path, None)
    assert all(not folder.exists() for folder in folders)


def test_manual_transcript_timestamp_validation():
    assert edited_segments("Go straight", 10) == [{"start": 0, "end": 10, "text": "Go straight"}]
    with pytest.raises(TeachError):
        edited_segments('[{"start":10,"end":2,"text":"turn"}]', 12)
    with pytest.raises(TeachError):
        edited_segments('[{"start":0,"end":20,"text":"turn"}]', 12)


def test_corrupt_video_uses_real_ffmpeg_and_fails(tmp_path):
    source = tmp_path / "broken.mp4"
    source.write_bytes(b"not a video")
    with pytest.raises(TeachError):
        extract(source, tmp_path)


def test_no_audio_requires_manual_transcript(tmp_path, monkeypatch):
    from navigation.teach import process_local
    monkeypatch.setattr("navigation.teach.extract", lambda *args: (False, 10))
    with pytest.raises(TeachError, match="no audio"):
        process_local(Path("video.mp4"), tmp_path, None)


@pytest.mark.parametrize("change", [
    lambda c: c["checkpoints"][0].pop("short_name"),
    lambda c: c["checkpoints"][0].update(short_name=""),
    lambda c: c["checkpoints"][0].update(short_name="   "),
    lambda c: c["checkpoints"][0].update(short_name="x" * 41),
    lambda c: c["checkpoints"][1].pop("expected_seconds"),
    lambda c: c["checkpoints"][1].update(expected_seconds=0),
    lambda c: c["checkpoints"][1].update(expected_seconds=601),
    lambda c: c["checkpoints"][1].update(expected_seconds=8.5),
    lambda c: c["origin"].pop("short_name"),
    lambda c: c["origin"].update(expected_seconds=8),
    lambda c: c["checkpoints"][0].update(question="Are you here?"),
])
async def test_publication_requires_short_names_and_expected_seconds(tmp_path, change):
    bundle = tmp_path / "input"
    shutil.copytree(LIFT, bundle)
    config = json.loads((bundle / "review.json").read_text(encoding="utf-8"))
    change(config)
    (bundle / "review.json").write_text(json.dumps(config), encoding="utf-8")
    with pytest.raises(ValidationError):
        await prepare(bundle, tmp_path, "Test", dummy_tts)
    assert Store(tmp_path).list() == []


async def test_two_step_route_publishes_53_phrases_each_with_one_mp3(tmp_path):
    spoken = {}

    async def tts(text, path):
        spoken[path.stem] = text
        path.write_bytes(b"dummy-audio" * 100)

    published = await prepare(LIFT, tmp_path, "Team Offixed", tts)
    phrases = published.assets.phrases
    assert len(phrases) == 53
    assert spoken == phrases
    audio = tmp_path / "routes/lift-lobby-to-toilet-v2/audio"
    assert sorted(p.stem for p in audio.iterdir()) == sorted(phrases)
    assert [s.model_dump() for s in published.assets.steps] == [
        {"short_name": "office sign", "expected_seconds": 8, "hazards": []},
        {"short_name": "toilet entrance", "expected_seconds": 10, "hazards": []},
    ]
    assert published.assets.origin_label == "Lift lobby"
    assert published.assets.sample is False
    served = Store(tmp_path).get("lift-lobby-to-toilet-v2")
    assert served.route.steps[0].instruction == phrases["s0-instruction"]


async def test_route_list_skips_routes_published_under_the_old_schema(tmp_path):
    await prepare(LIFT, tmp_path, "Team Offixed", dummy_tts)
    old = tmp_path / "routes/lift-lobby-to-toilet-v1"
    old.mkdir()
    (old / "published.json").write_text(json.dumps({"route": {}, "assets": {"origin_audio": ""}}),
                                        encoding="utf-8")
    assert [r.route_id for r in Store(tmp_path).list()] == ["lift-lobby-to-toilet-v2"]


def test_live_transcript_is_clamped_to_the_video():
    from navigation.teach import live_segments
    text = json.dumps([{"start": 1, "end": 4, "text": "Turn around"},
                       {"start": 9.5, "end": 10.4, "text": "This is the meeting room"}])
    assert live_segments(text, 10) == [{"start": 1, "end": 4, "text": "Turn around"},
                                       {"start": 9.5, "end": 10, "text": "This is the meeting room"}]
    with pytest.raises(TeachError):
        live_segments("not json", 10)
    with pytest.raises(TeachError):
        live_segments(json.dumps([{"start": 3, "end": 2, "text": "backwards"}]), 10)


@pytest.mark.parametrize("whisper,expected", [
    ("works", "Whisper heard this"),
    ("fails", "The phone heard this"),
    ("silent", "The phone heard this"),
])
def test_phone_transcript_is_the_fallback_for_whisper(tmp_path, monkeypatch, whisper, expected):
    from navigation import teach
    monkeypatch.setattr(teach, "extract", lambda *args: (True, 10))

    def transcribe(path):
        if whisper == "fails":
            raise TeachError("Transcription failed")
        return [] if whisper == "silent" else [{"start": 0, "end": 2, "text": "Whisper heard this"}]
    monkeypatch.setattr(teach, "transcribe", transcribe)
    (tmp_path / "frame-0001.jpg").write_bytes(b"FRAME")
    live = json.dumps([{"start": 0, "end": 2, "text": "The phone heard this"}])
    frames, segments = teach.process_local(Path("walk.webm"), tmp_path, None, live)
    assert frames == [(0, b"FRAME")]
    assert segments[0]["text"] == expected


def test_long_walks_send_at_most_48_evenly_spaced_frames(tmp_path, monkeypatch):
    from navigation import teach
    monkeypatch.setattr(teach, "extract", lambda *args: (False, 120))
    for i in range(120):
        (tmp_path / f"frame-{i + 1:04d}.jpg").write_bytes(bytes([i]))
    frames, _ = teach.process_local(Path("walk.mp4"), tmp_path, "Go straight", None)
    seconds = [s for s, _ in frames]
    assert len(frames) == 48 and seconds[0] == 0 and seconds[-1] == 119
    assert all(data == bytes([s]) for s, data in frames)


def test_probe_without_ffprobe_reads_ffmpeg_summary(tmp_path, monkeypatch):
    from navigation import teach
    monkeypatch.setattr(teach, "tool", lambda name: "ffmpeg" if name == "ffmpeg" else None)
    summary = ("Input #0, matroska,webm, from 'walk.webm':\n  Duration: N/A, start: 0.000\n"
               "  Stream #0:0(eng): Video: vp8, yuv420p\n  Stream #0:1(eng): Audio: opus, 48000 Hz\n")
    monkeypatch.setattr(teach, "report", lambda source, *extra: summary if not extra else
                        summary + "frame= 900 fps=0.0 time=00:00:29.97 bitrate=N/A\n"
                        "frame= 1100 fps=0.0 time=00:00:36.60 bitrate=N/A\n")
    assert teach.probe(tmp_path / "walk.webm") == (0, {"matroska", "webm"}, True)
    assert teach.measure(tmp_path / "walk.webm") == 36.6
