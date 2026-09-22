import asyncio
import base64
import ipaddress
import re
from urllib.parse import urlparse

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from .config import DATA, WEB
from .models import ObserveRequest, ObserveResponse, Route
from .provider import ProviderUnavailable, configured_provider
from .speech import Speech, SpeechUnavailable, synthesize
from .storage import Store

MAX_OBSERVING = 4


def create_app(data=DATA, provider=None, ingest=None, tts=synthesize):
    app = FastAPI(title="Offixed Day-1 Navigation")
    app.state.store = Store(data)
    app.state.provider = provider or configured_provider()
    app.state.speech = Speech(data, tts)
    app.state.observe_timeout = 10
    app.state.observe_slots = asyncio.Semaphore(MAX_OBSERVING)

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

    @app.post("/observe", response_model=ObserveResponse)
    async def observe(payload: ObserveRequest):
        published = get_route(payload.route_id)
        index = payload.step_index
        if index >= len(published.route.steps):
            raise HTTPException(422, "Step index out of range")
        checkpoint = (published.review.origin if index == -1
                      else published.review.checkpoints[index])
        # Phones send about one frame per second each; shed load instead of queueing stale frames.
        if app.state.observe_slots.locked():
            raise HTTPException(503, "Visual check busy")
        async with app.state.observe_slots:
            try:
                async with asyncio.timeout(app.state.observe_timeout):
                    observation = await app.state.provider.observe(
                        base64.b64decode(payload.image_jpeg_640), checkpoint
                    )
                return ObserveResponse.classify(index, observation, checkpoint)
            except (TimeoutError, ProviderUnavailable, ValidationError, AttributeError):
                raise HTTPException(503, "Visual check unavailable") from None

    @app.get("/speech/{route_id}/{key}.mp3")
    async def speech(route_id: str, key: str):
        # Only reviewed phrases of a published route; never free text from the request.
        if not re.fullmatch(r"[a-z0-9-]{1,64}", key):
            raise HTTPException(404, "Speech not found")
        text = get_route(route_id).assets.phrases.get(key)
        if text is None:
            raise HTTPException(404, "Speech not found")
        try:
            path = await app.state.speech.get(app.state.store.route_dir(route_id), key, text)
        except SpeechUnavailable:
            raise HTTPException(503, "Speech unavailable") from None
        return FileResponse(path, media_type="audio/mpeg")

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
