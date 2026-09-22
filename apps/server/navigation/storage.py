import re
from pathlib import Path

from pydantic import ValidationError

from .models import Published


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

    def list(self):
        routes = []
        for path in sorted((self.root / "routes").glob("*/published.json")):
            try:
                routes.append(self.get(path.parent.name).route)
            except ValidationError:
                continue  # Published under an older schema; needs a new reviewed version.
        return routes
