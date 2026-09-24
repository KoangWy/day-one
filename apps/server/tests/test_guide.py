import asyncio
import json
import shutil

import pytest
from httpx import ASGITransport, AsyncClient

from navigation.config import ROOT
from navigation.models import (
    HazardSuggestion,
    Place,
    Route,
    Suggestion,
    TeachDraft,
)
from navigation.phrases import APP_PHRASES
from navigation.prepare import prepare
from navigation.provider import ProviderUnavailable
from navigation.teach import TeachError

LIFT = ROOT / "data/examples/lift-lobby-to-toilet-v2"
SAMPLE_ROUTE = "office-to-toilet-sample"


async def fake_tts(text, path):
    path.write_bytes(b"test-only-not-real-audio" * 20)


def remote(app, **headers):
    return AsyncClient(transport=ASGITransport(app=app, client=("192.168.1.10", 1000)),
                       base_url="http://test", headers=headers)


def draft_for(route_id):
    route = Route.model_validate_json((LIFT / "route.json").read_text(encoding="utf-8"))
    route.route_id = route_id
    return TeachDraft(
        route=route, origin_label="Lift lobby", destination_label="Meeting room",
        origin=Suggestion(short_name="floor number 3", description="Number 3 by the lift",
                          sign_text=["3"], features=["Large numeral beside the lift"],
                          seen_at_second=1),
        checkpoints=[
            Suggestion(short_name="office sign", description="Office sign", sign_text=["OFFICE"],
                       features=["Glass frontage"], seen_at_second=9),
            Suggestion(short_name="meeting room sign", description="Room 2.3.001",
                       sign_text=["2.3.001"], features=["Wooden door"], seen_at_second=21.4),
        ],
        hazards=[HazardSuggestion(step_index=1, kind="glass-door",
                                  warning="Be careful. A glass door is in front of you.",
                                  action="Push the door open and go through.", features=[]),
                 HazardSuggestion(step_index=4, kind="stairs", warning="Be careful. Stairs.",
                                  action="", features=["stairs"])],
        places=[Place(name="Lift lobby", at_second=0), Place(name="Meeting room", at_second=21)],
    )


@pytest.fixture
def teaching(setup, monkeypatch):
    """Local video processing and the VLM replaced; everything else runs for real."""
    client, provider, _, app, root = setup
    folders = []

    def local(source, folder, transcript, live=None):
        folders.append((folder, source.read_bytes(), live))
        return [(0, b"FRAME")], [{"start": 0, "end": 2, "text": "This is the meeting room"}]

    async def draft(route_id, frames, segments, hints):
        provider.hints = hints
        return draft_for(route_id)

    monkeypatch.setattr("navigation.teach.process_local", local)
    provider.draft = draft
    return client, provider, app, root, folders


async def teach(client, **fields):
    files = {"video": ("walk.mp4", b"private walk video", "video/mp4")}
    data = {"origin_label": "Lift lobby", "destination_label": "Meeting room", **fields}
    response = await client.post("/guide/teach", files=files, data=data)
    assert response.status_code == 202, response.text
    job = response.json()
    assert job["status"] == "learning"
    for _ in range(200):
        status = (await client.get(f"/guide/teach/{job['job_id']}")).json()
        if status["status"] != "learning":
            return status
        await asyncio.sleep(.01)
    raise AssertionError("teaching never finished")


async def test_catalog_names_both_ends_of_every_route(setup):
    client, _, _, app, root = setup
    bundle = root / "lift"

    shutil.copytree(LIFT, bundle)
    review = json.loads((bundle / "review.json").read_text(encoding="utf-8"))
    review["destination_label"] = "Restroom"
    (bundle / "review.json").write_text(json.dumps(review), encoding="utf-8")
    await prepare(bundle, root, "Test", fake_tts)
    catalog = (await client.get("/catalog")).json()
    assert catalog == [
        {"route_id": "lift-lobby-to-toilet-v2", "origin_label": "Lift lobby",
         "destination_label": "Restroom", "origin_place": "lift-lobby",
         "destination_place": "restroom", "steps": 2, "hazards": 0, "sample": False},
        {"route_id": SAMPLE_ROUTE, "origin_label": "Office entrance",
         "destination_label": "Toilet sign", "origin_place": "office-entrance",
         "destination_place": "toilet-sign", "steps": 4, "hazards": 0, "sample": True},
    ]


