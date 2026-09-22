"""Small explicitly invoked real-provider image evaluation. Never persists submitted images."""
import argparse
import asyncio
import io
import json
import statistics
import time
from pathlib import Path

from PIL import Image, ImageOps

from .models import Checkpoint
from .provider import configured_provider


def replay_jpeg(path):
    """Same frame the web app sends: upright, longest edge <=640, JPEG quality 85."""
    with Image.open(path) as original:
        im = ImageOps.exif_transpose(original).convert("RGB")
    im.thumbnail((640, 640))
    output = io.BytesIO()
    im.save(output, format="JPEG", quality=85)
    return output.getvalue()


async def evaluate(manifest: Path, output: Path):
    cases = json.loads(manifest.read_text(encoding="utf-8"))
    provider = configured_provider()
    results = []
    for case in cases:
        started = time.monotonic()
        row = {"id": case["id"], "expected": case["expected"]}
        try:
            checkpoint = Checkpoint.model_validate(case["checkpoint"])
            jpeg = await asyncio.to_thread(replay_jpeg, manifest.parent / case["image"])
            async with asyncio.timeout(10):
                evidence = await provider.match(jpeg, checkpoint)
            row["matched"] = evidence.supports(checkpoint)
        except Exception:
            row["error"] = "unavailable_or_invalid_case"
        row["latency_ms"] = round((time.monotonic() - started) * 1000)
        results.append(row)
        print(f"{case['id']}: {row.get('matched', row.get('error'))}", flush=True)
    negatives = [r for r in results if r["expected"] is False]
    summary = {
        "provider": provider.label, "n": len(results),
        "false_positives": sum(r.get("matched") is True for r in negatives),
        "negative_n": len(negatives),
        "errors": sum("error" in r for r in results),
        "p50_ms": statistics.median([r["latency_ms"] for r in results]) if results else None,
        "results": results,
    }
    output.write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sends evaluation images to the selected provider")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(evaluate(args.manifest, args.output))
