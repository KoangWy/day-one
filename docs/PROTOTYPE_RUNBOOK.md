> **English** (default) | [Tiếng Việt](./PROTOTYPE_RUNBOOK.vi.md)

# Day One — prototype operations

Internal note. UI, directions and audio are all in English. **Branch `super-final-project`:** the realtime replay of `feat/realtime-replay` (continuous photos, template speech) plus the demo video's features: teaching and reviewing routes on the phone, several routes that chain into a journey, route hazards, on-phone obstacle alerts and the Wear your phone card. Feature map and results: [SUPER_FINAL.md](SUPER_FINAL.md). `main` keeps the old Check/Yes flow. Decision of 21/09/2026: routes may use 2–3 checkpoints and pictogram recognition with physical features, an approved exception to the original 4–5 text-sign requirement.

## Setup and startup

Requires Node 22+, `uv`, uv-managed Python 3.11. Run `uv sync --all-extras --frozen` in `apps/server`, `npm ci` in `apps/web`, then build the frontend. Dependencies are pinned in `uv.lock` and `package-lock.json`.

- `npm run build` / `npm run dev` first run `scripts/obstacle-assets.mjs`: it copies the MediaPipe Wasm runtime from `node_modules` into `public/mediapipe/wasm/` and downloads the EfficientDet-Lite0 model (4.6 MB, Apache-2.0) once into `public/models/` (both gitignored; needs internet the first time). Without the model the app still runs and says obstacle alerts are unavailable.
- FFmpeg is only needed for teaching. When it is not on PATH, teach uses the FFmpeg bundled with `imageio-ffmpeg` (part of the `teach` extra), and reads the duration from FFmpeg itself when FFprobe is missing.
- **Windows laptop** (Git Bash): if `uv` is not on PATH, `python -m uv …` works when uv is installed as a module (`py -m pip install --user uv`), and the venv runs everything: `apps/server/.venv/Scripts/python.exe -m pytest -q`, `-m uvicorn --app-dir apps/server navigation.main:app --port 8000`. `python3` is often a Microsoft Store alias. npm 11+ blocks the esbuild `postinstall`; the `@esbuild/win32-x64` binary still runs. All JSON/transcript files are UTF-8 explicitly, so reviews with `’` or Vietnamese survive a cp1252 locale.

Copy `.env.example` to `.env` when missing; never overwrite an existing `.env`, never paste keys into the frontend or into shell history.

Demo provider locked on 22/09/2026: **DeepSeek V4.1 Flash via OpenCode Go**.

```dotenv
VLM_PROVIDER=opencode
OPENCODE_MODEL=deepseek-v4.1-flash
OPENCODE_API_KEY=...
# Optional: lets a guide's phone teach and publish (4+ characters)
TEACH_PIN=...
```

DeepSeek uses Chat Completions with `response_format=json_object`, the schema in the prompt and thinking disabled; the backend still validates everything with Pydantic. MiMo keeps the `json_schema` branch when selected manually; Muse Spark does not fit this adapter. The UI reads the provider name from `/health` for the consent text and never switches provider on errors. The Gemini Developer API adapter remains available with `VLM_PROVIDER=gemini`, `VLM_MODEL`, `GEMINI_API_KEY`. Restart the server after changing `.env`.

```bash
bash scripts/serve.sh
```

The server serves the build, API and audio from one origin at `http://127.0.0.1:8000`; on startup it pre-generates the app's fixed sentences into the speech cache. Separate frontend dev: `npm run dev` in `apps/web` proxies the API to port 8000. `/health` only says whether a key is configured, not whether it works. No access log, no request-body logging.

Three published demo routes (`lift-lobby-to-toilet-v2`, `entrance-to-lift-lobby-v1`, `lift-lobby-to-meeting-room-v1`), their MP3s and the DeepSeek result JSON ship with the repo ([demo data shipped with the repo](DEMO_HANDOFF.md#demo-data-shipped-with-the-repo)). After clone/pull skip `prepare`; the frontend must still be built. With a custom `DATA_DIR`, copy the routes into `<DATA_DIR>/routes/`.

## HTTPS for iPhone/Windows on the same LAN

```bash
brew install mkcert                 # macOS; Windows: winget install FiloSottile.mkcert
bash scripts/setup_https.sh 192.168.0.143  # the laptop's current LAN IP
bash scripts/serve.sh --https
```

On Windows, allow Python through the firewall for **Private networks** only on the first `--https` run. The server is at `https://<LAN-IP>:8443`. The script creates certificates but never touches the trust store (`mkcert -CAROOT` shows the CA folder).

1. Optionally `mkcert -install` on the laptop.
2. Transfer only **rootCA.pem** to the phone; never `rootCA-key.pem` or `.certs/lan-key.pem`.
3. iPhone: install the profile, enable full trust in Settings → General → About → Certificate Trust Settings, open the HTTPS URL in Safari, allow the camera (and the microphone for teaching).
4. Windows: import the CA into Trusted Root Certification Authorities, open the URL, run real NVDA.
5. Recreate certificates when the laptop IP changes. Use the team's private network. Uvicorn runs with `--no-proxy-headers`: guide access checks the real socket address, never `X-Forwarded-For`.

Camera and microphone need a secure context ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)). Automated WebKit tests do not replace a real iPhone with Safari/VoiceOver.

