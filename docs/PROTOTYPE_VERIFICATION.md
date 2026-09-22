# Prototype verification — test results and known limits

Internal note. **§0 covers branch `feat/realtime-replay`.** Updated after the 21/09/2026 implementation session and the 21/09/2026 evening re-run on the Windows laptop (§1b). Only records what was actually run; anything not done is marked NOT DONE. Added 22/09/2026: §1c records the real DeepSeek `/replay` smoke on frames of the reviewed route video; §1d records the Windows re-run after the capture change. Canonical backend command is now `uv run python -m pytest -q` (the plain `uv run pytest -q` launcher errored on this machine).

Locked demo route: **Lift lobby → Toilet, 2 checkpoints** (`lift-lobby-to-toilet-v1`). Approved exception to the Tier A spec's 4–5 text-sign requirement (`docs/brainstorm/specs/2026-09-21-unified-day1-nav-design.md:18-24`): accepts both text signs and wheelchair pictograms plus physical features. The `route.json` schema is unchanged.

## 0. Branch `feat/realtime-replay` (22/09/2026, Windows laptop)

This branch replaces the Check/Yes replay with the realtime flow of `docs/superpowers/specs/2026-09-22-realtime-replay-design.md` (plan: `docs/superpowers/plans/2026-09-22-realtime-replay-plan.md`). Sections 1–5 below describe the old flow and route v1 on `main`; they are kept as history. Environment: Windows 11, Git Bash, Node 24, Python 3.11 venv made by uv 0.12.17 (`uv` itself is not on PATH on this laptop, so commands ran through `apps/server/.venv/Scripts/python.exe`), Playwright Chromium + WebKit.

| Check | Command | Actual result |
|---|---|---|
| Backend | `cd apps/server && uv run python -m pytest -q` | **95 passed** (classification, `/observe` busy at 5 concurrent, `/speech` key allowlist, traversal, cache generated once for 2 concurrent requests, TTS failure 503 without writing into the route, 53 phrases/MP3s, publish refuses blank `short_name`/`expected_seconds`, teach skeleton unpublishable, DeepSeek JSON-mode schema and bad enums, `evaluate`, `scripts/metrics.py` v2) |
| Backend lint | `uv run ruff check navigation tests` (+ `scripts/metrics.py`) | **All checks passed** |
| Frontend unit | `cd apps/web && npm test` | **56 passed**: machine 36, voice 9, frameLoop 8, hints 3 |
| Frontend build | `npm run build` | pass, PWA `generateSW`, 11 precache entries (264.90 KiB) |
| Mock E2E | `npm run test:e2e` | Chromium **6/6 passed**: whole route with hint, focus on Next, 88 px Next and axe in every state; lost via `page.clock` → override No/Yes → metrics v2 download with `manual_override`; vision down after 3 errors → recovery; no override at origin; Stop drops a late result; background/reload reset. No `/observe` request while waiting for Next. WebKit 6 skipped (Windows WebKit has no `MediaStream`; idle-screen axe runs before the skip) |
| Real-build E2E | `npm run test:real` | Chromium **2/2 passed**: all 53 phrase keys served as `audio/mpeg` by the real `/speech`, unknown key 404, service worker never caches `/speech`/API; real-audio walk origin → hint → reached → Next → lost → override → unverified arrival with axe at every phase and only reviewed phrase audio fetched. WebKit 1 passed, 1 skipped. Only `/observe` mocked |
| Route publish | `uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v2 --reviewer "…" --reviewed` | Published `lift-lobby-to-toilet-v2`, `sample=False`, **53 phrases / 53 MP3s** (1.5 MB), about 2.5 min with real Edge-TTS |

**Real DeepSeek `/observe` evaluation** (`data/runtime/deepseek-observe-eval-2026-09-22.json`, 26 frames of `IMG_7545/7546/7548.MOV`, ≤640 px JPEG q85 as the web app sends; frames are team footage, not new on-site photos):

| Group | n | Result |
|---|---|---|
| Positives (origin 4, office 4, toilet 5; include far frames office 20.0 s and toilet 24.0 s) | 13 | 12 `matched`, 1 `candidate` (office 20.5 s, `left`/`far`) |
| Negatives (in-lift display "3", ground-floor lift lobby ×2, office frame for origin/toilet, lobby sofas, toilet frame for office, a different office sign, sofas on another floor, ground-floor entrance, a single wheelchair sign at the turnstiles, floor-3 lobby, glass corridor) | 13 | **0 false positives**; 11 `none`, 1 `candidate` (sofas/glass rooms on another floor, `ahead`/`far`), 1 error |
| Latency | 25 answered | p50 **3.2 s**, p95 **7.4 s** |

