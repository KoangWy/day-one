import asyncio
import base64
import hmac
import ipaddress
import mimetypes
import os
import re
import shutil
import tempfile
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlparse

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from . import drafts
from .config import DATA, WEB
from .models import ObserveRequest, ObserveResponse, Route, RouteSummary
from .phrases import APP_PHRASES
from .provider import ProviderUnavailable, configured_provider
from .speech import Speech, SpeechUnavailable, synthesize
from .storage import Store, slug

MAX_OBSERVING = 4
UPLOADS = ("/ingest-video", "/guide/teach")
# Static files that never change for a build: the on-device obstacle model and its runtime.
CACHEABLE = ("/models/", "/mediapipe/")
mimetypes.add_type("application/wasm", ".wasm")  # Windows registries often lack it.


def guide_allowed(request: Request) -> bool:
    """Teaching and publishing: on the laptop itself, or from a phone that knows TEACH_PIN."""
    try:
        if ipaddress.ip_address(request.client.host).is_loopback:
            return True
    except (ValueError, AttributeError):
        pass
    pin = os.environ.get("TEACH_PIN", "")
    given = request.headers.get("x-teach-pin", "")
    return len(pin) >= 4 and hmac.compare_digest(pin.encode(), given.encode())


def guarded(path: str) -> bool:
    return path == "/ingest-video" or (path.startswith("/guide/") and path != "/guide/access")


