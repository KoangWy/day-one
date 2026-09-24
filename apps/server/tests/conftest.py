import base64
import io

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image

from navigation.config import ROOT
from navigation.main import create_app
from navigation.models import Observation
from navigation.prepare import prepare

SAMPLE = ROOT / "data/examples/office-to-toilet-sample"
LIFT = ROOT / "data/examples/lift-lobby-to-toilet-v2"


async def fake_tts(text, path):
    path.write_bytes(b"test-only-not-real-audio" * 20)


class FakeProvider:
    calls = 0
    result = None
    error = None

    async def observe(self, jpeg, checkpoint):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result or Observation(
            matched=True, observed_text=" ".join(checkpoint.required_text),
            observed_features=checkpoint.description, text_readable=True, contradictory=False,
            matched_features=[f"f{i}" for i in range(len(checkpoint.required_features))],
            target_visible=True, position="ahead", distance="near", hazards_visible=[],
        )


@pytest.fixture
def jpeg():
    output = io.BytesIO()
    Image.new("RGB", (640, 360), "white").save(output, format="JPEG")
    return base64.b64encode(output.getvalue()).decode()


@pytest.fixture
async def setup(tmp_path):
    published = await prepare(SAMPLE, tmp_path, "TEST REVIEWER", fake_tts)
    provider = FakeProvider()
    app = create_app(tmp_path, provider, tts=fake_tts)
    async with AsyncClient(transport=ASGITransport(app=app, client=("127.0.0.1", 1000)), base_url="http://test") as client:
        yield client, provider, published, app, tmp_path
