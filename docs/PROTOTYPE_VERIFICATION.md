# Prototype verification — test results and known limits

Internal note. Updated after the 21/09/2026 implementation session. Only records what was actually run; anything not done is marked NOT DONE.

Locked demo route: **Lift lobby → Toilet, 2 checkpoints** (`lift-lobby-to-toilet-v1`). Approved exception to the Tier A spec's 4–5 text-sign requirement (`docs/brainstorm/specs/2026-09-21-unified-day1-nav-design.md:18-24`): accepts both text signs and wheelchair pictograms plus physical features. The `route.json` schema is unchanged.

## 1. Passed on 21/09/2026 (current dev environment)

| Check | Command | Actual result |
|---|---|---|
| Backend API + teach + provider | `cd apps/server && uv run pytest -q` | **34 passed** |
| Backend lint | `uv run ruff check navigation tests` | **All checks passed** |
| Frontend state machine | `cd apps/web && npm test` | **8 passed** (`src/machine.test.ts:1-61`) |
| Frontend build | `npm run build` | **pass**, 38 modules, PWA `generateSW`, 11 precache entries (384.81 KiB) |
| Lift-lobby route publish | `uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 --reviewer "Team Offixed" --reviewed` (ran before this session) | Published, `approved_at 2026-09-21T11:22:08`, reviewer `Team Offixed — approved by user in session 2026-09-21`, `sample=false` |

Backend coverage (read from `apps/server/tests/`): `route.json` matches the schema in `apps/server/navigation/models.py:25-33`, origin never returns a movement instruction (`test_api.py:35-41`), insufficient evidence (wrong text/blurry/contradictory/generic) is always `matched=false` (`test_api.py:44-56`), bad requests return 404/422/503 without echoing base64 (`test_api.py:59-94`), no replay image storage (`test_api.py:17-31`), `/ingest-video` blocks non-loopback + cross-origin before parsing (`test_api.py:97-102`), atomic publish — a TTS failure never exposes a half-published route (`test_teach.py`), pictograms require every `required_features` entry (`test_provider.py`), the OpenCode adapter uses strict schema with no silent retries (`test_provider.py`).

Frontend coverage (`apps/web/e2e/replay.spec.ts`, 7 tests, mock API + synthetic camera): origin needs ≥2 matches out of 3 photos, no Next at origin; fallback only after 2 consecutive misses; Repeat never calls the VLM; override needs a separate Yes and counts a manual override; Stop/background/reload reset to origin; a failed face model blocks all uploads; axe `wcag2a/wcag2aa/wcag21aa/wcag22aa` reports no serious/critical violations **on the mock**. E2E runs the real MediaPipe/WASM build but with a fake camera/API — **it says nothing about landmark accuracy**.

## 2. Published route (read from `data/runtime/routes/lift-lobby-to-toilet-v1/`)

- `route.json` is byte-identical to `data/examples/lift-lobby-to-toilet-v1/route.json` (s1 along the corridor to the Office for Research & Innovation sign; s2 along the same corridor to the toilet door with two wheelchair symbols plus the louvered door).
- `review.json`: origin is floor number **3** beside the lift doorway; arrival ends **outside** the toilet door; `destination_is_exterior=true`; `voice_cue` is empty because the transcript was unreliable (see `data/examples/lift-lobby-to-toilet-v1/README.md:1-5`).
- Prebuilt Edge-TTS audio (`en-US-AriaNeural`): 11 MP3 files, ~513 KB total (origin 42 KB, retry 41 KB, s0/s1-instruction ~59 KB each, questions 28–32 KB, fallback 58–60 KB per anchor, override 26 KB, arrival 43 KB). Published atomically via rename; published routes are immutable — `prepare` refuses to overwrite.

## 3. Provider probes actually measured (not ground truth)

`data/runtime/model-probe.json` (OpenCode Go `mimo-v2.5`, synthetic text signs, `synthetic_only=true`): 1/1 correct match, 2 cases with `unavailable_or_timeout`, latency **10.4–11.5 s** — above the plan's p50 ≤5 s target. Conclusion in `docs/PROTOTYPE_RUNBOOK.md:100-106`: keep `VLM_PROVIDER=gemini` as default, `opencode` is demo opt-in only; do not switch to Muse Spark (different Responses API plus training-consent terms). `/health` only reports that a key is configured, never that quota is valid.

Real-VLM evaluation is **NOT DONE**: use `apps/server/navigation/evaluate.py:14-44` with a local manifest (minimum 3 fresh images per landmark, 10 negatives, true/false origin; `image` paths are relative to the manifest; never commit real images). Command in `docs/PROTOTYPE_RUNBOOK.md:127-132`. Report false positives separately.

## 4. Known limits (do not pitch the opposite)

- No obstacle detection, no offline localization, no AI-generated directions during replay — instructions always come from the reviewed route (`apps/server/navigation/main.py:88-94`).
- Origin requires 3 photos with ≥2 matches plus Yes before starting; no Next at origin. Two consecutive non-matches trigger fallback; Next needs a separate Yes and counts a manual override (`apps/web/src/machine.ts:15-55`).
- Each provider request has a 10 s server deadline; 503 ≠ image mismatch; no hidden retries; Repeat only replays the MP3 (`docs/PROTOTYPE_RUNBOOK.md:89-98`).
- "Offline" teach still needs network for the VLM + Edge-TTS; `faster-whisper base.en` runs on CPU and echoey/accented transcripts must be hand-fixed; a `voice_cue` that does not match the transcript is deleted (`apps/server/navigation/teach.py:186-189`).
- Unreviewed leftover draft: `data/runtime/drafts/lift-lobby-vlm-draft/` (VLM-generated route, non-conforming step IDs, unverified `voice_cue` quotes) — never publish, never demo. Delete or re-review before the freeze.
- Media/keys/runtime are local-only data, ignored by Git (`.gitignore`): `.env`, `*.pem/key/crt`, `*.mp3/wav/mp4/mov`, `data/runtime/`, `data/models/`, `apps/web/public/privacy/`, `.certs/`. Source videos in `data/runtime/source-media/` (~147 MB MOV) are never committed.

## 5. NOT DONE (needed before the 15:00 22/09 freeze)

- [ ] `npm run test:e2e` on Chromium + WebKit (requires `npx playwright install chromium webkit`).
- [ ] Real-VLM evaluation with false-positive/latency numbers.
- [ ] At least 3 full walks plus `python3 scripts/metrics.py` over session metrics with sample/field split (`scripts/metrics.py:8-30`).
- [ ] Real NVDA on Windows + VoiceOver/Safari on a real iPhone (screen recording with audio); axe on the real build.
- [ ] Same-LAN HTTPS test (`scripts/setup_https.sh` + `scripts/serve.sh --https`) whenever the laptop IP changes.
- [ ] Commit the currently untracked prototype (`apps/`, `data/examples/`, `scripts/`, `README.md`, `docs/PROTOTYPE_RUNBOOK.md`, `.env.example`, `.gitignore`) — still only in the working tree.