The one error was the 10 s provider deadline on the "different office sign" frame (10 032 ms); re-running that frame returned `target_visible=false` (`none`). Reported `position` values match the footage: office sign `left`, toilet entrance `right`/`ahead`, floor numeral `ahead`.

**Simulated walk with live DeepSeek** (one-off rehearsal, not a committed test): the real build and real server with the real provider, the synthetic camera replaying `IMG_7546.MOV` frames every 0.5 s at video speed and holding the last frame, App voice off. Origin was found 6.1 s after Start. After Next, the office checkpoint was announced **9.8 s** after the first frame where the sign is readable (20.5 s): results after that frame were `none` (+1.9 s, likely an older frame), `none` (+5.2 s), `matched` (+6.0 s), `matched` (+9.4 s); the held 21.0 s frame shows only part of the sign, so the model was not stable on it. The toilet was announced **6.0 s** after the 25.5 s frame. Result spacing was about 1.5–3.5 s, which is what 2 requests in flight give at 3–4 s per request. This supports the spec's risk "reached 3–6 s late": tune the window and pacing after the real walk.

**NOT DONE — needs people and the corridor (spec §12.4):** iPhone Safari + VoiceOver walk lift lobby → toilet with DeepSeek, both checkpoints without override, no wrong "reached", reached ≤6 s after the landmark is clearly in frame (screen recording + metrics), metrics v2 file with notes for any override. Checklist: `docs/DEMO_HANDOFF.md` §2a. Automated WebKit and axe runs do not replace VoiceOver on a real iPhone.

## 1. Passed on 21/09/2026 (current dev environment)

| Check | Command | Actual result |
|---|---|---|
| Backend API + teach + provider | `cd apps/server && uv run pytest -q` | **34 passed** |
| Backend lint | `uv run ruff check navigation tests` | **All checks passed** |
| Frontend state machine | `cd apps/web && npm test` | **8 passed** (`src/machine.test.ts:1-61`) |
| Frontend build | `npm run build` | **pass**, 38 modules, PWA `generateSW`, 11 precache entries (384.81 KiB) |
| Lift-lobby route publish | `uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 --reviewer "Team Offixed" --reviewed` (ran before this session) | Published, `approved_at 2026-09-21T11:22:08`, reviewer `Team Offixed — approved by user in session 2026-09-21`, `sample=false` |

Backend coverage (read from `apps/server/tests/`): `route.json` matches the schema in `apps/server/navigation/models.py:25-33`, origin never returns a movement instruction (`test_api.py:35-41`), insufficient evidence (wrong text/blurry/contradictory/generic) is always `matched=false` (`test_api.py:44-56`), bad requests return 404/422/503 without echoing base64 (`test_api.py:59-94`), no replay image storage (`test_api.py:17-31`), `/ingest-video` blocks non-loopback + cross-origin before parsing (`test_api.py:97-102`), atomic publish — a TTS failure never exposes a half-published route (`test_teach.py`), pictograms require every `required_features` entry (`test_provider.py`), the OpenCode adapter uses strict schema with no silent retries (`test_provider.py`).

Frontend coverage (`apps/web/e2e/replay.spec.ts`, 5 tests, mock API + synthetic camera): origin needs ≥2 matches out of 3 photos, no Next at origin; fallback only after 2 consecutive misses; Repeat never calls the VLM; override needs a separate Yes and counts a manual override; Stop/background/reload reset to origin; axe `wcag2a/wcag2aa/wcag21aa/wcag22aa` reports no serious/critical violations **on the mock**. E2E runs the real build but with a fake camera/API — **it says nothing about landmark accuracy**.

## 1b. Re-run on the Windows laptop (21/09/2026 evening, `main` @ `a28c46b` + fixes below)

Environment: Windows 11, Git Bash, Node 24.19, npm 11.17, uv 0.12.17 (Python 3.11 managed by uv), Playwright Chrome for Testing 153 + WebKit 26.6. No FFmpeg, no mkcert, no VLM key on this laptop.

