import io
import json
import shutil
from pathlib import Path

import pytest
from fastapi import UploadFile

from navigation.config import ROOT
from navigation.models import Route
from navigation.prepare import prepare
from navigation.provider import ProviderUnavailable
from navigation.storage import Store
from navigation.teach import TeachError, edited_segments, extract, ingest_upload

SAMPLE = ROOT / "data/examples/office-to-toilet-sample"


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
    question = "Are you at the café sign → I’m sure?"
    config["checkpoints"][0]["question"] = question
    (bundle / "review.json").write_text(json.dumps(config, ensure_ascii=False), encoding="utf-8")
    spoken = []

    async def tts(text, path):
        spoken.append(text)
        path.write_bytes(b"dummy-audio" * 100)

    await prepare(bundle, tmp_path, "Reviewer Nguyễn", tts)
    published = Store(tmp_path).get("office-to-toilet-sample")
    assert published.assets.checkpoint_questions[0] == question
    assert published.reviewer == "Reviewer Nguyễn"
    assert question in spoken


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

    def local(source, folder, transcript):
        local_dirs.append(folder)
        (folder / "speech.wav").write_bytes(b"private audio")
        (folder / "frame-0001.jpg").write_bytes(b"private frame")
        return [(0, b"FRAME")], [{"start": 0, "end": 1, "text": "A real guide cue"}]

    class Provider:
        async def draft(self, route_id, frames, segments):
            assert frames[0][1] == b"FRAME"
            if fail:
                raise ProviderUnavailable()
            route = Route.model_validate_json((SAMPLE / "route.json").read_text())
            route.route_id = route_id
            route.steps[0].voice_cue = "Invented cold air"
            route.steps[1].voice_cue = "A real guide cue"
            return route

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
        assert (tmp_path / "drafts/real-route/review.json").exists()
    assert all(not folder.exists() for folder in local_dirs)
    assert Store(tmp_path).list() == []
    assert not list(tmp_path.rglob("*.jpg"))
    assert not list(tmp_path.rglob("*.wav"))


async def test_cleanup_when_local_processing_fails(tmp_path, monkeypatch):
    folders = []

    def fail(source, folder, transcript):
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
