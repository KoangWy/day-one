import asyncio
import base64
import io

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image

from navigation.models import Observation
from navigation.provider import ProviderUnavailable

ROUTE = "office-to-toilet-sample"


def payload(jpeg, index=0):
    return {"route_id": ROUTE, "step_index": index, "image_jpeg_640": jpeg}


def observation(**change):
    return Observation(**dict({
        "matched": True, "observed_text": "PANTRY", "observed_features": "counter on the left",
        "text_readable": True, "contradictory": False, "matched_features": [],
        "target_visible": True, "position": "left", "distance": "near",
    }, **change))


async def test_observe_contract_and_no_image_storage(setup, jpeg):
    client, provider, published, _, root = setup
    before = set(root.rglob("*"))
    routes = (await client.get("/routes")).json()
    assert set(routes[0]) == {"route_id", "steps"}
    assert set(routes[0]["steps"][0]) == {"id", "instruction", "landmark", "voice_cue"}
    response = await client.post("/observe", json=payload(jpeg))
    assert response.status_code == 200
    assert response.json() == {"step_index": 0, "target": "matched", "position": "ahead",
                               "distance": "near"}
    assert response.headers["cache-control"] == "no-store"
    assert set(root.rglob("*")) == before


async def test_origin_is_step_minus_one(setup, jpeg):
    client, provider, *_ = setup
    provider.result = observation(observed_text="OFFICE", position="right", distance="far")
    data = (await client.post("/observe", json=payload(jpeg, -1))).json()
    assert data == {"step_index": -1, "target": "matched", "position": "right", "distance": "far"}


@pytest.mark.parametrize("change", [
    {"observed_text": "MEETING B"}, {"text_readable": False}, {"observed_features": ""},
    {"observed_text": "PANTRYPLUS"}, {"matched": False},
])
async def test_insufficient_evidence_is_only_a_candidate(setup, jpeg, change):
    client, provider, *_ = setup
    provider.result = observation(**change)
    data = (await client.post("/observe", json=payload(jpeg))).json()
    assert data == {"step_index": 0, "target": "candidate", "position": "left", "distance": "near"}


@pytest.mark.parametrize("change", [
    {"contradictory": True},
    {"matched": False, "target_visible": False, "position": None, "distance": None},
    # Contradictory model output is cleaned, not treated as an error.
    {"matched": False, "target_visible": False, "position": "left", "distance": "far"},
    {"contradictory": True, "target_visible": True, "position": "ahead", "distance": "near"},
])
async def test_nothing_visible_or_contradictory_is_none_without_position(setup, jpeg, change):
    client, provider, *_ = setup
    provider.result = observation(**change)
    data = (await client.post("/observe", json=payload(jpeg))).json()
    assert data == {"step_index": 0, "target": "none", "position": None, "distance": None}


@pytest.mark.parametrize("change,status", [
    ({"route_id": "missing"}, 404), ({"step_index": 4}, 422), ({"step_index": -2}, 422),
    ({"step_index": True}, 422), ({"image_jpeg_640": "PRIVATE-IMAGE-INPUT"}, 422),
    ({"route_id": "../secrets"}, 422), ({"extra": "not allowed"}, 422),
])
async def test_invalid_requests_do_not_call_provider_or_echo_input(setup, jpeg, change, status):
    client, provider, *_ = setup
    response = await client.post("/observe", json=dict(payload(jpeg), **change))
    assert response.status_code == status
    assert provider.calls == 0
    assert "PRIVATE-IMAGE-INPUT" not in response.text
    assert jpeg not in response.text


@pytest.mark.parametrize("format,size", [("PNG", (640, 360)), ("JPEG", (641, 360))])
async def test_reject_wrong_format_or_oversized_image(setup, format, size):
    client, provider, *_ = setup
    out = io.BytesIO()
    Image.new("RGB", size).save(out, format=format)
    response = await client.post("/observe", json=payload(base64.b64encode(out.getvalue()).decode()))
    assert response.status_code == 422
    assert provider.calls == 0


async def test_provider_error_and_deadline_are_503(setup, jpeg):
    client, provider, _, app, _ = setup
    provider.error = ProviderUnavailable("PRIVATE PROVIDER REQUEST")
    response = await client.post("/observe", json=payload(jpeg))
    assert response.status_code == 503
    assert response.json()["detail"] == "Visual check unavailable"
    assert "PRIVATE" not in response.text

    async def slow(*args):
        await asyncio.sleep(1)
    provider.observe = slow
    app.state.observe_timeout = .01
    assert (await client.post("/observe", json=payload(jpeg))).status_code == 503


