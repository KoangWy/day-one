import re

import pytest

from navigation.config import ROOT
from navigation.models import Observation, ObserveResponse, OriginCheckpoint, Review, Route
from navigation.phrases import build_phrases

LIFT = ROOT / "data/examples/lift-lobby-to-toilet-v2"


@pytest.fixture
def lift():
    route = Route.model_validate_json((LIFT / "route.json").read_text(encoding="utf-8"))
    review = Review.model_validate_json((LIFT / "review.json").read_text(encoding="utf-8"))
    return route, review


def test_two_step_route_has_53_keys(lift):
    phrases = build_phrases(*lift)
    assert len(phrases) == 53
    assert len([k for k in phrases if k.startswith("origin-")]) == 15
    assert len([k for k in phrases if k.startswith("s0-")]) == 17
    assert len([k for k in phrases if k.startswith("s1-")]) == 16
    assert {k for k in phrases if not re.match(r"(origin|s\d)-", k)} == {
        "arrival", "arrival-unverified", "vision-down", "vision-down-origin", "vision-back"}
    assert "s1-reached" not in phrases  # The last checkpoint goes straight to arrival.
    assert all(re.fullmatch(r"[a-z0-9-]{1,64}", k) for k in phrases)


def test_template_phrases_use_reviewed_text(lift):
    route, review = lift
    phrases = build_phrases(route, review)
    assert phrases["origin-instruction"] == review.origin_instruction
    assert phrases["origin-retry"] == review.origin_retry
    assert phrases["origin-found"] == (
        "Lift lobby found. Tap Next or say next for the first direction.")
    assert phrases["s0-instruction"] == route.steps[0].instruction
    assert phrases["s0-reached"] == "Office sign reached. Tap Next or say next when ready."
    assert phrases["s0-lost"] == (
        "I haven't found the office sign yet. Stop and turn slowly. Last passed: Lift lobby.")
    assert phrases["s1-lost"] == (
        "I haven't found the toilet entrance yet. Stop and turn slowly. Last passed: office sign.")
    assert phrases["s0-where"] == "Last passed: Lift lobby. Heading to: office sign."
    assert phrases["s1-where"] == "Last passed: office sign. Heading to: toilet entrance."
    assert phrases["s1-override"] == (
        "Continue using saved directions without the camera finding the toilet entrance?")
    assert phrases["arrival"] == review.arrival


def test_voice_cue_is_quoted_after_instruction(lift):
    route, review = lift
    route.steps[1].voice_cue = "Toilet is here"
    assert build_phrases(route, review)["s1-instruction"] == (
        route.steps[1].instruction + ' Guide said: "Toilet is here".')


def test_hints_describe_the_frame_never_a_turn(lift):
    phrases = build_phrases(*lift)
    assert phrases["origin-hint-candidate-left-far"] == "Possible floor number 3, ahead, slightly left."
    assert phrases["origin-hint-matched-ahead-near"] == "Floor number 3 close, straight ahead."
    assert phrases["s0-hint-candidate-right-near"] == "Possible office sign close, slightly right."
    assert phrases["s0-hint-matched-right-far"] == "Office sign, ahead, slightly right."
    assert phrases["s1-hint-candidate-ahead-far"] == "Possible toilet entrance, straight ahead."
    hints = [text for key, text in phrases.items() if "-hint-" in key]
    assert len(hints) == 36
    assert not any(re.search(r"\bturn\b|\bgo\b|\bwalk\b", text, re.I) for text in hints)


CHECKPOINT = OriginCheckpoint(description="Floor 3", required_text=["3"], short_name="floor 3")


def observed(**change):
    return Observation(**dict({
        "matched": True, "observed_text": "3", "observed_features": "floor sign",
        "text_readable": True, "contradictory": False, "matched_features": [],
        "target_visible": True, "position": "left", "distance": "far",
        "hazards_visible": []}, **change))


@pytest.mark.parametrize("change,expected", [
    ({}, ("matched", "left", "far")),
    # "matched" needs the full evidence bar, even if the model says target_visible=false.
    ({"target_visible": False, "position": None, "distance": None}, ("matched", None, None)),
    ({"observed_text": "8"}, ("candidate", "left", "far")),
    ({"matched": False, "text_readable": False, "observed_text": ""}, ("candidate", "left", "far")),
    ({"matched": False, "target_visible": False}, ("none", None, None)),
    ({"contradictory": True}, ("none", None, None)),
])
def test_classification(change, expected):
    result = ObserveResponse.classify(-1, observed(**change), CHECKPOINT)
    assert (result.target, result.position, result.distance) == expected
    assert result.step_index == -1
