import asyncio
import base64
import ipaddress
from urllib.parse import urlparse

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from .config import DATA, WEB
from .models import ReplayRequest, ReplayResponse, Route
from .provider import ProviderUnavailable, configured_provider
from .storage import Store


def create_app(data=DATA, provider=None, ingest=None):
    app = FastAPI(title="Offixed Day-1 Navigation")
    app.state.store = Store(data)
    app.state.provider = provider or configured_provider()
    app.state.replay_timeout = 10

    @app.middleware("http")
    async def privacy_and_local_ingest(request: Request, call_next):
        if request.url.path == "/ingest-video":
            try:
                local = ipaddress.ip_address(request.client.host).is_loopback
            except (ValueError, AttributeError):
                local = False
            if not local:
                return JSONResponse({"detail": "Teach is available only on the laptop"}, 403)
        if request.method == "POST":
            origin = request.headers.get("origin")
            if origin and urlparse(origin).netloc != request.headers.get("host"):
                return JSONResponse({"detail": "Cross-origin requests are not allowed"}, 403)
            limit = 130_000_000 if request.url.path == "/ingest-video" else 900_000
            try:
                length = int(request.headers.get("content-length", "0"))
            except ValueError:
                return JSONResponse({"detail": "Invalid content length"}, 400)
            if length > limit:
                return JSONResponse({"detail": "Upload too large"}, 413)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(self), microphone=(self)"
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_payload(request, exc):
        # FastAPI's default error body echoes invalid inputs, including base64 images.
        return JSONResponse({"detail": "Invalid request payload or JPEG dimensions"}, 422)

    def get_route(route_id):
        try:
            return app.state.store.get(route_id)
        except FileNotFoundError:
            raise HTTPException(404, "Approved route not found") from None
        except ValidationError:
            raise HTTPException(503, "Route needs operator review") from None

    @app.get("/routes", response_model=list[Route])
    async def routes():
        return app.state.store.list()

    @app.get("/routes/{route_id}/assets")
    async def assets(route_id: str):
        return get_route(route_id).assets

    @app.post("/replay", response_model=ReplayResponse)
    async def replay(payload: ReplayRequest):
        published = get_route(payload.route_id)
        index = payload.step_index
        if index >= len(published.route.steps):
            raise HTTPException(422, "Step index out of range")
        checkpoint = (published.review.origin if index == -1
                      else published.review.checkpoints[index])
        try:
            async with asyncio.timeout(app.state.replay_timeout):
                evidence = await app.state.provider.match(
                    base64.b64decode(payload.image_jpeg_640), checkpoint
                )
                matched = evidence.supports(checkpoint)
        except (TimeoutError, ProviderUnavailable, ValidationError, AttributeError):
            raise HTTPException(503, "Visual check unavailable. Retry or use saved directions.") from None
        instruction = "" if index == -1 else published.route.steps[index].instruction
        return ReplayResponse(
            matched=matched, instruction=instruction,
            checkpoint_question=checkpoint.question if matched else "",
            audio_url=(published.assets.origin_audio if index == -1
                       else published.assets.steps[index].question) if matched else "",
        )

    @app.get("/audio/{asset_id}")
    async def audio(asset_id: str):
        try:
            return FileResponse(app.state.store.audio(asset_id), media_type="audio/mpeg")
        except FileNotFoundError:
            raise HTTPException(404, "Audio not found") from None

    @app.post("/ingest-video", response_model=Route)
    async def ingest_video(
        video: UploadFile = File(...), route_id: str = Form(...),
        transcript: str | None = Form(None),
    ):
        from .teach import TeachError, ingest_upload
        try:
            return await (ingest or ingest_upload)(
                video, route_id, transcript, data, app.state.provider
            )
        except TeachError as exc:
            raise HTTPException(exc.status, str(exc)) from None
        except ProviderUnavailable:
            raise HTTPException(503, "Teach provider unavailable; no route published") from None
        finally:
            await video.close()

    @app.get("/health")
    async def health():
        import os
        use_go = os.environ.get("VLM_PROVIDER", "gemini") == "opencode"
        return {"status": "ok", "vlm_configured": bool(os.environ.get(
                    "OPENCODE_API_KEY" if use_go else "GEMINI_API_KEY")),
                "provider_label": getattr(app.state.provider, "label", "Test provider")}

    if WEB.exists():
        app.mount("/", StaticFiles(directory=WEB, html=True), name="web")
    return app


app = create_app()
