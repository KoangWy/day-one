> **English** (default) | [Tiếng Việt](./README.vi.md)

# Day One

An indoor wayfinding prototype for visually impaired employees on their first days in an unfamiliar office — by **Team Offixed**, built at **ADC Hackathon 2026** (AI & Employability, Visual Impairment track).

Instead of describing the world for the blind person, Day One fixes the route at the source: a colleague records a walk once, a reviewer approves it, and the employee replays it checkpoint by checkpoint — with AI matching landmarks and the human always confirming.

## Why Day One

Starting a new job is stressful for anyone. For visually impaired employees, an unfamiliar building — lift lobby, long corridors, identical doors — can mean depending on colleagues for every trip to the toilet or meeting room. Existing tools describe whatever the camera sees, but they don't know *your* office route and can't guarantee the instruction is correct.

Day One takes a narrower, more reliable approach: one saved route, reviewed by a human, replayed with human confirmation at every step.

## What it does

- **Teach once** — record a walk on video; the system drafts route steps, landmarks, and recognition criteria.
- **Human review** — a reviewer fixes directions, required signs/features, questions, and the arrival message before anything is published.
- **Guided replay** — the PWA checks the starting point with 3 photos, then verifies each checkpoint from a single photo. Every step advances only after the user confirms.
- **Prebuilt voice guidance** — all instructions are pre-synthesized audio (Edge-TTS), so replay never depends on live text-to-speech.
- **Privacy by design** — replay photos are never stored; API keys stay on the server and never reach the frontend.
- **Installable PWA** — app shell works from the home screen; service worker never caches API, photos, or audio.

## How it works

```
Teach (video) → Review (human) → Publish (immutable) → Replay (AI match + human Yes)
```

1. A colleague records the route and uploads the video (`POST /ingest-video` or the teach CLI).
2. A reviewer corrects the draft (`route.json`, `review.json`, transcript) and publishes it — published routes are immutable.
3. The employee opens the PWA, confirms the starting point, and walks checkpoint by checkpoint. The VLM matches each photo against the reviewed criteria; a **Yes** from the user is required to advance. Two consecutive misses open a fallback naming the last confirmed landmark.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript, PWA (`vite-plugin-pwa`) |
| Backend | FastAPI + Uvicorn, Pydantic validation, `uv`-managed Python 3.11 |
| Vision (VLM) | Pluggable provider: OpenCode Go (DeepSeek V4.1 Flash) or Gemini Developer API |
| Speech | Prebuilt Edge-TTS (`en-US-AriaNeural`); Web Audio playback with screen-reader mode |
| Teach transcription | `faster-whisper` (CPU) + hand-fixed transcripts |
| Tests | pytest + ruff (server), vitest + Playwright + axe (web) |

## Repository structure

```
./
├── apps/server/      # FastAPI: /routes, /replay, /audio, /ingest-video; teach/prepare/evaluate CLIs
├── apps/web/         # React + Vite PWA (replay UI, state machine, metrics export)
├── data/examples/    # Reviewed route fixtures (demo: lift-lobby-to-toilet-v1)
├── data/runtime/     # Published route + prebuilt audio (handoff allowlist only; rest gitignored)
├── scripts/          # serve.sh, setup_https.sh, metrics.py
└── docs/             # Build guides, verification results, demo handoff
```

## Getting started

Prerequisites: Node 22+, `uv`, FFmpeg (teach only).

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Open <http://127.0.0.1:8000>. Copy `.env.example` to `.env` and fill in your provider key — the frontend never receives keys. The repo ships a published demo route with prebuilt audio, so a fresh machine can replay immediately without re-running teach or TTS.

For iPhone testing over LAN (HTTPS + camera), teach flow, and device notes, see the [operations guide](docs/PROTOTYPE_RUNBOOK.md).

## Configuration

| Variable | Purpose |
|---|---|
| `VLM_PROVIDER` | `opencode` (DeepSeek via OpenCode Go) or `gemini` |
| `OPENCODE_API_KEY` / `OPENCODE_MODEL` | Key and model for the OpenCode provider |
| `GEMINI_API_KEY` / `VLM_MODEL` | Key and model for the Gemini provider |
| `DATA_DIR` | Optional override for the runtime data directory |

## Testing

```bash
cd apps/server
uv run python -m pytest -q
uv run ruff check navigation tests
cd ../web
npm test
npm run build
npm run test:e2e    # mock API + synthetic camera
npm run test:real   # real server + real build, only /replay mocked
```

Measured results and honest limits are recorded in [verification](docs/PROTOTYPE_VERIFICATION.md) — including a real-provider smoke test (10 requests, 6/6 core cases correct, no false positives, p50 ≈ 3 s).

## Accessibility & safety

- Accessibility target: **WCAG 2.2 AA / ISO/IEC 40500:2025** (axe-checked at every replay phase; real NVDA/VoiceOver testing tracked in the demo handoff). No conformance certification is claimed.
- **Wayfinding aid, not a safety device.** The white cane remains the primary safety layer. No obstacle detection, no offline localization, no AI-invented directions — instructions always come from the reviewed route.

## Limitations

- One saved route at a time; no live exploration or rerouting.
- Replay needs network (VLM + hosted audio); "offline" teach means pre-walk preparation only.
- Landmark matching needs the sign to fill enough of the frame — stand close to signs.
- Every checkpoint requires an explicit user **Yes**; overrides are counted as manual, never as AI matches.

## Docs

- [Operations guide — run, teach, HTTPS, devices](docs/PROTOTYPE_RUNBOOK.md)
- [Verification — test results and known limits](docs/PROTOTYPE_VERIFICATION.md)
- [Demo handoff — field test, deck/video checklist](docs/DEMO_HANDOFF.md)
- [Demo route review](data/examples/lift-lobby-to-toilet-v1/README.md)

## Team

**Offixed** — 3 members, ADC Hackathon 2026, RMIT Saigon South Campus (21–23 Sep 2026).

## Acknowledgements

Route teach-and-share inspired by [OCCAM Lab Clew](https://github.com/occamLab/Clew); original implementation by Team Offixed. No Clew code copied.

## License

No license file yet — all rights reserved. Contact the team if you want to reuse this work.