async def test_fifth_concurrent_observe_is_busy(setup, jpeg):
    client, provider, *_ = setup
    release = asyncio.Event()
    started = []

    async def blocked(jpeg, checkpoint):
        started.append(checkpoint)
        await release.wait()
        return observation()
    provider.observe = blocked
    running = [asyncio.create_task(client.post("/observe", json=payload(jpeg))) for _ in range(4)]
    for _ in range(200):
        if len(started) == 4:
            break
        await asyncio.sleep(.01)
    assert len(started) == 4
    busy = await client.post("/observe", json=payload(jpeg))
    assert busy.status_code == 503
    assert busy.json()["detail"] == "Visual check busy"
    assert len(started) == 4
    release.set()
    assert [r.status_code for r in await asyncio.gather(*running)] == [200] * 4
    assert (await client.post("/observe", json=payload(jpeg))).status_code == 200


async def test_remote_ingest_and_cross_origin_blocked_before_parsing(setup):
    client, _, _, app, _ = setup
    async with AsyncClient(transport=ASGITransport(app=app, client=("192.168.1.10", 1000)), base_url="http://test") as remote:
        assert (await remote.post("/ingest-video", content=b"no body parsed")).status_code == 403
    assert (await client.post("/ingest-video", headers={"Origin": "https://evil.example"})).status_code == 403
    assert (await client.post("/observe", headers={"Origin": "https://evil.example"})).status_code == 403
    assert (await client.post("/observe", headers={"Content-Length": "900001"})).status_code == 413


async def test_assets_v2_and_old_endpoints_are_gone(setup, jpeg):
    client, _, published, *_ = setup
    data = (await client.get(f"/routes/{ROUTE}/assets")).json()
    assert set(data) == {"origin_label", "sample", "steps", "phrases"}
    assert data["steps"][0] == {"short_name": "pantry sign", "expected_seconds": 10}
    assert data["sample"] is True
    assert data["phrases"]["s0-reached"] == "Pantry sign reached. Tap Next or say next when ready."
    assert (await client.post("/replay", json=payload(jpeg))).status_code in (404, 405)
    assert (await client.get(f"/audio/{ROUTE}_origin.mp3")).status_code == 404


async def test_speech_serves_published_file_without_tts(setup):
    client, _, _, app, root = setup
    calls = []

    async def tts(text, path):
        calls.append(text)
    app.state.speech.tts = tts
    response = await client.get(f"/speech/{ROUTE}/s0-reached.mp3")
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert response.content == (root / "routes" / ROUTE / "audio" / "s0-reached.mp3").read_bytes()
    assert calls == []


@pytest.mark.parametrize("path", [
    f"/speech/{ROUTE}/not-a-phrase.mp3",
    f"/speech/{ROUTE}/..%2F..%2Fpublished.mp3",
    f"/speech/{ROUTE}/..%2Fpublished.json.mp3",
    f"/speech/{ROUTE}/S0-REACHED.mp3",
    f"/speech/{ROUTE}/s0-reached.wav",
    "/speech/missing-route/s0-reached.mp3",
    "/speech/..%2Fsecrets/s0-reached.mp3",
])
async def test_speech_rejects_unknown_keys_and_traversal(setup, path):
    client, *_ = setup
    assert (await client.get(path)).status_code == 404


async def test_missing_speech_is_generated_once_into_cache_not_route(setup):
    client, _, published, app, root = setup
    audio = root / "routes" / ROUTE / "audio"
    (audio / "s1-lost.mp3").unlink()
    calls = []

    async def slow_tts(text, path):
        calls.append(text)
        await asyncio.sleep(.05)
        path.write_bytes(b"generated-audio" * 20)
    app.state.speech.tts = slow_tts
    first, second = await asyncio.gather(client.get(f"/speech/{ROUTE}/s1-lost.mp3"),
                                         client.get(f"/speech/{ROUTE}/s1-lost.mp3"))
    assert first.status_code == second.status_code == 200
    assert first.content == second.content == b"generated-audio" * 20
    assert calls == [published.assets.phrases["s1-lost"]]
    cached = list((root / "tts-cache").iterdir())
    assert len(cached) == 1 and cached[0].suffix == ".mp3"
    assert not (audio / "s1-lost.mp3").exists()
    assert (await client.get(f"/speech/{ROUTE}/s1-lost.mp3")).status_code == 200
    assert len(calls) == 1


async def test_speech_tts_failure_is_503_and_leaves_nothing(setup):
    client, _, _, app, root = setup
    (root / "routes" / ROUTE / "audio" / "arrival.mp3").unlink()

    async def failing(text, path):
        path.write_bytes(b"partial")
        raise RuntimeError("PRIVATE TTS ERROR")
    app.state.speech.tts = failing
    response = await client.get(f"/speech/{ROUTE}/arrival.mp3")
    assert response.status_code == 503
    assert "PRIVATE" not in response.text
    assert list((root / "tts-cache").iterdir()) == []

    async def hangs(text, path):
        await asyncio.sleep(1)
    app.state.speech.tts = hangs
    app.state.speech.timeout = .01
    assert (await client.get(f"/speech/{ROUTE}/arrival.mp3")).status_code == 503
