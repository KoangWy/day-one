# Final video demo checkpoint

- Status: ACCEPTED. Three actual MP4s, corrected UI/player, reproducible preparation and Vietnamese handoff are complete on `demo/final-video`; committed and pushed as `2d1539ee90142dbd6a97e3b8278c1a18e62da021` (14 files, 1953 insertions).
- Baseline: `674cdd626cee6fdb84579b5fbaf315aa0fa43497` on `demo/final-video`.
- Pre-existing work: untracked `data/models/`, preserved.
- Plan: `PLAN.md` in this directory.
- Routing: static doctor reports root `gpt-6-astra`; actual child session `01a0c8ca-434f-78b2-b4a6-3776a1f1a51d` records role `astra_flash_builder`, model `opencode-go/deepseek-v4.1-flash`, high effort. Router usage metadata during the run records that route, provider `opencode-go`, and HTTP 200 responses (2026-09-22T11:14–11:15Z); this is runtime evidence beyond the static doctor.
- Worker: `/root/implement_final_demo` (native `astra_flash_builder`), one end-to-end bundle; owns implementation and WORKER_REPORT.md.
- Review: one consolidated correction request sent to worker: product-facing compact scene copy/caption position + true phone viewport containment; avoid double HDR conversion of teach stills; preserve media-report evidence during verify-only; add missing-media/play-rejection recovery tests; correct misleading offline comment.
- Corrections accepted: compact product-facing scenes, instruction above camera, phone viewport containment, teach still conversion, verification report preservation, media-error/rejected-play tests and normal AbortError cancellation handling.
- Validation: 65 unit tests; final demo E2E 16/16 Chromium + 16/16 WebKit; earlier full E2E 38/38 and real-server regressions 4/4. Final build `index-Cwt-MfVo.js` verified served by HTTPS; Git whitespace check clean.
- Root HTTPS: selector 200; each MP4 HEAD 200, video/mp4, byte ranges; range GET 206 matches first 1024 local bytes. Byte sizes: teach 35678395, route 9543390, collision 13127866. Local diagnostic bypassed certificate trust.
- Independent QA `/root/verify_final_demo_media`: collision frame alignment to source [5,14), nine-second duration, teach PCM retained with exact two-second delay, speech windows and no replay source-audio leakage passed. Evidence: `data/runtime/final-video/independent-qa/`.
- Real iPhone: user confirmed selector visible after stale-PWA page refreshed. Full physical playback, screen recording and VoiceOver remain unverified. No SW/backend change was made for that report.
- Astra reviewed code, corrections, media evidence and final screenshot, corrected an inaccurate SW claim in the worker report, and completed the Vietnamese guide. Both finished Flash agents were stopped.
- Handoff: `docs/FINAL_VIDEO_DEMO.md`; `https://100.124.205.33:8443/?demo=1`. No further implementation work pending.
- Follow-up (2026-09-22, user request): the three reviewed MP4s were force-added to `apps/web/public/demo-media/` (~58 MB) so the branch is self-contained on any machine. This deliberately supersedes the plan's "fully gitignored" media rule for these three clips; the folder ignore rule remains for stray/generated files.
