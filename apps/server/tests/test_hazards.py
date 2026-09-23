import json
import shutil

import pytest
from pydantic import ValidationError

from navigation.config import ROOT
from navigation.models import Hazard, Observation, ObserveResponse, Review, Route
from navigation.phrases import APP_PHRASES, build_phrases
from navigation.prepare import prepare
from navigation.storage import Store

LIFT = ROOT / "data/examples/lift-lobby-to-toilet-v2"
GLASS = {"kind": "glass-door", "warning": "Be careful. A glass door is in front of you.",
         "action": "Push the door open and go through.",
         "features": ["Frameless glass door across the corridor"]}
AUTO = {"kind": "automatic-door", "warning": "Be careful. Automatic door ahead.",
        "features": ["Sliding glass entrance doors"]}


async def fake_tts(text, path):
    path.write_bytes(b"test-only-not-real-audio" * 20)


def lift(**review_change):
    route = Route.model_validate_json((LIFT / "route.json").read_text(encoding="utf-8"))
    data = json.loads((LIFT / "review.json").read_text(encoding="utf-8"))
    data.update(review_change)
    return route, data


def with_hazards(data, *hazards, step=1):
    data["checkpoints"][step]["hazards"] = list(hazards)
    return data


def test_hazard_phrases_warn_then_say_how_to_pass():
    route, data = lift()
    review = Review.model_validate(with_hazards(data, GLASS, AUTO))
    phrases = build_phrases(route, review)
    assert phrases["s1-watch"] == "On the way: a glass door and an automatic door."
    assert phrases["s1-hazard-0"] == GLASS["warning"]
    assert phrases["s1-hazard-0-action"] == GLASS["action"]
    assert phrases["s1-hazard-1"] == AUTO["warning"]
    assert "s1-hazard-1-action" not in phrases  # No action, no empty sentence.
    assert "s0-watch" not in phrases
    assert len(phrases) == 53 + 4


def test_other_hazard_is_named_by_its_first_feature():
    route, data = lift()
    other = {"kind": "other", "warning": "Be careful. Wet floor sign.", "features": ["Yellow wet floor sign"]}
    phrases = build_phrases(route, Review.model_validate(with_hazards(data, other, step=0)))
    assert phrases["s0-watch"] == "On the way: yellow wet floor sign."


@pytest.mark.parametrize("hazard", [
    dict(GLASS, kind="lava"), dict(GLASS, warning=""), dict(GLASS, warning="..."),
    dict(GLASS, features=[]), dict(GLASS, features=["a", "b", "c", "d"]),
    dict(GLASS, warning="x" * 201), dict(GLASS, extra="not allowed"),
])
def test_hazards_need_a_kind_a_spoken_warning_and_visual_features(hazard):
    with pytest.raises(ValidationError):
        Hazard.model_validate(hazard)


def test_at_most_three_hazards_per_step():
    _, data = lift()
    with pytest.raises(ValidationError):
        Review.model_validate(with_hazards(data, GLASS, GLASS, GLASS, GLASS))


def observation(ids):
    return Observation(matched=False, observed_text="", observed_features="corridor",
                       text_readable=False, contradictory=False, matched_features=[],
                       target_visible=False, position=None, distance=None, hazards_visible=ids)


def test_only_saved_hazard_ids_come_back():
    _, data = lift()
    review = Review.model_validate(with_hazards(data, GLASS, AUTO))
    step = review.checkpoints[1]
    assert ObserveResponse.classify(1, observation(["h1", "h0", "h0"]), step).hazards == [0, 1]
    # Invented IDs, IDs past the saved list and free text are dropped, not errors.
    assert ObserveResponse.classify(1, observation(["h2", "h9", "glass door"]), step).hazards == []
    assert ObserveResponse.classify(0, observation(["h0"]), review.checkpoints[0]).hazards == []
    assert ObserveResponse.classify(-1, observation(["h0"]), review.origin).hazards == []


async def test_published_route_lists_hazard_kinds_and_destination(tmp_path):
    bundle = tmp_path / "bundle"
    shutil.copytree(LIFT, bundle)
    _, data = lift(destination_label="Restroom")
    (bundle / "review.json").write_text(json.dumps(with_hazards(data, GLASS)), encoding="utf-8")
    published = await prepare(bundle, tmp_path, "Test", fake_tts)
    assert published.assets.destination_label == "Restroom"
    assert [s.hazards for s in published.assets.steps] == [[], ["glass-door"]]
    assert (tmp_path / "routes/lift-lobby-to-toilet-v2/audio/s1-hazard-0-action.mp3").is_file()


async def test_routes_published_before_hazards_still_load(tmp_path):
    await prepare(LIFT, tmp_path, "Test", fake_tts)
    file = tmp_path / "routes/lift-lobby-to-toilet-v2/published.json"
    old = json.loads(file.read_text(encoding="utf-8"))
    old["assets"].pop("destination_label")
    for step in old["assets"]["steps"]:
        step.pop("hazards")
    for checkpoint in old["review"]["checkpoints"]:
        checkpoint.pop("hazards")
    file.write_text(json.dumps(old), encoding="utf-8")
    published = Store(tmp_path).get("lift-lobby-to-toilet-v2")
    assert published.review.destination() == "Toilet entrance"
    assert published.assets.steps[1].hazards == []


def test_app_phrases_are_fixed_keys():
    assert APP_PHRASES["obstacle-person"] == "Be careful. Someone is in front of you."
    assert {"setup-1", "setup-2", "setup-3", "setup-4", "teach-recording", "teach-learned"} <= set(APP_PHRASES)
    assert all(k.replace("-", "").isalnum() and k.islower() for k in APP_PHRASES)
