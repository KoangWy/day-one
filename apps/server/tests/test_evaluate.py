import json

from PIL import Image

from navigation.config import ROOT
from navigation.evaluate import evaluate, percentile
from navigation.models import Observation
from navigation.prepare import prepare

LIFT = ROOT / "data/examples/lift-lobby-to-toilet-v2"


async def fake_tts(text, path):
    path.write_bytes(b"test-only-not-real-audio" * 20)


class ScriptedProvider:
    label = "Scripted provider"

    def __init__(self, script):
        self.script = script
        self.seen = []

    async def observe(self, jpeg, checkpoint):
        self.seen.append((len(jpeg), checkpoint.short_name))
        target = self.script.pop(0)
        if target == "error":
            raise RuntimeError("provider down")
        return Observation(
            matched=target == "matched", observed_text=" ".join(checkpoint.required_text),
            observed_features="seen", text_readable=True, contradictory=False,
            matched_features=[f"f{i}" for i in range(len(checkpoint.required_features))],
            hazards_visible=[],
            target_visible=target != "none", position="left" if target != "none" else None,
            distance="far" if target != "none" else None)


async def test_evaluation_reports_false_positives_candidates_and_latency(tmp_path):
    Image.new("RGB", (1280, 720), "white").save(tmp_path / "frame.jpg")
    published = await prepare(LIFT, tmp_path / "data", "Test", fake_tts)
    inline = {"description": "Floor 3", "required_text": ["3"], "short_name": "floor number 3"}
    cases = [
        {"id": "origin", "image": "frame.jpg", "expected": True, "checkpoint": inline},
        {"id": "office", "image": "frame.jpg", "expected": True, "step_index": 0},
        {"id": "toilet", "image": "frame.jpg", "expected": True, "step_index": 1},
        {"id": "neg-1", "image": "frame.jpg", "expected": False, "step_index": 0},
        {"id": "neg-2", "image": "frame.jpg", "expected": False, "step_index": 1},
        {"id": "neg-3", "image": "frame.jpg", "expected": False, "step_index": -1},
        {"id": "broken", "image": "missing.jpg", "expected": False, "step_index": 0},
    ]
    (tmp_path / "cases.json").write_text(json.dumps(cases), encoding="utf-8")
    provider = ScriptedProvider(["matched", "candidate", "matched", "matched", "none", "candidate"])
    summary = await evaluate(tmp_path / "cases.json", tmp_path / "out.json", provider, published)

    assert provider.seen[0][1] == "floor number 3"
    assert provider.seen[1][1] == "office sign"
    assert provider.seen[5][1] == "floor number 3"
    assert all(size < 100_000 for size, _ in provider.seen)
    assert summary["true_positives"] == 2
    assert summary["false_positives"] == 1
    assert summary["candidate_rate_positive"] == round(1 / 3, 3)
    assert summary["candidate_rate_negative"] == round(1 / 3, 3)
    assert summary["errors"] == 1
    assert summary["p50_ms"] is not None and summary["p95_ms"] is not None
    saved = json.loads((tmp_path / "out.json").read_text(encoding="utf-8"))
    assert saved["results"][1] == {**saved["results"][1], "target": "candidate",
                                   "position": "left", "distance": "far", "step_index": 0}
    assert "image_jpeg_640" not in (tmp_path / "out.json").read_text(encoding="utf-8")


def test_percentile_nearest_rank():
    assert percentile([], .95) is None
    assert percentile([3000], .95) == 3000
    assert percentile(list(range(1, 21)), .95) == 19
    assert percentile([1, 2, 3, 4], .5) == 2
