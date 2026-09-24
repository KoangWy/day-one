"""Draft routes from teaching, waiting for a guide to review them and publish."""
import json
import re
import shutil
from pathlib import Path

from pydantic import ValidationError

from .models import Published, Review, Route, TeachDraft
from .prepare import prepare
from .speech import synthesize
from .teach import remembered

KIND_NAME = {"glass-door": "glass door", "automatic-door": "automatic door", "door": "door",
             "stairs": "stairs", "step": "step", "narrow": "narrow passage", "other": "hazard"}


class DraftError(Exception):
    def __init__(self, message, status=422, fields=None):
        super().__init__(message)
        self.status = status
        self.fields = fields or []


def in_sentence(label):
    """"Lift lobby" → "lift lobby", but keep "RMIT entrance" as written."""
    return label[:1].lower() + label[1:] if label[1:2].islower() else label


def folder(data: Path, route_id: str) -> Path:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", route_id):
        raise DraftError("Draft not found", 404)
    path = data / "drafts" / route_id
    if not (path / "route.json").is_file():
        raise DraftError("Draft not found", 404)
    return path


def suggestions(path: Path) -> TeachDraft | None:
    file = path / "suggestions.json"
    if not file.is_file():
        return None
    route = json.loads((path / "route.json").read_text(encoding="utf-8"))
    try:
        data = json.loads(file.read_text(encoding="utf-8"))
        return TeachDraft.model_validate({**data, "route": route})
    except (ValueError, ValidationError):
        return None  # A reviewer can still fill the form by hand.


def prefill(route: Route, skeleton: dict, draft: TeachDraft | None) -> dict:
    """The review form's starting values. Unvalidated: blanks stay blank for the reviewer."""
    if draft is None:
        return skeleton
    origin = in_sentence(draft.origin_label or "starting point")
    destination = draft.destination_label or ""
    previous = 0.0
    checkpoints = []
    for i, step in enumerate(route.steps):
        guess = draft.checkpoints[i] if i < len(draft.checkpoints) else None
        seen = guess.seen_at_second if guess else previous
        checkpoints.append({
            "description": step.landmark,
            "required_text": guess.sign_text if guess else [],
            "required_features": guess.features if guess else [],
            "short_name": guess.short_name if guess else "",
            "expected_seconds": max(3, round(seen - previous)) if guess else 0,
            "hazards": [{"kind": h.kind, "warning": h.warning, "action": h.action,
                         "features": h.features or [KIND_NAME[h.kind]]}
                        for h in draft.hazards if h.step_index == i and h.warning.strip()],
        })
        previous = max(previous, seen)
    return {
        "origin_label": draft.origin_label or "Starting point",
        "origin_instruction": (f"Stand at the {origin}. Point the camera toward the "
                               f"{draft.origin.short_name or 'starting landmark'}."),
        "origin_retry": (f"I only know the saved route from the {origin}. "
                         f"Please check the {origin} again."),
        "origin": {"description": draft.origin.description,
                   "required_text": draft.origin.sign_text,
                   "required_features": draft.origin.features,
                   "short_name": draft.origin.short_name},
        "checkpoints": checkpoints,
        "destination_label": destination or None,
        "arrival": (f"You have arrived at the {in_sentence(destination)}. Route finished. "
                    "Camera stopped.") if destination else skeleton.get("arrival", ""),
        "destination_is_exterior": False,  # Always the reviewer's own confirmation.
        "sample": False,
    }


def summary(path: Path) -> dict:
    route = Route.model_validate_json((path / "route.json").read_text(encoding="utf-8"))
    draft = suggestions(path)
    log = path / "teach-log.json"
    started = json.loads(log.read_text(encoding="utf-8")).get("started_at") if log.is_file() else None
    return {"route_id": route.route_id, "steps": len(route.steps), "created_at": started,
            "origin_label": draft.origin_label if draft else "",
            "destination_label": draft.destination_label if draft else "",
            "places": remembered(draft) if draft else [s.landmark for s in route.steps]}


def list_drafts(data: Path) -> list[dict]:
    root = data / "drafts"
    if not root.is_dir():
        return []
    drafts = []
    for path in sorted(root.iterdir()):
        if path.name.startswith(".") or not (path / "route.json").is_file():
            continue
        try:
            drafts.append(summary(path))
        except (ValueError, ValidationError):
            continue
    return drafts


def load(data: Path, route_id: str) -> dict:
    path = folder(data, route_id)
    route = Route.model_validate_json((path / "route.json").read_text(encoding="utf-8"))
    skeleton = json.loads((path / "review.json").read_text(encoding="utf-8"))
    transcript = path / "transcript.json"
    return {**summary(path), "route": route.model_dump(),
            "review": prefill(route, skeleton, suggestions(path)),
            "transcript": json.loads(transcript.read_text(encoding="utf-8"))
            if transcript.is_file() else []}


def problems(error: ValidationError, prefix: str) -> list[dict]:
    # Location and message only: pydantic's "input" would echo the submitted text back.
    return [{"field": ".".join([prefix, *map(str, e["loc"])]), "message": e["msg"]}
            for e in error.errors()]


async def publish(data: Path, route_id: str, body: dict, tts=synthesize) -> Published:
    path = folder(data, route_id)
    if not isinstance(body, dict) or body.get("confirmed") is not True:
        raise DraftError("Confirm that you walked and checked this route before publishing")
    reviewer = body.get("reviewer")
    if not isinstance(reviewer, str) or not reviewer.strip() or len(reviewer) > 80:
        raise DraftError("Enter the reviewer's name", fields=[
            {"field": "reviewer", "message": "Enter your name (at most 80 characters)"}])
    fields = []
    try:
        route = Route.model_validate(body.get("route"))
    except ValidationError as error:
        fields += problems(error, "route")
    try:
        review = Review.model_validate(body.get("review"))
    except ValidationError as error:
        fields += problems(error, "review")
    if fields:
        raise DraftError("Some fields need attention", fields=fields)
    if route.route_id != route_id:
        raise DraftError("The route ID cannot change during review")
    (path / "route.json").write_text(route.model_dump_json(indent=2), encoding="utf-8")
    (path / "review.json").write_text(review.model_dump_json(indent=2, exclude_none=True),
                                      encoding="utf-8")
    try:
        return await prepare(path, data, reviewer.strip(), tts)
    except ValueError as error:
        raise DraftError(str(error)) from None


def delete(data: Path, route_id: str):
    shutil.rmtree(folder(data, route_id))
