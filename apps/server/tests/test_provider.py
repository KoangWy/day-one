import json

import httpx
import pytest

from navigation.models import Checkpoint, Evidence
from navigation.provider import OpenCode, ProviderUnavailable


def test_pictogram_checkpoint_needs_all_distinctive_features():
    checkpoint = Checkpoint(description="toilet exterior", required_text=[],
                            required_features=["two wheelchair signs", "louvered door"],
                            question="Are you outside the toilet?")
    base = {"matched": True, "observed_text": "", "observed_features": "Two signs on wood beside louvers",
            "text_readable": False, "contradictory": False, "matched_features": ["f0"]}
    assert Evidence(**base).supports(checkpoint) is False
    base["matched_features"] = ["f0", "f1"]
    assert Evidence(**base).supports(checkpoint) is True
    base["contradictory"] = True
    assert Evidence(**base).supports(checkpoint) is False


def test_no_generic_unconstrained_checkpoint():
    with pytest.raises(ValueError):
        Checkpoint(description="hallway", required_text=[], required_features=[], question="Here?")


@pytest.mark.parametrize("bad_response", [False, True])
async def test_opencode_adapter_uses_schema_and_rejects_malformed_output(monkeypatch, bad_response):
    monkeypatch.setenv("OPENCODE_API_KEY", "fake-test-key")
    seen = []

    def handle(request):
        body = json.loads(request.content)
        assert request.url.path == "/zen/go/v1/chat/completions"
        assert body["response_format"]["json_schema"]["strict"] is True
        assert request.headers["User-Agent"] == "offixed-day-one-demo/0.1"
        assert body["messages"][0]["content"][1]["image_url"]["url"].startswith("data:image/jpeg;base64,")
        seen.append(body)
        evidence = {"matched": True, "observed_text": "3", "observed_features": "floor sign",
                    "text_readable": True, "contradictory": False, "matched_features": []}
        return httpx.Response(200, json={"choices": [{"message": {
            "content": "not JSON" if bad_response else json.dumps(evidence),
        }}]})

    original = httpx.AsyncClient
    monkeypatch.setattr("navigation.provider.httpx.AsyncClient",
                        lambda **kwargs: original(transport=httpx.MockTransport(handle), **kwargs))
    provider = OpenCode()
    checkpoint = Checkpoint(description="Floor 3", required_text=["3"], question="Here?")
    if bad_response:
        with pytest.raises(ProviderUnavailable):
            await provider.match(b"test-image", checkpoint)
    else:
        assert (await provider.match(b"test-image", checkpoint)).supports(checkpoint)
    assert len(seen) == 1  # No silent retries or provider fallbacks.
