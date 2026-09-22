# FLASH_REPORT — deepseek-demo-resume-2026-09-22

## STATUS

ready_for_review (Astra owns acceptance). No commit/stage/push/deploy. No fresh inference calls; prior live evidence reused. No router/model changes.

## Task and workspace

- Task ID: `deepseek-demo-resume-2026-09-22`
- Workspace: `/Users/koangwy/Documents/ChuyenNganh/Personal project/ADC HACKATHON`
- Branch: `main` @ `45e961d2803ce569e526ceb33170aa097b894fe8` (root already pulled; no further pull/stash/reset done).
- Effective local `.env` (non-secret only): `VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`, `OPENCODE_API_KEY` present. Keys not printed or copied.

## Changed paths

Inherited from the interrupted session (kept, not reverted; reviewed and adapted):
- `.env.example` — `VLM_PROVIDER=opencode`, `OPENCODE_MODEL=deepseek-v4.1-flash`.
- `README.md` — DeepSeek demo paragraph.
- `apps/server/navigation/provider.py` — DeepSeek JSON-mode adapter, model-aware consent label, `finish_reason=length` rejection.
- `apps/server/tests/test_provider.py` — expanded regression coverage.
- `docs/DEMO_HANDOFF.md`, `docs/PROTOTYPE_RUNBOOK.md` — provider/command updates.
- `docs/PROTOTYPE_AUDIT_2026-09-21.md` (untracked) — audit with historical P0.

My edits this run:
- `apps/server/navigation/provider.py` — added `AttributeError` to the fail-closed `except` tuple in `OpenCode.generate` (see bug below).
- `apps/server/tests/test_provider.py` — added `test_deepseek_fails_closed_on_malformed_http_200_shape` (7 shapes) and `test_model_aware_consent_label_and_legacy_branch`.
- `docs/PROTOTYPE_VERIFICATION.md` — new §1c with exact measured DeepSeek results; §3 marked current-vs-historical; intro updated to canonical `uv run python -m pytest -q`; §5 evaluation bullet annotated.
- `docs/PROTOTYPE_AUDIT_2026-09-21.md` — new “Cập nhật 22/09/2026” section marking the MiMo P0 conclusion historical; P0 heading annotated; active-route/eval/metrics items kept as documented deferred backlog.
- `docs/DEMO_HANDOFF.md` — measured AI status paragraph + office-frame checklist item.
- `docs/agent-work/deepseek-demo-finalization/FLASH_REPORT.md` — this report.

Untouched by me: published route, frontend, metrics/evaluation, `.env`, router config, lockfiles, vendored skills. Runtime logs under `data/runtime/flash-finalization-logs/` (gitignored).

## Bugs found and fixed

1. **HTTP-200 with non-dict `choices[0]` escaped as an uncaught `AttributeError`.** `choice.get("finish_reason")` assumes a dict; a list payload crashed out of `provider.generate`. `/replay` happened to catch `AttributeError`, but the `/ingest-video` teach path does not, so it would have surfaced as a 500 instead of a fail-closed 503. Fixed by adding `AttributeError` to the sanitized `except` tuple; failure still maps to `ProviderUnavailable("Visual check unavailable")` with no retry. Covered by the new 7-shape parametrized test (failing first, then green).
2. No other defects found. JSON-mode request shape, model-aware consent label, legacy MiMo `json_schema` branch, `finish_reason=length` rejection and the strict `Evidence.supports` guard were all correct as inherited.

## Verification (all run this session)

| Check | Command (cwd) | Exit | Result |
|---|---|---|---|
| Backend tests | `apps/server`: `uv run python -m pytest -q` | 0 | **51 passed** (43 inherited + 7 malformed-200 shapes + 1 label) |
| Backend lint | `apps/server`: `uv run ruff check navigation tests` | 0 | All checks passed |
| Frontend unit | `apps/web`: `npm test` | 0 | **8 passed** |
| Frontend build | `apps/web`: `npm run build` | 0 | pass, PWA generateSW, 11 precache entries (384.81 KiB) |
| Mock E2E | `apps/web`: `npm run test:e2e` | 0 | **14 passed** (Chromium 7 + WebKit 7, no skips on macOS) |
| Real-build E2E | `apps/web`: `npm run test:real` | 0 | **4 passed** (Chromium 2 + WebKit 2) |
| Whitespace | repo root: `git diff --check` | 0 | clean |

Logs: `data/runtime/flash-finalization-logs/{npm-test,npm-build,npm-test-e2e,npm-test-real,pytest}.log`.

Note: `npm run test:real` mocks `/replay`; it proves the real server/route/MP3/axe path, not live AI.

## Evidence provenance

- Live artifact `data/runtime/deepseek-demo-smoke-2026-09-22.json` (gitignored), recorded 2026-09-21T17:15Z = 00:15 ICT 22/09: six real `/replay` ASGI requests on three **existing** reviewed-route frames from `data/runtime/source-media/`, resized ≤640 px and face-redacted locally before upload. 6/6 HTTP 200, 5/6 correct, p50 API 2.365 s, no timeouts; three negatives rejected. Origin correct 2317 ms; office false (expected true) 2321 ms; toilet true 2474 ms; negatives 2411/2333/2397 ms.
- Diagnostic `data/runtime/deepseek-office-diagnostic-2026-09-22.json`: office sign text unreadable after the 640 px resize (`text_readable=false`); the guard correctly refused the match.
- These artifacts are **not** a fresh walk or browser/device capture; not reproduced this run (no fresh inference calls).

## Remaining demo limitation

The office landmark is a false negative on old footage; the checkpoint needs a closer, clearer camera frame and a real device rehearsal before filming a fully AI-verified route. Do not present “100%” or “ready” for a complete real route. Any override-button use in the video must be labeled a **manual override**. 2.365 s is single-request API time, not three-frame origin or end-to-end latency.

## Decisions requiring Astra

- None blocking. Open for Astra: whether to expand §1c with a full `navigation.evaluate` manifest run later; active-route/eval/metrics audit items remain deferred backlog by scope.

## Checkpoint / next action

Code, docs and tests are complete and green. Next: Astra reviews the diff against the captured dirty-tree snapshot `/var/folders/1t/mmb2pzr53dl5dj3c7g_cfsmc0000gn/T/offixed-deepseek-resume-1n6l9dxv` (git-untracked files copy + `tracked.patch`/`staged.patch` + `metadata.json`) combined with the inherited uncommitted patch on `main` @ `45e961d` — HEAD alone omits the prior session's edits — then accepts. No further work queued.

## Documentation correction cycle (doc-only, no test reruns)

Astra's review accepted the code patch in principle and requested prose fixes. Applied, no code or tests touched:
- `docs/PROTOTYPE_VERIFICATION.md` §5: automated WebKit checks marked current with counts (E2E 14, real 4); Windows results moved to an explicit historical block; manifest evaluation kept NOT DONE using the already-configured OpenCode provider/key instead of a new Gemini key; iPhone/VoiceOver/NVDA kept pending.
- `docs/PROTOTYPE_VERIFICATION.md` §1c: validation table now includes the 8 frontend unit, build, 14 mock E2E and 4 real-build E2E results, keeping the `/replay` mock limitation; office description corrected to the artifact's exact wording (small unreadable text + large gray square obscuring the center) without causal certainty.
- `docs/PROTOTYPE_AUDIT_2026-09-21.md`: “Kết luận”, “1. Đã chạy lại”, the “Không sửa code…” sentence and the old runbook launcher note are now explicitly historical 21/09 observations with a link to the 22/09 update and §1c.
- This report: baseline reference corrected to the snapshot path plus inherited patch.
