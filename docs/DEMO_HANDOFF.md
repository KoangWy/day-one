# Demo handoff — run checklist, field test, deck/video

Internal note. Single demo route: `lift-lobby-to-toilet-v1` (Lift lobby → Toilet, 2 checkpoints). All UI, directions, and audio are in English.

## 1. Run the demo on the laptop (backend + frontend + build verified)

```bash
cd apps/server
uv sync --all-extras --frozen
cd ../web
npm ci
cd ../..
uv run --project apps/server python scripts/setup_assets.py
cd apps/web
npm run build
cd ../..
bash scripts/serve.sh
```

Open `http://127.0.0.1:8000`. Configure `.env` from `.env.example` (the frontend never receives keys). Published routes are immutable — skip `prepare` when `data/runtime/routes/lift-lobby-to-toilet-v1/` already exists:

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-toilet-v1 \
  --reviewer "Team Offixed" --reviewed
```

Teach/HTTPS/device details: `docs/PROTOTYPE_RUNBOOK.md`. Test results + limits: `docs/PROTOTYPE_VERIFICATION.md`.

## 2. On-site field test (finish before the 15:00 22/09 freeze)

- [ ] Real iPhone: same-LAN HTTPS (`bash scripts/setup_https.sh <LAN-IP>` then `bash scripts/serve.sh --https`), install + trust the CA, grant camera in Safari, try Add to Home Screen too. Record real corridor footage.
- [ ] Real Windows machine: open the HTTPS URL, run **real NVDA**, complete origin → s1 → s2 → arrival by keyboard only, screen-record with audio.
- [ ] Film only in a consented area, avoid bystanders/sensitive info; the white cane stays the primary safety layer. No blindfold demos with volunteers.
- [ ] Remove the leftover draft `data/runtime/drafts/lift-lobby-vlm-draft/` (not a reviewed route) before recording.
- [ ] Each walk: use Download session metrics in the UI. Complete at least 3 full walks, then aggregate (sample/field kept separate):

```bash
python3 scripts/metrics.py session1.json session2.json session3.json
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
