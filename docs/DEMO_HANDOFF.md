> **English** (default) | [Tiếng Việt](./DEMO_HANDOFF.vi.md)

# Demo handoff — run checklist, field test, deck/video

Internal note. **Branch `super-final-project`** adds the demo video's features to the realtime app: teach and review on the phone, three chained routes (main entrance → lift lobby → meeting room or toilet), route hazards, on-phone obstacle alerts and the Wear your phone card. What was built, how it was verified and what is still open: [SUPER_FINAL.md](SUPER_FINAL.md). Before a demo on this branch, walk the three routes once on site with the iPhone (checklist 2a applies to each), and try one obstacle alert with a colleague walking towards the phone.

**On branch `feat/realtime-replay`** the demo route is `lift-lobby-to-toilet-v2` (Lift lobby → Toilet, 2 checkpoints, same reviewed directions and evidence as v1) and replay is the realtime flow: the camera sends a photo every 1–3 s while walking, the app announces each landmark with reviewed template sentences and waits for **Next** (ready, not verified). `main` keeps v1 and the Check/Yes flow for the 23/09 submission. All UI, directions, and audio are in English. Demo provider selected on 22/09/2026: **OpenCode Go / DeepSeek V4.1 Flash**; set `VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash` in the local `.env` and restart the server. The idle-screen consent must name DeepSeek.

**Realtime `/observe` status (22/09/2026, this branch).** `navigation.evaluate` on 26 route-footage frames (13 positive including far views, 13 negative including hard negatives such as the in-lift floor display, the ground-floor lift lobby, a different office sign and a single wheelchair sign): 12/13 positives `matched`, **0 false positives**, `candidate` on 1/13 positives and 1/12 answered negatives, p50 **3.2 s**, p95 7.4 s, one 10 s provider timeout (`data/runtime/deepseek-observe-eval-2026-09-22.json`). A simulated walk (real app, real server, real DeepSeek, camera replaying `IMG_7546.MOV` frames at video speed) reached the toilet **6.0 s** after the wheelchair signs were clearly in frame and the office sign **9.8 s** after it became readable; see `docs/PROTOTYPE_VERIFICATION.md` §0. These are footage replays, not the required on-site walk.

**Measured AI status of the old `/replay` flow (22/09/2026, `main`).** Real `/replay` on frames of the reviewed route video `IMG_7546.MOV`, sent exactly as the web app captures them (longest edge ≤640 px, JPEG quality 85): 10/10 HTTP 200, the six core cases (origin, office, toilet and three cross-checks) **6/6 correct**, **no false positives**, p50 API about **3.0 s**, no timeouts (`data/runtime/deepseek-route-smoke-2026-09-22.json`). The office sign must fill enough of the frame: from about 20.75 s onward it matches, from further away (20.25 s, 20.5 s) the text is too small and it is correctly refused. This is a frame smoke test, not a completed walk: before filming a fully AI-verified route, rehearse on a real device and stop close to the office sign; any override-button use in the video must be labeled a **manual override**. Details: `docs/PROTOTYPE_VERIFICATION.md` §1c.

## Source video