## Teach and review

### Teaching on the guide's phone

1. On the laptop set `TEACH_PIN=<4+ characters>` in `.env` and restart. Without it, only the laptop itself (loopback) can use `/guide/*` and `/ingest-video`. Anyone on the network with the code can teach and publish — use the team's private network.
2. On the phone open `https://<LAN-IP>:8443/#/teach` (**Teach a route**) and enter the guide code (kept in the tab's sessionStorage).
3. Fill in **Starting place** and **Destination**, tick "Everyone in view agreed to be filmed.", tap **Record** ("Recording started."). Hold the phone at chest height and say every movement ("turn right", "turn around", "go through the door"), name places as you reach them ("this is the lift"), warn about doors and steps. Up to ~3 minutes (stops itself at 2:50). The optional "Also transcribe my voice on this phone" sends the browser's own transcript as a backup when the laptop cannot transcribe.
4. **Stop and learn**: the walk uploads with a progress bar, "Learning." is spoken and the laptop learns in the background (`POST /guide/teach` → 202 with `job_id`; the page polls `GET /guide/teach/{job_id}` every 1.5 s). Then "Route learned." and "N places remembered". Temporary video, speech and frames are deleted when the job ends, also on errors. The route ID comes from the two place names (`lift-lobby-to-meeting-room-v1`, then `-v2`…).
5. **Review and publish** (`#/review/<id>`): the form is prefilled with the AI's suggestions (landmark names, sign text, features, walking time, hazards, arrival sentence). Correct everything, add or remove warnings (up to 3 per step), tick "I walked this route…" and "The route ends outside the destination’s door or sign…", enter the reviewer's name and tap **Publish route**. Problems are shown per field; publishing refuses a checkpoint whose evidence equals the point before it (two doors with the same logo would be "reached" at once). Speech is generated 6 sentences at a time; a two-step route takes about 15–30 s.

Phones record MP4 (Safari) or WebM (Chrome); the laptop accepts MP4, MOV and WebM (WebM recordings have no duration header, so it is measured). Limits: 120 MB, 180 s. At most 48 evenly spaced frames go to the VLM in one call. Real run on 23/09: a 37 s, 720p (12 MB) walk learned in ~63 s on the Windows laptop.

### Teaching on the laptop (CLI / HTTP)

`POST /ingest-video` (multipart `video`, `route_id`, optional `transcript`) accepts the laptop itself or the guide code. Convert raw iPhone MOV if needed, never editing the original:

```bash
ffmpeg -i input.MOV -map 0:v:0 -map '0:a:0?' -c:v libx264 -crf 23 -c:a aac output.mp4
cd apps/server
uv run python -m navigation.teach_cli /absolute/path/output.mp4 --route-id lift-to-toilet-v3 \
  [--transcript /absolute/path/transcript.json]
```

A transcript is text or JSON `[{"start":0,"end":8,"text":"..."}]` in seconds from the start of the clip. `faster-whisper base.en` runs on CPU (model download on first run). Auto transcripts can be wrong; a `voice_cue` without a matching transcript quote is dropped.

Drafts land in `data/runtime/drafts/<route-id>/`:

- `route.json`: `{route_id, steps[{id,instruction,landmark,voice_cue}]}`.
- `review.json`: a skeleton with blank `short_name`/`expected_seconds`, so `prepare` refuses it until a person fills it in (the Review page does this from the suggestions).
- `suggestions.json`: the AI's reading — place names, landmark names, sign text, features, when each landmark is closest, hazards per step. Only ever used to prefill the form.
- `transcript.json`, `teach-log.json`.

`review.json` may add `destination_label` (the name in the route list, e.g. `Meeting room`) and per-checkpoint `hazards`: `kind` (`glass-door`, `automatic-door`, `door`, `stairs`, `step`, `narrow`, `other`), `warning` (spoken with the chime), optional `action` (how to pass it) and 1–3 `features` the camera should see. Describe the hazard as it really looks: "frameless glass door" never fired on a framed door (see SUPER_FINAL).

The reviewer checks order, left/right, floor signs, fixed landmarks, quotes and the exterior endpoint; `instruction` always goes from the previous point to the current step's landmark. Then:

```bash
uv run python -m navigation.prepare ../../data/runtime/drafts/lift-to-toilet-v3 \
  --reviewer "Reviewer name" --reviewed
```

Prepare checks that no checkpoint looks like the point before it, builds every sentence from `phrases.py` (the single source of spoken text: 53 keys for a two-step route, plus `s{i}-watch`, `s{i}-hazard-{h}` and `s{i}-hazard-{h}-action` for hazards) and pre-generates one Edge-TTS `en-US-AriaNeural` MP3 per key, 6 at a time. It publishes with an atomic rename only after every MP3 exists, never overwrites a published version, and leaves nothing half-published when TTS fails. "Offline" teach only means preparing before the walk: VLM and Edge-TTS need the network.

## Walk (replay)

Realtime flow, details in `docs/superpowers/specs/2026-09-22-realtime-replay-design.md`:

- **Choose a route:** the Walk page lists every route from `/catalog`; the phone remembers the choice and `?route=<id>` opens one directly. On arrival, **Continue your journey** offers every route that starts where this one ended (normalised place names); choosing one moves focus to Start, because the walker may need the lift first.
- **Wear your phone:** shown before the first walk; *Play setup instructions* speaks the four steps; *I'm ready* hides it on this phone; *Phone setup* reopens it.
- Start asks for the camera and unlocks one audio element and the chime. The capture loop sends JPEGs (long edge ≤640 px) to `/observe`: at most 2 in flight, ≥1 s apart; it pauses while waiting for Next or an override answer and stops on arrival, Stop, backgrounding or a lost camera track.
- **Reached:** 2 of the last 3 successful results of the step are `matched`. The app says the "reached" sentence and **waits for Next** (88 px button or "next"). Next means ready, not verified. `candidate` only produces hints about where the landmark is in the frame ("Possible office sign, ahead, slightly left."), never a turn instruction, ≥8 s apart (≥3 s if the position changed).
- **Lost:** the step clock starts when its direction has been heard; after `max(3 × expected_seconds, 30 s)` the app says "lost" and keeps looking. Next then offers the override; Yes counts as `manual_override`. No override at the starting point, which is repeated once after 30 s.
- **Vision down:** 3 errors in a row or offline → spoken notice, back-off 3 → 5 → 10 s, Next offers the override (not at the origin); one success says "Camera check is back."
- **Route hazards:** a step with hazards adds "On the way: a glass door." after its direction. `/observe` returns `hazards` (IDs of that step's reviewed hazards only). The first time one is close ahead: chime, amber banner and the warning (P0), then how to pass it (P1, what Repeat replays). Once per hazard per step.
- **Obstacle alerts on the phone:** MediaPipe EfficientDet-Lite0 runs on the camera video 4 times a second while searching (origin, walking, lost), never uploading anything. A person in the middle 40% of the frame, at least 40% of its height, score ≥0.45, in 2 frames in a row → chime, red banner, "Be careful. Someone is in front of you." (P0, interrupts). An object (chair, couch, bench, suitcase, bicycle, motorcycle, potted plant, table, dog) must be centred, low in the frame and seen in 3 frames → "Be careful. Something is in your path." The same kind is not spoken again within 8 s; after 1.5 s without it, "Warning ended." (never "path clear"). *Obstacle alerts* switches it off per phone.
- Always available: Where am I, Repeat, Stop; push-to-talk commands `next`, `yes`, `no`, `repeat`, `where` / `where am I`, `stop`; a typed command box. Opening the mic silences the app.
- One audio queue: P0 (obstacle and hazard warnings) plays at once with a WebAudio chime (plus vibration on Android) and puts an interrupted P1 back at the front; P1 (everything except hints) is never dropped; P2 (hints) is dropped when busy or listening. With App voice off, P0 is a `role="alert"`, P1 the main polite live region, hints a separate one. When Safari blocks audio, a Play instruction button appears and the step clock still runs.
- Reload or backgrounding resets to the starting point. No offline localisation and no AI-written directions; obstacle and hazard warnings are aids that can miss things.

API:

- `POST /observe` `{route_id, step_index, image_jpeg_640}` → `{step_index, target, position, distance, hazards}`. `matched` needs the full reviewed evidence (`Evidence.supports`); `candidate` means something could be the landmark; otherwise `none` with null position/distance. Origin is `-1`. 404 unknown route; 422 bad payload/index/JPEG (never echoed); 503 `Visual check unavailable` (provider error or 10 s) or `Visual check busy` (4 in flight). Photos are never stored.
- `GET /speech/{route_id}/{key}.mp3`: only keys in the route's reviewed `phrases`; published MP3, else the TTS cache, else Edge-TTS once (5 s timeout); never writes into the route folder.
- `GET /routes/{route_id}/assets` → `{origin_label, destination_label, sample, steps[{short_name, expected_seconds, hazards}], phrases}`. `GET /catalog` → every route with `origin_label`, `destination_label`, `origin_place`, `destination_place`, step and hazard counts. `/routes` and `/health` unchanged.
- `GET /app-phrases`, `GET /app-speech/{key}.mp3`: the app's fixed sentences (setup, obstacle alerts, teaching).
- `/guide/*` (laptop, or header `X-Teach-Pin`): `GET /guide/access`, `POST /guide/teach`, `GET /guide/teach/{job}`, `GET /guide/drafts`, `GET|DELETE /guide/drafts/{id}`, `POST /guide/drafts/{id}/publish` with `{route, review, reviewer, confirmed: true}` (422 with `fields[{field, message}]`, never echoing the input).
- `/models/` and `/mediapipe/` are cacheable for a day; every API response stays `no-store`. The service worker precaches the app shell only.

## Models and costs surveyed

**Updated 22/09/2026:** `deepseek-v4.1-flash` via OpenCode Go. Keep the `/observe` deadline at 10 s server / 12 s browser. [DeepSeek JSON Output](https://api-docs.deepseek.com/guides/json_mode/) uses `json_object`. Results always pass schema/evidence checks before use.

Before DeepSeek: [OpenCode Go](https://opencode.ai/docs/go/) listed MiMo V2.5 ($0.14/$0.28 per 1M tokens) and Muse Spark 1.3 Contributor ($0.10/$0.20); MiMo read images but missed the latency target, and Muse Contributor allows training on prompts, so it must not be swapped in under the same consent. Gemini uses the SDK with [structured output](https://ai.google.dev/gemini-api/docs/structured-output); changing models requires re-evaluation.

## Testing and metrics

```bash
cd apps/server
uv run python -m pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

E2E uses a synthetic camera and a mocked API. `replay.spec.ts`: whole route, lost via `page.clock` then override, vision down and recovery, no override at the origin, Stop during a request, backgrounding/reload, no requests while waiting for Next, axe at every state. `journeys.spec.ts`: route choice and the next leg, hazard warnings, Wear your phone, teaching (guide code, record, learning, places remembered), review and publish. `obstacles.spec.ts` feeds the team's corridor footage into the real detector as the camera; it needs `data/runtime/verify/collision.mp4` (an H.264 cut of the corridor clip, see SUPER_FINAL) and skips without it. Playwright WebKit **on Windows** has no `MediaStream`, so camera journeys skip there; run on macOS/Linux for full WebKit.

`npm run test:real` uses the real server and build with only `/observe` mocked: every phrase MP3 of the demo route, the service worker precache, the walk through origin → hint → reached → Next → lost → override → unverified arrival with axe, the catalog, the app speech, the detector model and runtime headers, and guide access. It reuses a server already on port 8000. Switch the walked route with `DEMO_ROUTE_ID=<route-id>`.

Session metrics (JSON `kind: "offixed-replay-session", version: 2`) include `hazard` and `obstacle` events besides `start`, `origin_found`, `reached`, `next`, `lost`, `where`, `manual_override`, `vision_down`, `vision_back`, `arrival`, `stop` and a `step_summary` per step:

```bash
uv run --project apps/server python scripts/metrics.py session1.json session2.json
```

Real-VLM evaluation uses a local manifest: each case has `id`, `image` (relative to the manifest), `expected`, and either an inline `checkpoint` or `step_index` with `--route <route_id>`; add `expected_hazards` (IDs that should be seen, or `[]`) to measure hazards. At least three fresh images per landmark and ten negatives. Never commit real images.

```bash
cd apps/server
uv run python -m navigation.evaluate /private/eval/cases.json --output /private/eval/results.json \
  --route lift-lobby-to-toilet-v2
```

Images are reduced like the app sends them (long edge ≤640 px, JPEG 85), one provider call per case, classified exactly like `/observe`. The summary reports `true_positives`, `false_positives`, candidate rates, `hazard_hits`, `hazard_false_alarms`, `p50_ms`, `p95_ms` and `errors`. Results: `data/runtime/deepseek-observe-eval-2026-09-22.json` (toilet route) and `data/runtime/deepseek-super-final-eval-2026-09-23.json` (the two new routes). UI metrics are operational numbers, never a substitute for real walks.

## Credit

Route teach-and-share inspired by [OCCAM Lab Clew](https://github.com/occamLab/Clew); original implementation by Team Offixed. No Clew code copied.
