> **English** (default) | [Tiếng Việt](./PROTOTYPE_RUNBOOK.vi.md)

# Day One — prototype operations

Internal note. UI, directions and audio are all in English. Updated decision on 21/09/2026: the user chose **Lift lobby → Toilet**, 2–3 checkpoints, allowing pictogram recognition with physical features; the reviewed route currently has 2 checkpoints. This is an approved exception to the original 4–5 text-sign requirement. The route schema is unchanged.

## Setup and startup

Requires Node 22+, `uv`, uv-managed Python 3.11, FFmpeg. Run `uv sync --all-extras --frozen` in `apps/server`, `npm ci` in `apps/web`, then build the frontend. Dependencies are pinned in `uv.lock` and `package-lock.json`.

**Windows laptop** (tested 21/09/2026, Git Bash): install uv with `py -m pip install --user uv`, then add `%APPDATA%\Python\Python313\Scripts` to PATH (or `winget install astral-sh.uv`). `python3` on Windows is usually a Microsoft Store alias — invoke Python scripts with `uv run --project apps/server python ...`. npm 11+ blocks the esbuild `postinstall`; no approval needed because the `@esbuild/win32-x64` binary still runs. All JSON/transcript files are read/written as explicit UTF-8, so reviews containing `’`/Vietnamese survive a cp1252 locale. FFmpeg is only needed for teach: `winget install Gyan.FFmpeg`.

Copy `.env.example` to `.env` when missing. Never overwrite an existing `.env`. Never paste keys into the frontend or into curl commands that may be saved in shell history.

Locked demo provider on 22/09/2026: **DeepSeek V4.1 Flash via OpenCode Go**, for video/presentation recording.

```dotenv
VLM_PROVIDER=opencode
OPENCODE_MODEL=deepseek-v4.1-flash
OPENCODE_API_KEY=...
```

DeepSeek uses Chat Completions with `response_format=json_object`, the schema in the prompt and thinking disabled; the backend still validates types/semantics with Pydantic before using results. MiMo keeps the `json_schema` branch when selected manually. Do not switch to Muse Spark in this variable because Muse uses the Responses API. The UI reads provider/model names from `/health` for correct consent display; it never auto-switches model/provider on error. Restart the server after changing `.env`.

The Gemini Developer API adapter is still available via manual `VLM_PROVIDER=gemini`, `VLM_MODEL` and `GEMINI_API_KEY`; no Vertex AI configuration is needed for the current demo.

```bash
bash scripts/serve.sh
```

The server serves the build, API and audio from one origin at `http://127.0.0.1:8000`. Separate frontend dev: `npm run dev` in `apps/web`, proxying the API to server port 8000. `/health` only reports whether a key is configured, **not whether the key is valid or has quota**. No access log, debug request body, or body-logging proxy.

