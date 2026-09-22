import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
load_dotenv(ROOT / ".env")
DATA = Path(os.environ.get("DATA_DIR", ROOT / "data/runtime"))
WEB = ROOT / "apps/web/dist"