| Check | Command | Actual result |
|---|---|---|
| Backend | `uv run pytest -q` | **35 passed** (34 existing + new UTF-8 publication regression test) |
| Backend lint | `uv run ruff check navigation tests` | **All checks passed** |
| Frontend state machine | `npm test` | **8 passed** |
| Frontend build | `npm run build` | **pass**, PWA `generateSW`, 11 precache entries (384.82 KiB) |
| Mock E2E | `npm run test:e2e` | Chromium **7/7 passed**. WebKit **2 passed, 5 skipped**: Playwright's Windows WebKit has no `MediaStream`/`getUserMedia`, so camera journeys skip with a stated reason instead of faking capture |
| Real build E2E (new) | `npm run test:real` | Chromium **2/2 passed**; WebKit **1 passed, 1 skipped** (idle-screen axe passed before the camera skip). Real FastAPI + real `dist` + published route + real MP3s; **only `/replay` mocked** |
| Route publish | `uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 --reviewer "Team Offixed" --reviewed` | Published in ~8 s, `sample=False`, 11 MP3 (512,928 bytes), `route.json` identical to the reviewed example |
| Serve smoke | `bash scripts/serve.sh` | `/health` ok (`vlm_configured=false`), `/` 200, `/replay` without key → **503** (not a mismatch) |
| Metrics | `uv run --project apps/server python scripts/metrics.py <session.json>` | Summarises a synthetic field session correctly (sample/field split) |

What `test:real` proves on Chromium: every prebuilt MP3 is served as `audio/mpeg`; `sw.js` never precaches `/audio/` or `/routes`; the demo route walks origin (3 photos, all ≤640 px) → s1 confirmed → s2 two misses → fallback naming the last confirmed landmark → explicit override → "Saved route finished" with "Arrival has not been visually verified"; camera released at the end; only reviewed MP3s are fetched; mock VLM text never reaches the UI; **no serious/critical axe violations** (wcag2a/2aa/21aa/22aa) at idle, origin confirm, walking, each checkpoint confirm, fallback, override and arrival. It says nothing about landmark accuracy.

Fixed in this session:
- **Windows encoding bug**: `prepare`, `storage`, `teach`, `teach_cli`, `evaluate` and `scripts/metrics.py` read/wrote JSON with the locale default (cp1252 here). A UTF-8 `review.json` containing `’` would be published as `â€™` into UI/TTS, and a Vietnamese reviewer name crashed publish with `UnicodeEncodeError`. All text I/O is now explicit UTF-8; regression test `test_reviewed_unicode_text_survives_publication_on_any_locale`.
- E2E camera journeys skip with a reason on browsers without `MediaStream` instead of failing with `canvas.captureStream is not a function`.
- `scripts/setup_https.sh` install hint now covers Windows (`winget install FiloSottile.mkcert`).

## 1c. Real provider smoke on the DeepSeek demo switch (22/09/2026, `main` @ `45e961d` + the DeepSeek adapter patch)

