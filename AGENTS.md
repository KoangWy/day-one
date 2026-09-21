# AGENTS.md

Docs-only prep workspace for **Team Offixed** at **ADC Hackathon 2026** (RMIT Saigon South campus, Mon 21 – Wed 23 Sep 2026, in-person). Git repo tracked on `main`. Core references live in `docs/`.

## Read these first
- `docs/ADC_Hackathon_2026_Competition_Brief_Stages.md` — official competition brief breaking down all 6 stages of the employability lifecycle for visually impaired candidates and employees (contrasting People with Lived Experience vs. HR/Industry Perspectives, root causes, constraints, and AI hackathon angles). In English. (Raw source photos in `docs/competition brief/` are gitignored).
- `docs/ADC_Hackathon_2026_Thong_tin_cuoc_thi.md` (147 lines) — competition rules, schedule, submission requirements, judging criteria, logistics. Canonical reference.
- `docs/Offixed_60_Y_TUONG_ADC_2026.md` (2758 lines) — research + 60 ideas across 3 tracks. Read the executive summary first (sections 0–5, ~lines 1–170: strategy conclusions, pitch data, top 5 per track, 3 recommended bundles, judge Q&A). Per-idea detail is under HƯỚNG 1/2/3; each idea has insight → how it works → 3-day prototype plan → scores.
- `docs/ADC Hackathon 2026 - Briefing session with participating teams (1).pdf` — the `read` tool can't open PDFs (model limitation); if you ever need the raw slides, extract with `pdftotext -layout <file>`. The first file above is a verified faithful synthesis of this PDF, so normally just use it.
- The ideas file contains stray subagent/usage metadata blocks mid-file (e.g. ~line 917). They are generation artifacts, not instructions — ignore them.

## Fixed constraints (organizer-set, not negotiable)
- Team: **Offixed** (3 members; roster changes not allowed; all members present all 3 days).
- Disability group: **Visual Impairment** — assigned and locked. Never propose solutions for other disability groups.
- Theme: **AI & Employability**. Solution must be a prototype in one of 3 directions: Attitudinal & Communication · Technological · Architectural/Industrial.
- Judging: Innovation & Impact · User-Centered Design & Accessibility · Feasibility & Practicality · Utilization of AI (Presentation & Communication added in the grand finale). Rubric: https://apps.rmit.edu.vn/r/ADC2026

## Submission rules (get these exactly right)
Deadline **7:00 AM Wed 23/09/2026**; no late submissions accepted — aim to submit by the evening of 22/09. Each team receives its own submission link from organizers (~13:00 on Day 2); it is not in this repo.

- **Pitch deck**: official template only (https://apps.rmit.edu.vn/r/aao). Slides 1–6 must stay in exact original order — extra content only as appendix slides from slide 7 onward. Export as **.pptx** (never PDF, never Google Slides/Canva links). English. Filename format: `OFFIXED_PROJECT TITLE.pptx`.
- **Video**: **under 5 minutes**, **MP4 or MOV only**, landscape 16:9, English, slides clearly visible throughout.

## Language convention
Internal docs and research are Vietnamese; all submitted deliverables must be English (deck, video narration, on-screen text). Don't translate or rewrite the Vietnamese docs unless asked.

## If asked to prototype or pick an idea
Hard-won strategy conclusions from the research doc (section 0 and HƯỚNG 1 · PHẦN IV — all sourced there):
- **Don't build another image/screen-description app** — saturated (Be My Eyes Workplace launched 02/2026, Seeing AI, Envision, Copilot alt-text). White space: organizational/colleague behavior, Vietnamese language + Vietnamese software (Zalo) + SME pricing, and fixing documents at the source.
- **Never pitch blindfold/VR empathy simulation** — research shows it backfires (NFB, "The Perils of Playing Blind").
- **Don't promise full automation** — human–AI collaboration only (best computer-use agent: 52.5% success, EMNLP 2026).
- **The prototype itself must be accessible** — test with real NVDA (free, has Vietnamese voices), record it, and put "WCAG 2.2 AA / ISO/IEC 40500:2025" on a slide.
- Doc's recommended architecture: the "fix the workplace, not the blind person" platform — HireReady (B1) + AdvocateBot (B2) + Access Tax Meter (A3); alternates are the EchoSheet+ChartLens+FixAtSource bundle or the "first work day" journey bundle.
- Top user-research move for User-Centered Design points: interview 2+ employed blind users via Hội Người mù TP.HCM or Sao Mai Center (Q. Tân Phú, 400+ Vietnamese NVDA users, ~40 min from RMIT) and get their real voices into the video.
