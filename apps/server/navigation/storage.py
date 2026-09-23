import re
from pathlib import Path

from pydantic import ValidationError

from .models import Published, RouteSummary


def slug(text):
    return "-".join(re.findall(r"[a-z0-9]+", text.casefold()))


class Store:
    def __init__(self, root: Path):
        self.root = root

    def route_dir(self, route_id: str) -> Path:
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", route_id):
            raise FileNotFoundError
        return self.root / "routes" / route_id

    def get(self, route_id: str) -> Published:
        return Published.model_validate_json(
            (self.route_dir(route_id) / "published.json").read_text(encoding="utf-8")
        )

    def published(self):
        for path in sorted((self.root / "routes").glob("*/published.json")):
            try:
                yield self.get(path.parent.name)
            except ValidationError:
                continue  # Published under an older schema; needs a new reviewed version.

    def list(self):
        return [p.route for p in self.published()]

    def catalog(self):
        """Every saved route with its places; a route whose origin is another's destination
        continues that journey."""
        return [RouteSummary(
            route_id=p.route.route_id, origin_label=p.review.origin_label,
            destination_label=p.review.destination(), origin_place=slug(p.review.origin_label),
            destination_place=slug(p.review.destination()), steps=len(p.route.steps),
            hazards=sum(len(c.hazards) for c in p.review.checkpoints), sample=p.review.sample,
        ) for p in self.published()]