def create_app(data=DATA, provider=None, ingest=None, tts=synthesize, warm_speech=False):
    @asynccontextmanager
    async def lifespan(app):
        if warm_speech:  # App sentences are ready before the first walk needs them.
            app.state.tasks.add(asyncio.create_task(warm()))
        yield

    app = FastAPI(title="Offixed Day-1 Navigation", lifespan=lifespan)
    app.state.store = Store(data)
    app.state.provider = provider or configured_provider()
    app.state.speech = Speech(data, tts)
    app.state.tts = tts
    app.state.observe_timeout = 10
    app.state.observe_slots = asyncio.Semaphore(MAX_OBSERVING)
    app.state.jobs = {}
    app.state.tasks = set()

    async def warm():
        for key, text in APP_PHRASES.items():
            try:
                await app.state.speech.get(data / "app", key, text)
            except SpeechUnavailable:
                return  # Offline; phrases are generated on first use instead.

    @app.middleware("http")
    async def privacy_and_local_ingest(request: Request, call_next):
        if guarded(request.url.path) and not guide_allowed(request):
            return JSONResponse({"detail": "Teach is available only on the laptop or with the "
                                           "guide code"}, 403)
        if request.method in ("POST", "DELETE"):
            origin = request.headers.get("origin")
            if origin and urlparse(origin).netloc != request.headers.get("host"):
                return JSONResponse({"detail": "Cross-origin requests are not allowed"}, 403)
            limit = 130_000_000 if request.url.path in UPLOADS else 900_000
            try:
                length = int(request.headers.get("content-length", "0"))
            except ValueError:
                return JSONResponse({"detail": "Invalid content length"}, 400)
            if length > limit:
                return JSONResponse({"detail": "Upload too large"}, 413)
        response = await call_next(request)
        cacheable = request.url.path.startswith(CACHEABLE) and response.status_code == 200
        response.headers["Cache-Control"] = "public, max-age=86400" if cacheable else "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(self), microphone=(self)"
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_payload(request, exc):
        # FastAPI's default error body echoes invalid inputs, including base64 images.
        return JSONResponse({"detail": "Invalid request payload or JPEG dimensions"}, 422)

    @app.exception_handler(drafts.DraftError)
    async def draft_error(request, exc):
        return JSONResponse({"detail": str(exc), "fields": exc.fields}, exc.status)

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

    @app.get("/catalog", response_model=list[RouteSummary])
    async def catalog():
        return app.state.store.catalog()

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

    async def serve_speech(folder: Path, key: str, text: str | None):
        # Only reviewed or built-in phrases; never free text from the request.
        if text is None or not re.fullmatch(r"[a-z0-9-]{1,64}", key):
            raise HTTPException(404, "Speech not found")
        try:
            path = await app.state.speech.get(folder, key, text)
        except SpeechUnavailable:
            raise HTTPException(503, "Speech unavailable") from None
        return FileResponse(path, media_type="audio/mpeg")

    @app.get("/speech/{route_id}/{key}.mp3")
    async def speech(route_id: str, key: str):
        if not re.fullmatch(r"[a-z0-9-]{1,64}", key):
            raise HTTPException(404, "Speech not found")
        text = get_route(route_id).assets.phrases.get(key)
        return await serve_speech(app.state.store.route_dir(route_id), key, text)

    @app.get("/app-phrases")
    async def app_phrases():
        return APP_PHRASES

    @app.get("/app-speech/{key}.mp3")
    async def app_speech(key: str):
        return await serve_speech(data / "app", key, APP_PHRASES.get(key))

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

    @app.get("/guide/access")
    async def guide_access(request: Request):
        return {"allowed": guide_allowed(request),
                "pin_configured": len(os.environ.get("TEACH_PIN", "")) >= 4}

    def new_route_id(origin: str, destination: str) -> str:
        base = slug(f"{origin} to {destination}")[:56].strip("-") or "route"
        taken = {job["route_id"] for job in app.state.jobs.values() if job["status"] == "learning"}
        for version in range(1, 1000):
            candidate = f"{base}-v{version}"
            if (candidate not in taken and not (data / "routes" / candidate).exists()
                    and not (data / "drafts" / candidate).exists()):
                return candidate
        raise HTTPException(409, "Too many versions of this route")

    @app.post("/guide/teach", status_code=202)
    async def teach(
        video: UploadFile = File(...),
        origin_label: str = Form(""), destination_label: str = Form(""),
        transcript: str | None = Form(None), live_transcript: str | None = Form(None),
    ):
        """Saves the walk, then learns it in the background; poll /guide/teach/{job_id}."""
        from .teach import Clock, TeachError, check_request, learn, remembered, save_upload
        origin_label, destination_label = origin_label.strip()[:60], destination_label.strip()[:60]
        route_id = new_route_id(origin_label, destination_label)
        folder = Path(tempfile.mkdtemp(prefix="offixed-teach-"))
        clock = Clock()
        try:
            check_request(route_id, video.filename, data)
            source = folder / ("source" + Path(video.filename).suffix.lower())
            await save_upload(video, source)
            clock.event("video_imported")
        except TeachError as exc:
            shutil.rmtree(folder, ignore_errors=True)
            raise HTTPException(exc.status, str(exc)) from None
        finally:
            await video.close()
        job_id = uuid.uuid4().hex
        job = app.state.jobs[job_id] = {"job_id": job_id, "status": "learning",
                                        "route_id": route_id, "message": "", "places": [],
                                        "steps": 0}
        hints = {"origin_label": origin_label, "destination_label": destination_label}

        async def work():
            try:
                draft = await learn(source, folder, route_id, transcript, data,
                                    app.state.provider, live_transcript, hints, clock)
                job.update(status="learned", places=remembered(draft),
                           steps=len(draft.route.steps))
            except TeachError as exc:
                job.update(status="failed", message=str(exc))
            except ProviderUnavailable:
                job.update(status="failed", message="Teach provider unavailable; nothing was saved")
            except Exception:
                job.update(status="failed", message="Learning failed; nothing was saved")
            finally:
                # Raw video, speech and frames never outlive the job.
                shutil.rmtree(folder, ignore_errors=True)

        task = asyncio.create_task(work())
        app.state.tasks.add(task)
        task.add_done_callback(app.state.tasks.discard)
        return job

    @app.get("/guide/teach/{job_id}")
    async def teach_status(job_id: str):
        job = app.state.jobs.get(job_id)
        if job is None:
            raise HTTPException(404, "Teaching job not found")
        return job

    @app.get("/guide/drafts")
    async def draft_list():
        return drafts.list_drafts(data)

    @app.get("/guide/drafts/{route_id}")
    async def draft_detail(route_id: str):
        return drafts.load(data, route_id)

    @app.post("/guide/drafts/{route_id}/publish")
    async def draft_publish(route_id: str, request: Request):
        try:
            body = await request.json()
        except ValueError:
            raise HTTPException(422, "Invalid request payload") from None
        try:
            published = await drafts.publish(data, route_id, body, app.state.tts)
        except drafts.DraftError:
            raise
        except Exception:
            raise HTTPException(503, "Speech generation failed; nothing was published") from None
        return {"route_id": published.route.route_id,
                "phrases": len(published.assets.phrases)}

    @app.delete("/guide/drafts/{route_id}", status_code=204)
    async def draft_delete(route_id: str):
        drafts.delete(data, route_id)

    @app.get("/health")
    async def health():
        use_go = os.environ.get("VLM_PROVIDER", "gemini") == "opencode"
        return {"status": "ok", "vlm_configured": bool(os.environ.get(
                    "OPENCODE_API_KEY" if use_go else "GEMINI_API_KEY")),
                "provider_label": getattr(app.state.provider, "label", "Test provider")}

    if WEB.exists():
        app.mount("/", StaticFiles(directory=WEB, html=True), name="web")
    return app


app = create_app(warm_speech=True)
