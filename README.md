> **English** (default) | [Tiếng Việt](./README.vi.md)

# Day One

An indoor wayfinding prototype for visually impaired employees on their first days in an unfamiliar office — by **Team Offixed**, built at **ADC Hackathon 2026** (AI & Employability, Visual Impairment track).

Instead of describing the world for the blind person, Day One fixes the route at the source: a colleague walks it once while narrating, a person reviews every word, and the employee walks it alone the next day — the camera finds each landmark, warns about doors and people ahead, and the employee decides when to move on.

> **Branch `super-final-project`.** Everything the demo video showed is real on this branch: teaching from the phone, AI-drafted routes with human review, several routes that chain into a journey, route hazards (glass and automatic doors), on-phone obstacle alerts and the "Wear your phone" setup. See [docs/SUPER_FINAL.md](docs/SUPER_FINAL.md) for the video → feature map and how each part was verified. `main` keeps the Check/Yes flow that was submitted on 23/09.

## Why Day One

Starting a new job is stressful for anyone. For visually impaired employees, an unfamiliar building — lift lobby, long corridors, identical doors — can mean depending on colleagues for every trip to the toilet or meeting room. Existing tools describe whatever the camera sees, but they don't know *your* office route and can't guarantee the instruction is correct.

Day One takes a narrower, more reliable approach: saved routes, reviewed by a human, replayed with the camera checking every landmark.

## What it does

- **Teach once, on the phone** — a guide records the walk and narrates it (`#/teach`); the laptop drafts steps, sign text, landmarks, hazards and places, and reads back "3 places remembered".
- **Human review** — the guide corrects the AI draft on the phone (`#/review/<id>`) and confirms before anything is spoken to a walker. Publishing refuses a checkpoint that looks identical to the point before it.
- **Walk alone** — choose a saved route; the camera sends a photo every 1–3 s to find each landmark, the app says where it is in the frame, announces arrival at each checkpoint and waits for **Next**. Arriving offers the next leg (lift lobby → meeting room, → restroom).
- **Warnings** — taught hazards ("Be careful. A glass door is in front of you." → "Push the door open and go through.") and on-device obstacle alerts ("Be careful. Someone is in front of you."), each with a chime and a banner.
- **Prebuilt voice** — every sentence is a reviewed template with an Edge-TTS MP3; the AI never writes what is spoken.
- **Privacy** — photos are never stored; obstacle detection never leaves the phone; API keys stay on the laptop.

## How it works

```
Teach (phone video + voice) → AI draft → Review (human) → Publish (immutable) → Walk (camera finds landmarks, user says Next)
```

1. The guide records the route on `#/teach`. The laptop extracts frames (FFmpeg), transcribes the narration (faster-whisper) and asks the VLM once for a draft with suggestions.
2. The guide reviews and publishes it; all sentences are generated as MP3s. Published routes are immutable; a new version gets a new ID.
3. The employee picks the route on the Walk page. `/observe` classifies each photo as `matched` / `candidate` / `none` against the reviewed evidence (2 of the last 3 matched = reached) and reports taught hazards seen close ahead. MediaPipe on the phone watches for people and objects in the walking path.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript, PWA (`vite-plugin-pwa`), MediaPipe Tasks Vision (EfficientDet-Lite0) in the browser |
| Backend | FastAPI + Uvicorn, Pydantic validation, `uv`-managed Python 3.11 |
| Vision (VLM) | Pluggable provider: OpenCode Go (DeepSeek V4.1 Flash) or Gemini Developer API |
| Speech | Prebuilt Edge-TTS (`en-US-AriaNeural`), one audio queue with priorities, screen-reader mode |
| Teach | FFmpeg (system or `imageio-ffmpeg`), `faster-whisper` (CPU), MediaRecorder on the phone |
| Tests | pytest + ruff (server), vitest + Playwright + axe (web) |

## Repository structure

```
./
├── apps/server/      # FastAPI: /catalog, /routes, /observe, /speech, /app-speech, /guide/* (teach, drafts, publish); teach/prepare/evaluate CLIs
├── apps/web/         # React PWA: Walk, Teach, Review pages; state machine, voice queue, obstacle alerts
├── data/examples/    # Reviewed route bundles (3 demo legs + a sample)
├── data/runtime/     # Published routes + prebuilt audio (allowlisted); drafts and caches stay local
├── scripts/          # serve.sh, setup_https.sh, metrics.py
└── docs/             # Super final, operations, verification, demo handoff, specs
```

## Getting started

Prerequisites: Node 22+, `uv`, internet for the first build (detector model) and for the VLM and speech.

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Open <http://127.0.0.1:8000>. Copy `.env.example` to `.env` and fill in your provider key — the frontend never receives keys. Three published routes with prebuilt audio ship with the repo, so a fresh machine can walk them immediately.

For iPhone testing over LAN (HTTPS + camera), teaching from a phone and device notes, see the [operations guide](docs/PROTOTYPE_RUNBOOK.md).

## Configuration

| Variable | Purpose |
|---|---|
| `VLM_PROVIDER` | `opencode` (DeepSeek via OpenCode Go) or `gemini` |
| `OPENCODE_API_KEY` / `OPENCODE_MODEL` | Key and model for the OpenCode provider |
| `GEMINI_API_KEY` / `VLM_MODEL` | Key and model for the Gemini provider |
| `TEACH_PIN` | Guide code (4+ characters) that lets a phone teach and publish; without it only the laptop can |
| `DATA_DIR` | Optional override for the runtime data directory |

## Testing

```bash
cd apps/server
uv run python -m pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npm run test:e2e    # mock API + synthetic camera (+ real detector on local footage when present)
npm run test:real   # real server + real build, only /observe mocked
```

Measured results and honest limits: [super final verification](docs/SUPER_FINAL.md#verification-23092026-windows-laptop) and [prototype verification](docs/PROTOTYPE_VERIFICATION.md).

## Accessibility & safety

- Accessibility target: **WCAG 2.2 AA / ISO/IEC 40500:2025** (axe-checked on every page and walk phase; real NVDA/VoiceOver testing tracked in the demo handoff). No conformance certification is claimed.
- **Wayfinding aid, not a safety device.** The white cane remains the primary safety layer. Obstacle alerts can miss things (glass walls, poles, steps); hazard warnings from the cloud can come 1–2 m late; directions always come from the reviewed route.

## Limitations

- Not yet walked on site with an iPhone + VoiceOver on this branch; detector speed on iPhone unmeasured.
- Replay needs network (VLM + hosted audio); no offline localization or rerouting.
- Next means "I'm ready", not "I verified"; overrides are counted as manual, never as camera matches.

## Docs

- [Super final — video features and their verification](docs/SUPER_FINAL.md)
- [Operations guide — run, teach, HTTPS, devices](docs/PROTOTYPE_RUNBOOK.md)
- [Verification — test results and known limits](docs/PROTOTYPE_VERIFICATION.md)
- [Demo handoff — field test, deck/video checklist](docs/DEMO_HANDOFF.md)
- [Realtime replay design](docs/superpowers/specs/2026-09-22-realtime-replay-design.md)

## Team

**Offixed** — 3 members, ADC Hackathon 2026, RMIT Saigon South Campus (21–23 Sep 2026).

## Acknowledgements

Route teach-and-share inspired by [OCCAM Lab Clew](https://github.com/occamLab/Clew); original implementation by Team Offixed. No Clew code copied. Obstacle detection uses Google's MediaPipe EfficientDet-Lite0 model (Apache-2.0), downloaded at build time.

## License

No license file yet — all rights reserved. Contact the team if you want to reuse this work.
