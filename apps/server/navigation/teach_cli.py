import argparse
import asyncio
from pathlib import Path

from fastapi import UploadFile

from .config import DATA
from .provider import configured_provider
from .teach import ingest_upload


async def main():
    parser = argparse.ArgumentParser(description="Local pre-recorded teach; draft only, never auto-approved")
    parser.add_argument("video", type=Path)
    parser.add_argument("--route-id", required=True)
    parser.add_argument("--transcript", type=Path)
    args = parser.parse_args()
    transcript = args.transcript.read_text() if args.transcript else None
    with args.video.open("rb") as source:
        upload = UploadFile(filename=args.video.name, file=source)
        route = await ingest_upload(upload, args.route_id, transcript, DATA, configured_provider())
    print(route.model_dump_json(indent=2))
    print(f"Review draft: {DATA / 'drafts' / route.route_id}")


if __name__ == "__main__":
    asyncio.run(main())