async def test_app_speech_serves_only_built_in_phrases(setup):
    client, _, _, app, root = setup
    assert (await client.get("/app-phrases")).json() == APP_PHRASES
    spoken = []

    async def tts(text, path):
        spoken.append(text)
        path.write_bytes(b"generated-audio" * 20)
    app.state.speech.tts = tts
    response = await client.get("/app-speech/obstacle-person.mp3")
    assert response.status_code == 200 and response.headers["content-type"] == "audio/mpeg"
    assert spoken == ["Be careful. Someone is in front of you."]
    for path in ["/app-speech/not-a-phrase.mp3", "/app-speech/..%2Fsecrets.mp3",
                 f"/speech/{SAMPLE_ROUTE}/obstacle-person.mp3", "/app-speech/s0-reached.mp3"]:
        assert (await client.get(path)).status_code == 404, path


async def test_guide_api_needs_the_laptop_or_the_guide_code(setup, monkeypatch):
    _, _, _, app, _ = setup
    monkeypatch.delenv("TEACH_PIN", raising=False)
    async with remote(app) as phone:
        assert (await phone.get("/guide/access")).json() == {"allowed": False,
                                                             "pin_configured": False}
        assert (await phone.get("/guide/drafts")).status_code == 403
        assert (await phone.post("/guide/teach", content=b"no body parsed")).status_code == 403
    monkeypatch.setenv("TEACH_PIN", "4821")
    async with remote(app, **{"X-Teach-Pin": "4821"}) as phone:
        assert (await phone.get("/guide/access")).json() == {"allowed": True,
                                                             "pin_configured": True}
        assert (await phone.get("/guide/drafts")).json() == []
    async with remote(app, **{"X-Teach-Pin": "0000"}) as phone:
        assert (await phone.get("/guide/drafts")).status_code == 403
    monkeypatch.setenv("TEACH_PIN", "12")  # Too short to protect anything: treated as unset.
    async with remote(app, **{"X-Teach-Pin": "12"}) as phone:
        assert (await phone.get("/guide/drafts")).status_code == 403


async def test_cross_origin_guide_writes_are_blocked(teaching):
    client, *_ = teaching
    evil = {"Origin": "https://evil.example"}
    assert (await client.post("/guide/teach", headers=evil)).status_code == 403
    assert (await client.delete("/guide/drafts/x", headers=evil)).status_code == 403


async def test_teach_learns_in_background_and_keeps_no_video(teaching):
    client, provider, app, root, folders = teaching
    live = json.dumps([{"start": 0, "end": 2, "text": "This is the meeting room"}])
    job = await teach(client, live_transcript=live)
    assert job["status"] == "learned", job
    assert job["route_id"] == "lift-lobby-to-meeting-room-v1"
    assert job["places"] == ["Lift lobby", "Meeting room"]
    assert job["steps"] == 2
    assert provider.hints == {"origin_label": "Lift lobby", "destination_label": "Meeting room"}
    (folder, video, sent_live), = folders
    assert video == b"private walk video" and sent_live == live
    assert not folder.exists()
    draft = root / "drafts" / job["route_id"]
    assert sorted(p.name for p in draft.iterdir()) == [
        "review.json", "route.json", "suggestions.json", "teach-log.json", "transcript.json"]
    assert not list(root.rglob("*.mp4"))
    # A second walk with the same places becomes the next version, never an overwrite.
    assert (await teach(client))["route_id"] == "lift-lobby-to-meeting-room-v2"


@pytest.mark.parametrize("error,message", [
    (TeachError("Teach video must be between 0 and 180 seconds"),
     "Teach video must be between 0 and 180 seconds"),
    (ProviderUnavailable("PRIVATE"), "Teach provider unavailable; nothing was saved"),
    (RuntimeError("PRIVATE"), "Learning failed; nothing was saved"),
])
async def test_failed_teaching_reports_why_and_saves_nothing(teaching, error, message):
    client, provider, app, root, folders = teaching

    async def broken(*args):
        raise error
    provider.draft = broken
    job = await teach(client)
    assert job["status"] == "failed" and job["message"] == message
    assert not folders[0][0].exists()
    assert not (root / "drafts").exists() or not list((root / "drafts").iterdir())


async def test_teach_rejects_other_files_before_learning(teaching):
    client, *_ = teaching
    files = {"video": ("walk.gif", b"GIF89a", "image/gif")}
    response = await client.post("/guide/teach", files=files)
    assert response.status_code == 422
    assert response.json()["detail"] == "Upload an MP4, MOV or WebM video"
    assert (await client.get("/guide/teach/unknown")).status_code == 404