- [Google Drive folder with source videos](https://drive.google.com/drive/u/0/folders/1JMS3SMx0U5kOF_lFNu6eB4SwSjnMFs7w) — provided by the user in the Tier A build session; link restored into the repo on 22/09/2026.
- Local download and extracted frames on this machine: `data/runtime/source-media/` (ignored by Git).
- This is the prototype's video source; the final presentation video status is tracked separately in the submission checklist below.

## Demo data shipped with the repo

On branch `super-final-project`, `.gitignore` allows exactly these files to be committed/pushed with the code:

- Three published routes, each with `route.json`, `published.json` (reviewed content, `short_name`/`expected_seconds`, hazards and every template sentence in `assets.phrases`) and one Edge-TTS MP3 per phrase in `audio/`:
  - `data/runtime/routes/lift-lobby-to-toilet-v2/` — Lift lobby → Toilet entrance, 53 MP3s.
  - `data/runtime/routes/entrance-to-lift-lobby-v1/` — Main entrance → Lift lobby (automatic-door warning), 56 MP3s.
  - `data/runtime/routes/lift-lobby-to-meeting-room-v1/` — Lift lobby → Meeting room 2.3.001 (glass-door warning), 56 MP3s.
- `data/runtime/deepseek-observe-eval-2026-09-22.json` and `data/runtime/deepseek-super-final-eval-2026-09-23.json`: `/observe` evaluations on footage frames, no images/base64 or credentials.
- `data/runtime/deepseek-route-smoke-2026-09-22.json`: measurements of the old `/replay` flow, kept as history.

The v1 route (`lift-lobby-to-toilet-v1`) is not on this branch because its `published.json` does not fit the realtime schema; it stays on `main`. A clone/pull has every route ready; no TTS call is needed. A sentence whose MP3 is missing is generated once by `/speech` into `data/runtime/tts-cache/`. The obstacle model is downloaded by `npm run build`, not shipped. `.env` (and `TEACH_PIN`) is still shared separately; with a custom `DATA_DIR`, copy the routes into `<DATA_DIR>/routes/`.

Source videos/frames, drafts, runtime logs, new test results, other routes and off-list MP3s stay Git-ignored. A fresh machine still builds the frontend; create HTTPS certificates for the new machine IP when using an iPhone.

## 1. Run the demo on the laptop (backend + frontend + build verified)

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
npm run build
cd ../..
bash scripts/serve.sh
```

Open `http://127.0.0.1:8000`. Configure `.env` from `.env.example` (the frontend never receives keys). Published routes are immutable — skip `prepare` when `data/runtime/routes/lift-lobby-to-toilet-v2/` already exists (publishing makes 53 MP3s and takes about 2–3 minutes):

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v2 \
  --reviewer "Team Offixed" --reviewed
```

Pre-demo self-check on the laptop (real server + real build + published route and `/speech`, only `/observe` mocked, axe at every phase; Chromium 2/2 on this branch 22/09):

```bash
cd apps/web
npm run test:real
```

Windows laptop: install uv with `py -m pip install --user uv`, run commands from Git Bash, and use `uv run --project apps/server python ...` wherever a step says `python3`.

Teach/HTTPS/device details: `docs/PROTOTYPE_RUNBOOK.md`. Test results + limits: `docs/PROTOTYPE_VERIFICATION.md`.

## 2. On-site field test

### 2a. Realtime replay acceptance (spec §12.4, required before calling the branch done)

Agents cannot do this part: it needs a person with an iPhone in the corridor. iPhone Safari + VoiceOver, lift lobby → toilet, provider DeepSeek, screen recording with audio.

- [ ] Both checkpoints reached **without any override**.
- [ ] **No wrong "reached"** announcement.
- [ ] "Reached" within **≤6 s** of the landmark being clearly in frame (measure from the screen recording and `time_to_reach_ms` in the metrics). Two footage simulations with live DeepSeek gave toilet 6.0 s / 7.5 s and office 9.8 s / 11.3 s; the target holds only when DeepSeek answers in about 3 s, so note the `latency_p50_ms` of each step and stop facing the office sign squarely.
- [ ] A **version 2 metrics file** for the walk (Session record → Download session metrics), with a note for every override, summarised by `scripts/metrics.py`.
- [ ] Watch battery and heat during the walk (one JPEG per second).
- [ ] Optional re-evaluation with new on-site photos: at least 3 per landmark and 10 negatives, `navigation.evaluate … --route lift-lobby-to-toilet-v2`.

If the timing misses the target, the constants to tune are in `apps/web/src/machine.ts` (2 of 3 window, step budget) and `apps/web/src/frameLoop.ts` (2 in flight, 1 s gap); the server allows 4 concurrent `/observe`.

### 2b. Earlier checklist (Check/Yes flow on `main`, 15:00 22/09 freeze)

- [ ] Real iPhone: same-LAN HTTPS (`bash scripts/setup_https.sh <LAN-IP>` then `bash scripts/serve.sh --https`), install + trust the CA, grant camera in Safari, try Add to Home Screen too. Record real corridor footage.
- [ ] Real Windows machine: open the HTTPS URL, run **real NVDA**, complete origin → s1 → s2 → arrival by keyboard only, screen-record with audio.
- [ ] Film only in a consented area, avoid bystanders/sensitive info; the white cane stays the primary safety layer. No blindfold demos with volunteers.
- [ ] Remove the leftover draft `data/runtime/drafts/lift-lobby-vlm-draft/` (not a reviewed route) before recording.
- [ ] Rehearse the office checkpoint standing close to the sign (the footage only matches once the sign fills the left of the frame) before recording a fully AI-verified route; if it still does not match, label that checkpoint a manual override in the video.
- [ ] Each walk: use Download session metrics in the UI. Complete at least 3 full walks, then aggregate (sample/field kept separate):

```bash
python3 scripts/metrics.py session1.json session2.json session3.json
# Windows: uv run --project apps/server python scripts/metrics.py session1.json session2.json session3.json
```

- [ ] Real-VLM evaluation with a local manifest (3 fresh images per landmark, 10 negatives, true/false origin; never commit real images):

```bash
cd apps/server
uv run python -m navigation.evaluate /private/eval/cases.json --output /private/eval/results.json
```

## 3. Deck + video (submit on the evening of 22/09; hard deadline 07:00 23/09/2026)

Source: `docs/ADC_Hackathon_2026_Thong_tin_cuoc_thi.md:52-69`. The team's private submission link arrives from organizers around 13:00 on 22/09 (not stored in this repo).

- [ ] Deck uses the official template (`https://apps.rmit.edu.vn/r/aao`), in English, exported as **.pptx** (no PDF/link). Keep slides 1–6 in exact order; extra content from slide 7 onward. Filename `OFFIXED_<PROJECT TITLE>.pptx`.
- [ ] Required content: differentiator table (GoodMaps/Clew/Be My Eyes), real measured metrics (teach time including manual review, replay success, p50, manual overrides), credit line `Route teach-and-share inspired by OCCAM Lab Clew; original implementation by Team Offixed`, consent/retention, `Wayfinding aid, not a safety device`, `Accessibility target: WCAG 2.2 AA / ISO/IEC 40500:2025` (state the test scope, never claim certification).
- [ ] Video **under 5 minutes**, **MP4/MOV**, **16:9**, English, slides visible throughout. Tier A script: 0:00–0:30 problem → 0:30–1:00 teach recap (pre-recorded + log, labeled as such) → 1:00–3:30 replay with origin + checkpoints + arrival → 3:30–4:30 differentiators + honesty note → 4:30–5:00 metrics + disclaimer + ask.
- [ ] Rubric: Innovation & Impact · User-Centered Design & Accessibility · Feasibility & Practicality · Utilization of AI (+ Presentation & Communication in the finale): `https://apps.rmit.edu.vn/r/ADC2026`.
- [ ] After submitting: complete the Post-event survey before 14:00 on 23/09 for Lucky Draw eligibility; stay after the finale to share details with sponsors.

## 4. Suggested split (3 people, per the Tier A spec)

- PWA + accessible UI + audio playback + iPhone/VoiceOver testing.
- Teach/backend + route freeze + cleanup + metrics log.
- Replay/VLM prompts + evaluation + video/deck assembly.

Priority: one real origin → arrival walk before any UI polish. Keep the typed/button fallback and hand-fixed transcripts; do not add Future Work items (realtime YOLO, CLIP, streaming, place graph, vibration, buddy ping, barometer, background run, Vietnamese voice, live teach).
