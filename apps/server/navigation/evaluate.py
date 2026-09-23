"""Small explicitly invoked real-provider image evaluation. Never persists submitted images."""
import argparse
import asyncio
import io
import json
import math
import statistics
import time
from pathlib import Path

from PIL import Image, ImageOps

from .config import DATA
from .models import Checkpoint, ObserveResponse, OriginCheckpoint
from .provider import configured_provider
from .storage import Store


def replay_jpeg(path):
    """Same frame the web app sends: upright, longest edge <=640, JPEG quality 85."""
    with Image.open(path) as original:
        im = ImageOps.exif_transpose(original).convert("RGB")
    im.thumbnail((640, 640))
    output = io.BytesIO()
    im.save(output, format="JPEG", quality=85)
    return output.getvalue()


def case_checkpoint(case, published):
    """Inline checkpoint (origin when it has no expected_seconds) or a step of a published route."""
    if "checkpoint" in case:
        data = case["checkpoint"]
        model = Checkpoint if "expected_seconds" in data else OriginCheckpoint
        return case.get("step_index", 0 if model is Checkpoint else -1), model.model_validate(data)
    if published is None:
        raise ValueError("Case needs an inline checkpoint or --route")
    index = case["step_index"]
    review = published.review
    return index, review.origin if index == -1 else review.checkpoints[index]


def percentile(values, fraction):
    """Nearest-rank percentile; works for the small samples of a field evaluation."""
    ordered = sorted(values)
    return ordered[max(0, math.ceil(fraction * len(ordered)) - 1)] if ordered else None


def rate(rows, target):
    done = [r for r in rows if "target" in r]
    return round(sum(r["target"] == target for r in done) / len(done), 3) if done else None


def hazard_summary(cases, results):
    rows = [(c["expected_hazards"], r.get("hazards")) for c, r in zip(cases, results)
            if "expected_hazards" in c and "error" not in r]
    return {
        "hazard_cases": len(rows),
        "hazard_hits": sum(bool(expected) and set(expected) <= set(seen) for expected, seen in rows),
        "hazard_expected": sum(bool(expected) for expected, _ in rows),
        # A warning where the reviewer marked no hazard close ahead.
        "hazard_false_alarms": sum(not expected and bool(seen) for expected, seen in rows),
    }


async def evaluate(manifest: Path, output: Path, provider=None, published=None):
    cases = json.loads(manifest.read_text(encoding="utf-8"))
    provider = provider or configured_provider()
    results = []
    for case in cases:
        started = time.monotonic()
        row = {"id": case["id"], "expected": case["expected"]}
        try:
            index, checkpoint = case_checkpoint(case, published)
            row["step_index"] = index
            jpeg = await asyncio.to_thread(replay_jpeg, manifest.parent / case["image"])
            async with asyncio.timeout(10):
                observation = await provider.observe(jpeg, checkpoint)
            result = ObserveResponse.classify(index, observation, checkpoint)
            row.update(target=result.target, position=result.position, distance=result.distance,
                       hazards=result.hazards)
        except Exception:
            row["error"] = "unavailable_or_invalid_case"
        row["latency_ms"] = round((time.monotonic() - started) * 1000)
        results.append(row)
        print(f"{case['id']}: {row.get('target', row.get('error'))}", flush=True)
    positives = [r for r in results if r["expected"] is True]
    negatives = [r for r in results if r["expected"] is False]
    latencies = [r["latency_ms"] for r in results if "error" not in r]
    summary = {
        "provider": getattr(provider, "label", "Test provider"), "n": len(results),
        "positive_n": len(positives), "negative_n": len(negatives),
        "true_positives": sum(r.get("target") == "matched" for r in positives),
        # A false "matched" is the failure that could announce a wrong checkpoint as reached.
        "false_positives": sum(r.get("target") == "matched" for r in negatives),
        "candidate_rate_positive": rate(positives, "candidate"),
        "candidate_rate_negative": rate(negatives, "candidate"),
        "errors": sum("error" in r for r in results),
        # Cases may list "expected_hazards": the saved hazard IDs that should (or not) be seen.
        **hazard_summary(cases, results),
        "p50_ms": statistics.median(latencies) if latencies else None,
        "p95_ms": percentile(latencies, .95),
        "results": results,
    }
    output.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sends evaluation images to the selected provider")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--route", help="Published route for cases that give only step_index")
    args = parser.parse_args()
    route = Store(DATA).get(args.route) if args.route else None
    asyncio.run(evaluate(args.manifest, args.output, published=route))