async def test_review_form_is_prefilled_but_never_confirmed(teaching):
    client, *_ = teaching
    route_id = (await teach(client))["route_id"]
    listed = (await client.get("/guide/drafts")).json()
    assert [d["route_id"] for d in listed] == [route_id]
    assert listed[0]["places"] == ["Lift lobby", "Meeting room"]
    detail = (await client.get(f"/guide/drafts/{route_id}")).json()
    review = detail["review"]
    assert review["origin_label"] == "Lift lobby"
    assert review["origin_instruction"] == (
        "Stand at the lift lobby. Point the camera toward the floor number 3.")
    assert review["origin"]["required_text"] == ["3"]
    assert [c["short_name"] for c in review["checkpoints"]] == ["office sign", "meeting room sign"]
    assert [c["expected_seconds"] for c in review["checkpoints"]] == [9, 12]
    assert review["checkpoints"][1]["hazards"] == [{
        "kind": "glass-door", "warning": "Be careful. A glass door is in front of you.",
        "action": "Push the door open and go through.", "features": ["glass door"]}]
    assert review["checkpoints"][0]["hazards"] == []  # Step 4 does not exist: dropped.
    assert review["destination_label"] == "Meeting room"
    assert review["arrival"] == "You have arrived at the meeting room. Route finished. Camera stopped."
    assert review["destination_is_exterior"] is False
    assert detail["transcript"] == [{"start": 0, "end": 2, "text": "This is the meeting room"}]


async def test_publish_needs_confirmation_then_joins_the_catalog(teaching):
    client, *_ = teaching
    route_id = (await teach(client))["route_id"]
    detail = (await client.get(f"/guide/drafts/{route_id}")).json()
    body = {"route": detail["route"], "review": detail["review"], "reviewer": "Linh",
            "confirmed": False}
    url = f"/guide/drafts/{route_id}/publish"
    assert "Confirm" in (await client.post(url, json=body)).json()["detail"]
    body["confirmed"] = True
    refused = await client.post(url, json=body)
    assert refused.status_code == 422 and "exterior" in refused.json()["detail"]
    body["review"]["destination_is_exterior"] = True
    body["review"]["checkpoints"][0]["short_name"] = ""
    body["review"]["checkpoints"][1]["expected_seconds"] = "PRIVATE-TEXT"
    invalid = await client.post(url, json=body)
    assert invalid.status_code == 422
    fields = {f["field"] for f in invalid.json()["fields"]}
    assert {"review.checkpoints.0.short_name", "review.checkpoints.1.expected_seconds"} <= fields
    assert "PRIVATE-TEXT" not in invalid.text
    body["review"]["checkpoints"][0]["short_name"] = "office sign"
    body["review"]["checkpoints"][1]["expected_seconds"] = 14
    body["route"]["route_id"] = "someone-else"
    assert (await client.post(url, json=body)).status_code == 422
    body["route"]["route_id"] = route_id
    published = await client.post(url, json=body)
    assert published.status_code == 200, published.text
    assert published.json() == {"route_id": route_id, "phrases": 53 + 3}
    assert route_id in [r["route_id"] for r in (await client.get("/catalog")).json()]
    assert (await client.get("/guide/drafts")).json() == []
    assets = (await client.get(f"/routes/{route_id}/assets")).json()
    assert assets["destination_label"] == "Meeting room"
    assert assets["phrases"]["s1-hazard-0-action"] == "Push the door open and go through."


async def test_failed_speech_publishes_nothing_and_keeps_the_draft(teaching):
    client, _, app, root, _ = teaching
    route_id = (await teach(client))["route_id"]
    detail = (await client.get(f"/guide/drafts/{route_id}")).json()
    detail["review"]["destination_is_exterior"] = True

    async def offline(text, path):
        raise OSError("PRIVATE network error")
    app.state.tts = offline
    response = await client.post(f"/guide/drafts/{route_id}/publish", json={
        "route": detail["route"], "review": detail["review"], "reviewer": "Linh",
        "confirmed": True})
    assert response.status_code == 503 and "PRIVATE" not in response.text
    assert route_id not in [r["route_id"] for r in (await client.get("/catalog")).json()]
    assert [d["route_id"] for d in (await client.get("/guide/drafts")).json()] == [route_id]


async def test_delete_draft(teaching):
    client, *_ = teaching
    route_id = (await teach(client))["route_id"]
    assert (await client.delete(f"/guide/drafts/{route_id}")).status_code == 204
    assert (await client.get(f"/guide/drafts/{route_id}")).status_code == 404
    assert (await client.delete("/guide/drafts/Not_An_ID")).status_code == 404
    assert (await client.delete("/guide/drafts/..%2Froutes")).status_code in (404, 405)
    assert (await client.get("/catalog")).json()  # Published routes untouched.
