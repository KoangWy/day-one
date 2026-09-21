import re
from pathlib import Path

from .models import Published


class Store:
    def __init__(self, root: Path):
        self.root = root

    def get(self, route_id: str) -> Published:
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", route_id):
            raise FileNotFoundError
        return Published.model_validate_json(
            (self.root / "routes" / route_id / "published.json").read_text()
        )

    def list(self):
        return [self.get(p.parent.name).route for p in sorted(
            (self.root / "routes").glob("*/published.json")
        )]

    def audio(self, asset_id):
        if not re.fullmatch(r"[a-z0-9-]+_[a-z0-9-]+\.mp3", asset_id):
            raise FileNotFoundError
        route_id, filename = asset_id.split("_", 1)
        self.get(route_id)  # No access to unpublished/staging audio.
        path = self.root / "routes" / route_id / "audio" / filename
        if not path.is_file():
            raise FileNotFoundError
        return path
