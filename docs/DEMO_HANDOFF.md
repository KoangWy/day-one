# Demo handoff — run checklist, field test, deck/video

Internal note. **On branch `feat/realtime-replay`** the demo route is `lift-lobby-to-toilet-v2` (Lift lobby → Toilet, 2 checkpoints, same reviewed directions and evidence as v1) and replay is the realtime flow: the camera sends a photo every 1–3 s while walking, the app announces each landmark with reviewed template sentences and waits for **Next** (ready, not verified). `main` keeps v1 and the Check/Yes flow for the 23/09 submission. All UI, directions, and audio are in English. Demo provider selected on 22/09/2026: **OpenCode Go / DeepSeek V4.1 Flash**; set `VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash` in the local `.env` and restart the server. The idle-screen consent must name DeepSeek.

**Realtime `/observe` status (22/09/2026, this branch).** `navigation.evaluate` on 26 route-footage frames (13 positive including far views, 13 negative including hard negatives such as the in-lift floor display, the ground-floor lift lobby, a different office sign and a single wheelchair sign): 12/13 positives `matched`, **0 false positives**, `candidate` on 1/13 positives and 1/12 answered negatives, p50 **3.2 s**, p95 7.4 s, one 10 s provider timeout (`data/runtime/deepseek-observe-eval-2026-09-22.json`). A simulated walk (real app, real server, real DeepSeek, camera replaying `IMG_7546.MOV` frames at video speed) reached the toilet **6.0 s** after the wheelchair signs were clearly in frame and the office sign **9.8 s** after it became readable; see `docs/PROTOTYPE_VERIFICATION.md` §0. These are footage replays, not the required on-site walk.

**Measured AI status of the old `/replay` flow (22/09/2026, `main`).** Real `/replay` on frames of the reviewed route video `IMG_7546.MOV`, sent exactly as the web app captures them (longest edge ≤640 px, JPEG quality 85): 10/10 HTTP 200, the six core cases (origin, office, toilet and three cross-checks) **6/6 correct**, **no false positives**, p50 API about **3.0 s**, no timeouts (`data/runtime/deepseek-route-smoke-2026-09-22.json`). The office sign must fill enough of the frame: from about 20.75 s onward it matches, from further away (20.25 s, 20.5 s) the text is too small and it is correctly refused. This is a frame smoke test, not a completed walk: before filming a fully AI-verified route, rehearse on a real device and stop close to the office sign; any override-button use in the video must be labeled a **manual override**. Details: `docs/PROTOTYPE_VERIFICATION.md` §1c.

## Video nguồn

- [Thư mục Google Drive chứa video nguồn](https://drive.google.com/drive/u/0/folders/1JMS3SMx0U5kOF_lFNu6eB4SwSjnMFs7w) — người dùng cung cấp trong session triển khai Tier A; khôi phục link vào repo ngày 22/09/2026.
- Bản tải về và frame trích xuất trên máy: `data/runtime/source-media/` (bị Git bỏ qua).
- Đây là nguồn video phục vụ prototype; trạng thái video thuyết trình cuối cùng được theo dõi riêng ở checklist bài nộp bên dưới.

## Dữ liệu demo đi cùng repo

Trên branch `feat/realtime-replay`, `.gitignore` cho phép đúng các file sau để commit/push cùng code:

- `data/runtime/routes/lift-lobby-to-toilet-v2/route.json` và `published.json`: nội dung đã duyệt, `short_name`/`expected_seconds` từng mốc và toàn bộ 53 câu mẫu (`assets.phrases`).
- 53 MP3 Edge-TTS trong `data/runtime/routes/lift-lobby-to-toilet-v2/audio/`, mỗi key trong `phrases` một file (khoảng 1,5 MB).
- `data/runtime/deepseek-observe-eval-2026-09-22.json`: đánh giá `/observe` trên frame footage, không chứa ảnh/base64 hoặc credential.
- `data/runtime/deepseek-route-smoke-2026-09-22.json`: số đo luồng `/replay` cũ, giữ làm lịch sử.

Tổng cộng 57 file, khoảng 1,5 MB. Tuyến v1 (`data/runtime/routes/lift-lobby-to-toilet-v1/`) đã bị gỡ khỏi branch này vì `published.json` v1 không hợp lệ với schema mới; nó vẫn nằm trên `main`. Teammate clone/pull branch sẽ có sẵn tuyến v2; không cần gọi lại TTS. Câu nào thiếu MP3 sẽ được `/speech` tạo một lần bằng Edge-TTS vào `data/runtime/tts-cache/` (bị Git bỏ qua). `.env` vẫn gửi riêng. Dùng `DATA_DIR` mặc định; nếu cấu hình thư mục khác, cần chép tuyến vào `<DATA_DIR>/routes/`.

Video/frame nguồn, draft, log runtime, kết quả thử mới, route khác và MP3 ngoài danh sách vẫn bị Git bỏ qua. Trên máy mới vẫn build frontend; tạo chứng chỉ HTTPS theo IP máy mới nếu dùng iPhone.

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
- [ ] "Reached" within **≤6 s** of the landmark being clearly in frame (measure from the screen recording and `time_to_reach_ms` in the metrics). The footage simulation gave 6.0 s (toilet) and 9.8 s (office), so stop and face the office sign squarely.
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
