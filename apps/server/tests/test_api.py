import asyncio
import base64
import io

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image

from navigation.models import Evidence
from navigation.provider import ProviderUnavailable


def payload(jpeg, index=0):
    return {"route_id": "office-to-toilet-sample", "step_index": index, "image_jpeg_640": jpeg}


async def test_contract_saved_directions_and_no_replay_storage(setup, jpeg):
    client, provider, published, _, root = setup
    before = set(root.rglob("*"))
    routes = (await client.get("/routes")).json()
    assert set(routes[0]) == {"route_id", "steps"}
    assert set(routes[0]["steps"][0]) == {"id", "instruction", "landmark", "voice_cue"}
    response = await client.post("/replay", json=payload(jpeg))
    assert response.status_code == 200
    result = response.json()
    assert set(result) == {"matched", "instruction", "checkpoint_question", "audio_url"}
    assert result["instruction"] == published.route.steps[0].instruction
    assert result["matched"] is True
    assert response.headers["cache-control"] == "no-store"
    assert (await client.get(result["audio_url"])).headers["content-type"] == "audio/mpeg"
    assert set(root.rglob("*")) == before


@pytest.mark.parametrize("match", [True, False])
async def test_origin_never_returns_movement(setup, jpeg, match):
    client, provider, *_ = setup
    provider.result = Evidence(matched=match, observed_text="OFFICE", observed_features="office entrance",
                               text_readable=True, contradictory=False, matched_features=[])
    response = await client.post("/replay", json=payload(jpeg, -1))
    assert response.json()["instruction"] == ""
    assert response.json()["matched"] is match


@pytest.mark.parametrize("change", [
    {"observed_text": "MEETING B"}, {"text_readable": False}, {"contradictory": True},
    {"observed_features": ""}, {"observed_text": "PANTRYPLUS"}, {"matched": False},
])
async def test_insufficient_evidence_is_not_a_match(setup, jpeg, change):
    client, provider, *_ = setup
    provider.result = Evidence(**dict({"matched": True, "observed_text": "PANTRY",
        "observed_features": "counter on the left", "text_readable": True, "contradictory": False,
        "matched_features": []}, **change))
    data = (await client.post("/replay", json=payload(jpeg))).json()
    assert data["matched"] is False
    assert data["checkpoint_question"] == ""
    assert data["audio_url"] == ""


@pytest.mark.parametrize("change,status", [
    ({"route_id": "missing"}, 404), ({"step_index": 4}, 422), ({"step_index": -2}, 422),
    ({"step_index": True}, 422), ({"image_jpeg_640": "PRIVATE-IMAGE-INPUT"}, 422),
    ({"route_id": "../secrets"}, 422), ({"extra": "not allowed"}, 422),
])
async def test_invalid_requests_do_not_call_provider_or_echo_input(setup, jpeg, change, status):
    client, provider, *_ = setup
    response = await client.post("/replay", json=dict(payload(jpeg), **change))
    assert response.status_code == status
    assert provider.calls == 0
    assert "PRIVATE-IMAGE-INPUT" not in response.text
    assert jpeg not in response.text


@pytest.mark.parametrize("format,size", [("PNG", (640, 360)), ("JPEG", (641, 360))])
async def test_reject_wrong_format_or_oversized_image(setup, format, size):
    client, provider, *_ = setup
    out = io.BytesIO()
    Image.new("RGB", size).save(out, format=format)
    response = await client.post("/replay", json=payload(base64.b64encode(out.getvalue()).decode()))
    assert response.status_code == 422
    assert provider.calls == 0


async def test_provider_error_and_deadline_are_503(setup, jpeg):
    client, provider, _, app, _ = setup
    provider.error = ProviderUnavailable("PRIVATE PROVIDER REQUEST")
    response = await client.post("/replay", json=payload(jpeg))
    assert response.status_code == 503
    assert "PRIVATE" not in response.text

    async def slow(*args):
        await asyncio.sleep(1)
    provider.match = slow
    app.state.replay_timeout = .01
    assert (await client.post("/replay", json=payload(jpeg))).status_code == 503


async def test_remote_ingest_and_cross_origin_blocked_before_parsing(setup):
    client, _, _, app, _ = setup
    async with AsyncClient(transport=ASGITransport(app=app, client=("192.168.1.10", 1000)), base_url="http://test") as remote:
        assert (await remote.post("/ingest-video", content=b"no body parsed")).status_code == 403
    assert (await client.post("/ingest-video", headers={"Origin": "https://evil.example"})).status_code == 403
    assert (await client.post("/replay", headers={"Content-Length": "900001"})).status_code == 413


async def test_assets_and_unknown_audio(setup):
    client, _, published, *_ = setup
    data = (await client.get(f"/routes/{published.route.route_id}/assets")).json()
    assert len(data["steps"]) == 4
    assert data["sample"] is True
    assert (await client.get("/audio/nonexistent_origin.mp3")).status_code == 404
