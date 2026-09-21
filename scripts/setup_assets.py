"""Download the versioned face model and copy installed WASM assets; no CDN at runtime."""
import hashlib
import shutil
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = ("https://storage.googleapis.com/mediapipe-models/face_detector/"
       "blaze_face_short_range/float16/1/blaze_face_short_range.tflite")


def main():
    model_dir = ROOT / "data/models"
    public = ROOT / "apps/web/public/privacy"
    model_dir.mkdir(parents=True, exist_ok=True)
    public.mkdir(parents=True, exist_ok=True)
    model = model_dir / "blaze_face_short_range.tflite"
    if not model.exists():
        with urllib.request.urlopen(URL, timeout=60) as response:
            content = response.read()
        if len(content) < 100_000 or content[4:8] != b"TFL3":
            raise RuntimeError("Invalid MediaPipe model download")
        model.write_bytes(content)
    shutil.copy2(model, public / model.name)
    source = ROOT / "apps/web/node_modules/@mediapipe/tasks-vision/wasm"
    if not source.exists():
        raise RuntimeError("Run npm ci in apps/web first")
    shutil.copytree(source, public / "wasm", dirs_exist_ok=True)
    print("Local face model SHA-256:", hashlib.sha256(model.read_bytes()).hexdigest())


if __name__ == "__main__":
    main()
