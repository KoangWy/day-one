"""Small explicitly invoked real-provider image evaluation. Never persists submitted images."""
import argparse
import asyncio
import json
import statistics
import time
from pathlib import Path

from .models import Checkpoint
from .provider import configured_provider
from .teach import FaceBlur


async def evaluate(manifest: Path, output: Path):
    cases = json.loads(manifest.read_text())
    provider, blur = configured_provider(), FaceBlur()
    results = []
    try:
        for case in cases:
            started = time.monotonic()
            row = {"id": case["id"], "expected": case["expected"]}
            try:
                checkpoint = Checkpoint.model_validate(case["checkpoint"])
                jpeg = await asyncio.to_thread(blur.blur, manifest.parent / case["image"])
                async with asyncio.timeout(10):
                    evidence = await provider.match(jpeg, checkpoint)
                row["matched"] = evidence.supports(checkpoint)
            except Exception:
                row["error"] = "unavailable_or_invalid_case"
            row["latency_ms"] = round((time.monotonic() - started) * 1000)
            results.append(row)
            print(f"{case['id']}: {row.get('matched', row.get('error'))}", flush=True)
    finally:
        blur.close()
    negatives = [r for r in results if r["expected"] is False]
    summary = {
        "provider": provider.label, "n": len(results),
        "false_positives": sum(r.get("matched") is True for r in negatives),
        "negative_n": len(negatives),
        "errors": sum("error" in r for r in results),
        "p50_ms": statistics.median([r["latency_ms"] for r in results]) if results else None,
        "results": results,
    }
    output.write_text(json.dumps(summary, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sends redacted evaluation images to the selected provider")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    asyncio.run(evaluate(args.manifest, args.output))