The published demo route, 11 MP3s and DeepSeek result JSON ship with the repo per [demo data shipped with the repo](DEMO_HANDOFF.md#demo-data-shipped-with-the-repo). After clone/pull, skip `prepare` when `data/runtime/routes/lift-lobby-to-toilet-v1/` already exists; the frontend must still be built. When `.env` has a custom `DATA_DIR`, drop that setting to use the bundled data, or copy the route into `<DATA_DIR>/routes/`.

## HTTPS for iPhone/Windows on the same LAN

```bash
brew install mkcert                 # macOS; Windows: winget install FiloSottile.mkcert
bash scripts/setup_https.sh 192.168.0.143  # replace with the laptop's current LAN IP
bash scripts/serve.sh --https
```

Windows laptop: on the first `--https` run, Windows Defender Firewall asks to allow Python — select **Private networks** only; the user clicks it. Otherwise the iPhone/NVDA machine cannot reach port 8443.

The HTTPS server is at `https://<LAN-IP>:8443`. The script creates certificates but never touches the trust store itself. Show the CA folder with `mkcert -CAROOT`.

1. Install the CA on the laptop for a trusted local browser: `mkcert -install` (the OS may ask for admin rights).
2. Transfer only **rootCA.pem** to the iPhone/Windows machine. Never transfer `rootCA-key.pem` or `.certs/lan-key.pem`.
3. iPhone: install the certificate profile, then enable full trust in Settings → General → About → Certificate Trust Settings. Open the HTTPS URL in Safari, grant camera; also try Add to Home Screen.
4. Windows: import the CA into the demo account's Trusted Root Certification Authorities, open the HTTPS URL and run real NVDA.
5. When the laptop IP changes, recreate certificates for the new IP. Use the team's private network. Run Uvicorn with `--no-proxy-headers`: ingest checks the loopback socket address and does not trust `X-Forwarded-For`.

Camera needs a secure context per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). Device CA-trust steps follow [mkcert](https://github.com/FiloSottile/mkcert). Automated WebKit tests do not replace a real iPhone with Safari/VoiceOver.

## Teach and review

`POST /ingest-video` accepts loopback calls from the laptop only. Multipart fields: `video` MP4, `route_id`, optional `transcript`. Limits: 120 MB / 180 seconds. Raw MOV from iPhone must be converted to MP4 first; never edit/delete the user's original:

```bash
ffmpeg -i input.MOV -map 0:v:0 -map '0:a:0?' -c:v libx264 -crf 23 -c:a aac output.mp4
```

A local CLI can replace HTTP:

```bash
cd apps/server
uv run python -m navigation.teach_cli /absolute/path/output.mp4 --route-id lift-to-toilet-v2
# With a hand-edited transcript:
uv run python -m navigation.teach_cli /absolute/path/output.mp4 \
  --route-id lift-to-toilet-v3 --transcript /absolute/path/transcript.json
```

Transcript accepts text or JSON `[{"start":0,"end":8,"text":"..."}]`, seconds counted from the start of the input video/clip. Frames at ~1 fps, long edge 640. `faster-whisper base.en` runs on CPU; the model download needs network on first run. Keyframes are sent to the provider unchanged. Auto transcripts can be wrong, especially with echo/accents; the reviewer must fix them. A `voice_cue` with no matching transcript quote is deleted.

Results land in `data/runtime/drafts/<route-id>/`:

- `route.json`: matches the schema `{route_id, steps[{id,instruction,landmark,voice_cue}]}`.
- `review.json`: fix origin, `required_text`, `required_features`, questions, arrival; confirm `destination_is_exterior`.
- `transcript.json`: check timestamps and speech.
- `teach-log.json`: build-timestamp recap; marked pre-recorded.

The reviewer checks order, left/right turns, floor signs, fixed landmarks, quotes and the outside-toilet endpoint. `instruction` always goes from the previous confirmed point to the landmark of the **current step**. After approval:

```bash
uv run python -m navigation.prepare ../../data/runtime/drafts/lift-to-toilet-v2 \
  --reviewer "Reviewer name" --reviewed
```

Prepare prebuilds Edge-TTS `en-US-AriaNeural`; it publishes via atomic rename only after all MP3s exist. It never overwrites a published version. A failed TTS never leaves a half-published route. When publishing a runtime draft, delete temp transcripts/drafts; keep the route, metadata, audio and timing log. Ingest temp video/audio/frames are deleted even on error. User-supplied source files and Drive downloads used for review are never auto-deleted by ingest; after review you may delete `data/runtime/source-media/` yourself.

"Offline" teach means pre-walk replay preparation: VLM and Edge-TTS still need network. [faster-whisper](https://github.com/SYSTRAN/faster-whisper), [Edge-TTS](https://github.com/rany2/edge-tts).

## Replay

- Start requests the camera and unlocks one audio element.
- Starting-point check captures 3 photos ~1 second apart, sending one request each; at least 2 must match plus user Yes before s1 starts. No Next at origin.
- Checkpoint check sends one JPEG (long edge ≤640 px); Yes advances the step. The backend always reads the instruction from the reviewed route. Two consecutive non-matches open fallback; Next still needs its own Yes and counts as a manual override.
- Every provider request has a 10-second server deadline; 503 is different from image mismatch. No hidden retries. Repeat only replays the MP3.
- Stop/arrival stops the camera. Reload or backgrounding the app resets to origin. No offline localization, obstacle detection, or AI-generated directions during replay.
- App voice can be muted to hear the screen reader; when Safari blocks audio, a Play instruction button appears. Voice command has a disclosure, push-to-talk and typed/button fallback; the mic never opens while app voice is playing. [WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/), [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).

`/replay`: `{route_id,step_index,image_jpeg_640}` → `{matched,instruction,checkpoint_question,audio_url}`. Origin index is `-1`. 404: route not published; 422: bad payload/index/JPEG; 503: provider/timeout. Error responses never echo base64. Replay images are never stored. The service worker precaches the app shell only, never API, images or audio.

## Surveyed models and costs

**Updated 22/09/2026:** uses `deepseek-v4.1-flash` via OpenCode Go per the user's choice. Keep the replay deadline at 10 s server / 12 s browser; real-provider test results are recorded in `docs/PROTOTYPE_VERIFICATION.md`. [DeepSeek JSON Output](https://api-docs.deepseek.com/guides/json_mode/) uses `json_object`, so the model cannot be renamed inside the old MiMo adapter. Final results always pass schema/evidence checks and wait for user confirmation.

Surveyed before switching to DeepSeek:

[OpenCode Go](https://opencode.ai/docs/go/) on 21/09/2026 listed MiMo V2.5 at $0.14 input / $0.28 output and Muse Spark 1.3 Contributor at $0.10 / $0.20 per 1M tokens. `/models` returned MiMo V2.5, no MiMo v3 seen. V2.5 read images/JSON in a small probe, but latency missed the target. Go targets coding-agent traffic; demo access is no guarantee of production service. Muse Contributor allows prompts/completions to be used for training, so it must not be swapped into the MiMo consent. Muse probes in-session used synthetic text-sign images only.

[Codex non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode) supports images via CLI plus `--output-schema`, reusing the CLI login. It may support demo prep/evaluation. The prototype does not embed a Codex agent in the replay endpoint; CLI latency was never measured, and login tokens are never harvested to fake an API key.

Gemini uses the SDK and [structured output](https://ai.google.dev/gemini-api/docs/structured-output). `VLM_MODEL` stays configurable; changing models requires re-evaluation. Do not infer cloud retention policy from the app not keeping images.

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

E2E uses a synthetic camera + mocked API. It says nothing about landmark accuracy. Playwright WebKit **on Windows** has no `MediaStream`, so 5 camera journeys self-skip with a stated reason; run on macOS/Linux for full WebKit.

Check the **real build** (real FastAPI server, real `dist`, published route and real Edge-TTS MP3s; only `/replay` is mocked so no key needed): requires `npm run build` and the published `lift-lobby-to-toilet-v1` route. The command auto-starts uvicorn on port 8000 or reuses a running server. It checks every MP3, that the service worker caches no audio/API/model, the origin → checkpoint → fallback → override → arrival walk, and runs axe at each phase. Switch routes with `DEMO_ROUTE_ID=<route-id>`.

```bash
cd apps/web
npm run test:real
```

Download session metrics in the UI, then:

```bash
python3 scripts/metrics.py session1.json session2.json session3.json
# Windows: uv run --project apps/server python scripts/metrics.py session1.json ...
```

Real-VLM evaluation uses a local manifest with `id`, `image`, `expected` and `checkpoint` cases per the metadata schema; minimum three fresh images per landmark, ten negatives, and true/false origin. `image` is a path relative to the manifest. Never commit real images.

```bash
cd apps/server
uv run python -m navigation.evaluate /private/eval/cases.json --output /private/eval/results.json
```

This downsizes images to long edge ≤640 px, JPEG quality 85 like the web app, then calls the configured provider, at most one call per case. Report false positives with a separate negative set; keep timeouts/errors in the results. UI metrics are operational numbers only, never a substitute for ground truth or real walks.

## Credit

Route teach-and-share inspired by [OCCAM Lab Clew](https://github.com/occamLab/Clew); original implementation by Team Offixed. No Clew code copied.
