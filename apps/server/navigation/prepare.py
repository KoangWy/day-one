import argparse
import asyncio
import json
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from .config import DATA
from .models import Assets, AssetStep, Published, Review, Route
from .phrases import build_phrases
from .speech import synthesize


async def prepare(bundle: Path, data: Path, reviewer: str, tts=synthesize):
    route = Route.model_validate_json((bundle / "route.json").read_text(encoding="utf-8"))
    review = Review.model_validate_json((bundle / "review.json").read_text(encoding="utf-8"))
    if len(review.checkpoints) != len(route.steps):
        raise ValueError("Each step needs one reviewed checkpoint")
    if not review.destination_is_exterior:
        raise ValueError("Reviewer must confirm destination is the exterior toilet sign/door")
    if not reviewer.strip():
        raise ValueError("Reviewer name is required")
    destination = data / "routes" / route.route_id
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        raise ValueError("Published routes are immutable; use a new route ID/version")
    with tempfile.TemporaryDirectory(dir=destination.parent, prefix=".prepare-") as tmp:
        stage = Path(tmp) / "bundle"
        audio = stage / "audio"
        audio.mkdir(parents=True)

        phrases = build_phrases(route, review)
        for key, text in phrases.items():
            path = audio / f"{key}.mp3"
            await tts(text, path)
            if not path.exists() or path.stat().st_size < 100:
                raise ValueError("Speech generation produced no usable audio")
        assets = Assets(
            origin_label=review.origin_label, sample=review.sample,
            steps=[AssetStep(short_name=c.short_name, expected_seconds=c.expected_seconds)
                   for c in review.checkpoints],
            phrases=phrases,
        )
        published = Published(
            route=route, review=review, assets=assets, reviewer=reviewer,
            approved_at=datetime.now(timezone.utc).isoformat(),
        )
        (stage / "route.json").write_text(route.model_dump_json(indent=2), encoding="utf-8")
        (stage / "published.json").write_text(published.model_dump_json(indent=2), encoding="utf-8")
        log_file = bundle / "teach-log.json"
        if log_file.exists():
            log = json.loads(log_file.read_text(encoding="utf-8"))
            log["approved_at"] = published.approved_at
            log["teach_seconds_including_review"] = (
                datetime.fromisoformat(published.approved_at)
                - datetime.fromisoformat(log["started_at"])
            ).total_seconds()
            (stage / "teach-log.json").write_text(json.dumps(log, indent=2), encoding="utf-8")
        stage.rename(destination)  # Route becomes visible only after every MP3 is complete.
    # Keep only approved content/audio and timing log after publishing a runtime draft.
    if bundle.resolve().parent == (data / "drafts").resolve():
        shutil.rmtree(bundle)
    return published


def main():
    parser = argparse.ArgumentParser(description="Publish a manually reviewed route and prebuilt audio")
    parser.add_argument("bundle", type=Path)
    parser.add_argument("--reviewer", required=True)
    parser.add_argument("--reviewed", action="store_true", required=True,
                        help="Confirm route order, turns, signs, quotes and exterior destination")
    args = parser.parse_args()
    result = asyncio.run(prepare(args.bundle, DATA, args.reviewer))
    print(f"Published {result.route.route_id}; sample={result.review.sample}; "
          f"{len(result.assets.phrases)} phrases")


if __name__ == "__main__":
    main()