Context: the user chose **OpenCode Go / DeepSeek V4.1 Flash** (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`) for the hackathon demo/video. The adapter posts Chat Completions with `response_format=json_object`, the JSON schema plus an example Evidence object in the prompt, and `thinking: disabled`; the legacy MiMo branch keeps `json_schema`. The strict Pydantic parse and the evidence guard (`Evidence.supports`, `models.py:125`) are unchanged, so JSON mode cannot lower the match bar. Deadlines stay at 10 s server / 12 s browser; no auto provider fallback, no hidden retries.

| Check | Command | Actual result |
|---|---|---|
| Backend after the fail-closed fix | `cd apps/server && uv run python -m pytest -q` | **51 passed** (43 inherited + 7 malformed-200 shapes + 1 model-aware label) |
| Backend lint | `uv run ruff check navigation tests` | **All checks passed** |
| Frontend unit | `cd apps/web && npm test` | **8 passed** |
| Frontend build | `npm run build` | pass, PWA `generateSW`, 11 precache entries (384.81 KiB) |
| Mock E2E | `npm run test:e2e` | **14 passed** (Chromium 7 + WebKit 7, no skips on macOS) |
| Real-build E2E | `npm run test:real` | **4 passed** (Chromium 2 + WebKit 2); `/replay` mocked, so not live-AI evidence |

Measured on 22/09/2026 through the real `/replay` ASGI endpoint (in-process `TestClient`, real DeepSeek provider from `.env`) on frames of the reviewed route video `IMG_7546.MOV`, each sent exactly as the web app captures it: longest edge ≤640 px (640×360), JPEG quality 85. Artifact: `data/runtime/deepseek-route-smoke-2026-09-22.json` (in the repository handoff allowlist). This is **not** a fresh walk or a browser/device capture.

| Case | Video second | `step_index` | Expected | HTTP | `matched` | Correct | API ms |
|---|---|---|---|---|---|---|---|
| origin | 12.0 | -1 | true | 200 | true | yes | 3553 |
| office | 20.75 | 0 | true | 200 | true | yes | 2934 |
| toilet | 25.5 | 1 | true | 200 | true | yes | 3100 |
| office is not origin | 20.75 | -1 | false | 200 | false | yes | 3127 |
| toilet is not office | 25.5 | 0 | false | 200 | false | yes | 2755 |
| origin is not toilet | 12.0 | 1 | false | 200 | false | yes | 2674 |
| office, further away | 20.25 | 0 | true | 200 | false | **no** | 2954 |
| office, further away | 20.5 | 0 | true | 200 | false | **no** | 2658 |
| office, close | 21.0 | 0 | true | 200 | true | yes | 3457 |
| office sign out of view | 22.5 | 0 | false | 200 | false | yes | 3163 |

Ten real requests: 10/10 HTTP 200, the six core cases **6/6 correct**, 8/10 overall, **no false positives**, p50 API latency **3.03 s**, no timeouts. The two misses are the office sign filmed from further back: at 640 px the words "Office for Research" are too small to read, and the evidence guard correctly refuses unreadable text. From 20.75 s, when the sign fills the left side of the frame, the office checkpoint matches.

Honest limits for the demo:
- The 3.03 s is **single-request API time** measured around the in-process call, not three-frame origin latency or end-to-end click-to-result time.
- The user has to stop **close to the office sign**; a complete AI-verified route on a real device has not been rehearsed. Do not present "100%" or "ready" for a full real route.
- If a walkthrough uses the override button, the deck/video must label it a **manual override**, not an AI match.
- `npm run test:real` mocks `/replay`, so it does not prove live AI.

## 1d. Re-run on the Windows laptop after the capture change (22/09/2026, `main` @ `a4c2bef` + working tree)

The web capture now sends the ≤640 px JPEG straight from the camera frame; the teach pipeline sends its ≤640 px keyframes as extracted, and `navigation.evaluate` resizes each image to the same ≤640 px JPEG quality 85 as the web app before calling the provider.

| Check | Command | Actual result |
|---|---|---|
| Backend | `cd apps/server && uv run python -m pytest -q` | **50 passed** |
| Backend lint | `uv run ruff check navigation tests` | **All checks passed** |
| Frontend unit | `cd apps/web && npm test` | **8 passed** |
| Frontend build | `npm run build` | pass, PWA `generateSW`, 11 precache entries (259.78 KiB) |
| Mock E2E | `npm run test:e2e` | Chromium **5/5 passed**; WebKit 5 skipped (Windows WebKit has no `MediaStream`) |
| Real-build E2E | `npm run test:real` | Chromium **2/2 passed**; WebKit **1 passed, 1 skipped**; `/replay` mocked |

## 2. Published route (read from `data/runtime/routes/lift-lobby-to-toilet-v1/`)

- `route.json` is byte-identical to `data/examples/lift-lobby-to-toilet-v1/route.json` (s1 along the corridor to the Office for Research & Innovation sign; s2 along the same corridor to the toilet door with two wheelchair symbols plus the louvered door).
- `review.json`: origin is floor number **3** beside the lift doorway; arrival ends **outside** the toilet door; `destination_is_exterior=true`; `voice_cue` is empty because the transcript was unreliable (see `data/examples/lift-lobby-to-toilet-v1/README.md:1-5`).
- Prebuilt Edge-TTS audio (`en-US-AriaNeural`): 11 MP3 files, ~513 KB total (origin 42 KB, retry 41 KB, s0/s1-instruction ~59 KB each, questions 28–32 KB, fallback 58–60 KB per anchor, override 26 KB, arrival 43 KB). Published atomically via rename; published routes are immutable — `prepare` refuses to overwrite.

## 3. Provider probes actually measured (not ground truth)

**Current demo provider (22/09/2026): OpenCode Go / DeepSeek V4.1 Flash — see §1c.** The MiMo probe below is the earlier investigation, kept as history.

`data/runtime/model-probe.json` (OpenCode Go `mimo-v2.5`, synthetic text signs, `synthetic_only=true`): 1/1 correct match, 2 cases with `unavailable_or_timeout`, latency **10.4–11.5 s** — above the plan's p50 ≤5 s target. Conclusion in `docs/PROTOTYPE_RUNBOOK.md:100-106`: keep `VLM_PROVIDER=gemini` as default, `opencode` is demo opt-in only; do not switch to Muse Spark (different Responses API plus training-consent terms). `/health` only reports that a key is configured, never that quota is valid.

Real-VLM evaluation is **NOT DONE**: use `apps/server/navigation/evaluate.py:14-44` with a local manifest (minimum 3 fresh images per landmark, 10 negatives, true/false origin; `image` paths are relative to the manifest; never commit real images). Command in `docs/PROTOTYPE_RUNBOOK.md:127-132`. Report false positives separately.

## 4. Known limits (do not pitch the opposite)

- No obstacle detection, no offline localization, no AI-generated directions during replay — instructions always come from the reviewed route (`apps/server/navigation/main.py:88-94`).
- Origin requires 3 photos with ≥2 matches plus Yes before starting; no Next at origin. Two consecutive non-matches trigger fallback; Next needs a separate Yes and counts a manual override (`apps/web/src/machine.ts:15-55`).
- Each provider request has a 10 s server deadline; 503 ≠ image mismatch; no hidden retries; Repeat only replays the MP3 (`docs/PROTOTYPE_RUNBOOK.md:89-98`).
- "Offline" teach still needs network for the VLM + Edge-TTS; `faster-whisper base.en` runs on CPU and echoey/accented transcripts must be hand-fixed; a `voice_cue` that does not match the transcript is deleted (`apps/server/navigation/teach.py:186-189`).
- Unreviewed leftover draft: `data/runtime/drafts/lift-lobby-vlm-draft/` (VLM-generated route, non-conforming step IDs, unverified `voice_cue` quotes) — never publish, never demo. Delete or re-review before the freeze.
- Keys, certificates, source media, downloaded models and other runtime data remain ignored by Git. The reviewed `lift-lobby-to-toilet-v1` route JSON, `published.json`, its 11 generated MP3s and the two DeepSeek result JSON files are explicit handoff exceptions (see `DEMO_HANDOFF.md`). Source videos/frames in `data/runtime/source-media/` remain local or on Drive.

## 5. Status of the pre-freeze checklist (needed before the 15:00 22/09 freeze)

Automated checks — current on macOS 22/09/2026 (see §1c):
- [x] `npm run test:e2e` on Chromium + WebKit — **14 passed** (Chromium 7 + WebKit 7, no skips) on macOS; the earlier Windows WebKit skips are historical (§1b).
- [x] `npm run test:real` on Chromium + WebKit — **4 passed** (Chromium 2 + WebKit 2) against the real server, `dist`, published route and prebuilt MP3s; **`/replay` mocked**, so this is not live-AI evidence.
- [x] axe on the real build — Chromium + WebKit, with VLM mocked (§1c).
- [x] Original prototype committed — `6d67ad8` on `main`; the DeepSeek adapter, updated documentation and demo assets are included in the 22/09 handoff commit (see Git history).

Historical, kept for reference — Windows laptop 21/09/2026 (§1b): `npm run test:e2e` Chromium 7/7, WebKit 2 passed + 5 skipped; `npm run test:real` Chromium 2/2, WebKit 1 passed + 1 skipped. Windows WebKit has no `MediaStream`, so its camera journeys skip.

Still NOT DONE (need hardware, people or fresh captures — cannot be done from code):
- [ ] Real-VLM evaluation with false-positive/latency numbers — run `navigation.evaluate` with a local manifest (minimum 3 fresh images per landmark, 10 negatives, true/false origin). Partly covered on macOS 22/09 — §1c has 6 real `/replay` frames and p50 API latency on existing frames. Use the already-configured OpenCode provider/key (`VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`); no separate Gemini key setup is needed for the demo.
- [ ] At least 3 full walks plus `scripts/metrics.py` over session metrics with sample/field split (`scripts/metrics.py:8-30`).
- [ ] Real NVDA on Windows + VoiceOver/Safari on a real iPhone (screen recording with audio). Automated axe and WebKit automation do not replace these.
- [ ] Same-LAN HTTPS test (`scripts/setup_https.sh` + `scripts/serve.sh --https`) whenever the laptop IP changes — historical Windows note: mkcert not installed on the Windows laptop yet; allow Python through the firewall for Private networks only.
