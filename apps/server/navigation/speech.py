import asyncio
import hashlib
import os
import uuid
from pathlib import Path

import edge_tts

VOICE = "en-US-AriaNeural"


class SpeechUnavailable(Exception):
    pass


async def synthesize(text, path):
    await edge_tts.Communicate(text, VOICE).save(str(path))


class Speech:
    """Serves a phrase's MP3: the published file, else a shared cache, else Edge-TTS once."""

    def __init__(self, root: Path, tts=synthesize, timeout=5):
        self.cache = root / "tts-cache"
        self.tts = tts
        self.timeout = timeout
        self.locks: dict[str, asyncio.Lock] = {}

    async def get(self, route_dir: Path, key: str, text: str) -> Path:
        published = route_dir / "audio" / f"{key}.mp3"
        if published.is_file():
            return published
        name = hashlib.sha256(f"{VOICE}\n{text}".encode()).hexdigest() + ".mp3"
        cached = self.cache / name
        if cached.is_file():
            return cached
        async with self.locks.setdefault(name, asyncio.Lock()):
            if cached.is_file():  # Another request finished it while this one waited.
                return cached
            self.cache.mkdir(parents=True, exist_ok=True)
            partial = self.cache / f".{name}.{uuid.uuid4().hex}.tmp"
            try:
                async with asyncio.timeout(self.timeout):
                    await self.tts(text, partial)
                if not partial.is_file() or partial.stat().st_size < 100:
                    raise SpeechUnavailable("Speech generation produced no usable audio")
                os.replace(partial, cached)  # Readers never see a half-written file.
            except Exception:
                raise SpeechUnavailable("Speech unavailable") from None
            finally:
                partial.unlink(missing_ok=True)
        return cached
