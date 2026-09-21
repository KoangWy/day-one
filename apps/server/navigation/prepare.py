import argparse
import asyncio
import json
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import edge_tts

from .config import DATA
from .models import Assets, AudioStep, Published, Review, Route

OVERRIDE = "Continue using saved directions without visual verification?"


def fallback(last):
    return f"I lost track, slowly turn left or right. Last confirmed: {last}."


async def synthesize(text, path):
    await edge_tts.Communicate(text, "en-US-AriaNeural").save(str(path))


async def prepare(bundle: Path, data: Path, reviewer: str, tts=synthesize):
    route = Route.model_validate_json((bundle / "route.json").read_text())
    review = Review.model_validate_json((bundle / "review.json").read_text())
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

        async def say(name, text):
            path = audio / f"{name}.mp3"
            await tts(text, path)
            if not path.exists() or path.stat().st_size < 100:
                raise ValueError("Speech generation produced no usable audio")
            return f"/audio/{route.route_id}_{name}.mp3"

        origin_audio = await say("origin", review.origin.question)
        origin_retry = await say("origin-retry", review.origin_retry)
        steps = []
        for i, step in enumerate(route.steps):
            cue = f' Guide said: "{step.voice_cue}".' if step.voice_cue else ""
            steps.append(AudioStep(
                instruction=await say(f"s{i}-instruction", step.instruction + cue),
                question=await say(f"s{i}-question", review.checkpoints[i].question),
            ))
        fallback_audio = {}
        for i, landmark in enumerate([review.origin.description] + [s.landmark for s in route.steps]):
            fallback_audio[str(i-1)] = await say(f"fallback-{i}", fallback(landmark))
        assets = Assets(
            origin_label=review.origin_label, origin_instruction=review.origin_instruction,
            origin_retry=review.origin_retry,
            origin=review.origin, origin_audio=origin_audio, origin_retry_audio=origin_retry,
            steps=steps, checkpoint_questions=[c.question for c in review.checkpoints],
            arrival=review.arrival, arrival_audio=await say("arrival", review.arrival),
            fallback_audio=fallback_audio, override_audio=await say("override", OVERRIDE),
            sample=review.sample,
        )
        published = Published(
            route=route, review=review, assets=assets, reviewer=reviewer,
            approved_at=datetime.now(timezone.utc).isoformat(),
        )
        (stage / "route.json").write_text(route.model_dump_json(indent=2))
        (stage / "published.json").write_text(published.model_dump_json(indent=2))
        log_file = bundle / "teach-log.json"
        if log_file.exists():
            log = json.loads(log_file.read_text())
            log["approved_at"] = published.approved_at
            log["teach_seconds_including_review"] = (
                datetime.fromisoformat(published.approved_at)
                - datetime.fromisoformat(log["started_at"])
            ).total_seconds()
            (stage / "teach-log.json").write_text(json.dumps(log, indent=2))
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
    print(f"Published {result.route.route_id}; sample={result.review.sample}")


if __name__ == "__main__":
    main()
