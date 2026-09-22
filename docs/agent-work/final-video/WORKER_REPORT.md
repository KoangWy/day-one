# Worker report — final video demo

STATUS: ready_for_review
TASK: `/root/implement_final_demo` (native `astra_flash_builder`, single write owner for this bundle)
WORKSPACE: `/Users/koangwy/Documents/ChuyenNganh/Personal project/ADC HACKATHON`, branch `demo/final-video` @ `674cdd626cee6fdb84579b5fbaf315aa0fa43497`

## What changed and why

| Path | Change |
| --- | --- |
| `apps/web/src/demo/DemoApp.tsx` | New isolated demo player: selector + three scene views, inline video, `video.currentTime`-driven captions/phases/timer, Pause/Resume/Restart, scene cleanup, pause on hidden tab, explicit load and blocked-play recovery. |
| `apps/web/src/demo/timeline.ts` | Shared scene/timeline contract: anchored vs absolute cues, phase + elapsed derivation from clip time, formatters. |
| `apps/web/src/demo/timeline.json` | Tracked config for sources, cue times, TTS text, encode settings. |
| `apps/web/src/demo/timeline.test.ts` | Unit tests for anchors, phases, cue windows and product-facing copy. |
| `apps/web/src/demo/demo.css` | Day One visual language; caption above the camera view; phone layout sized so start button + instruction + full 16:9 view fit without scrolling. |
| `apps/web/src/main.tsx` | `?demo=...` selects the demo at mount, so the live App (camera/mic/API) never initializes. Existing service worker registration is unchanged; stale-page recovery is documented in the runbook. |
| `apps/web/e2e/demo.spec.ts` | 16 focused Playwright tests: isolation/no live traffic, missing-media reload, rejected-play retry, cue timing, collision [1 s, 7 s) window, pause/resume/restart/hidden-tab, narration toggle, viewport containment and screenshots. |
| `apps/web/tsconfig.json` | `resolveJsonModule` so the tracked timeline config can be imported by the player. |
| `scripts/prepare_final_video_media.py` | Reproducible media preparation: Range-capable Drive download, source probing, HDR→SDR tone-map, teach hold/loading/tail assembly, exact collision trim, `edge-tts` speech, AAC mux, fast-start, verification and media report. |
| `.gitignore` | Narrow addition for `apps/web/public/demo-media/` (generated clips stay out of git). |
| `docs/FINAL_VIDEO_DEMO.md` | Operator runbook: scene URLs, HTTPS/Tailscale recording steps, stale-PWA refresh guidance, media preparation commands and clip contents. |

No backend change was needed. `apps/server` already serves the built `dist/` (including `dist/demo-media/`) through `StaticFiles` with Range support, verified in production. Pre-existing untracked `data/models/` was left untouched.

## Processed media (actual files, not just scripts)

All three were regenerated end-to-end by the script; sizes are the current on-disk artifacts.

| Scene | File | Seconds | Bytes | Video/Audio |
| --- | --- | --- | --- | --- |
| teach | `apps/web/public/demo-media/teach.mp4` | 43.613 | 35,678,395 | h264/aac 1920×1080 |
| route | `apps/web/public/demo-media/route.mp4` | 14.373 | 9,543,390 | h264/aac 1920×1080 |
| collision | `apps/web/public/demo-media/collision.mp4` | 9.000 | 13,127,866 | h264/aac 1920×1080 |

Sources (37.613 s teach, 14.373 s route, 58.835 s collision) were downloaded once into ignored `data/runtime/final-video/source/`; originals were preserved and never streamed from Drive. Colour handling: teach still frames are tone-mapped once at extraction, then only scaled for concat (the earlier double-conversion bug is fixed).

## Corrections applied in this cycle

1. `DemoApp.play` now ignores `AbortError` (a pause/seek/restart/unmount cancelling a pending `play()`), keeping `NotAllowedError` recovery. The spurious "Playback was blocked" banner no longer appears after ordinary pause/seek.
2. Scene copy is product-facing: collision instruction "Hold your phone at chest height.", route instruction "Follow the spoken directions to the restroom.". Production details (camera/mic/AI notes) live only on the selector and in the runbook.
3. Unit test asserts scene-visible text never mentions production scripting.
4. E2E asserts no blocked-play message after pause, seek, resume, restart and visibility change.
5. `--verify-only` now merges refreshed verification fields into the existing report entry instead of dropping `tts`/`clipStartSeconds` evidence.

## Verification (commands, exit status, salient result)

| Command | Exit | Result |
| --- | --- | --- |
| `cd apps/web && npm test` | 0 | 5 files, 65 tests passed (incl. new copy test) |
| `cd apps/web && npx tsc -b` | 0 | clean |
| `npx playwright test e2e/demo.spec.ts --project=chromium` | 0 | 16/16 passed |
| `npx playwright test e2e/demo.spec.ts --project=webkit-mobile` | 0 | 16/16 passed (real MP4 playback in WebKit) |
| `npm run build` | 0 | `dist/assets/index-Cwt-MfVo.js` (264.81 kB); PWA precache 11 entries |
| `npm run test:real` (earlier) | 0 | 4/4 live-app regression green |
| `scripts/prepare_final_video_media.py --scene teach` + `--verify-only` | 0 | teach 43.61 s/35.68 MB, route 14.37 s/9.54 MB, collision 9.0 s/13.13 MB; all TTS windows `window-ok +0%` |
| Root HTTPS handoff (`GET /?demo=1`, HEAD/Range on all 3 media) | 0 | 200/206, correct `Content-Range`, first 1024 bytes match current public assets. TLS trust was bypassed only for the local diagnostic. |

## Independent media QA (root's read-only agent; not repeated here)

- Frame matching confirms collision footage is source [5 s, 14 s), 9 s.
- Teach source vs output PCM `r = .9994–.9998` with an exact 2 s delay and preserved RMS; "Learning" audible 39.66–40.20 s, within 1 s; route final speech ends 13.21 s < 14.373 s; no source-audio leakage in route/collision.
- Artifacts: `data/runtime/final-video/independent-qa/`.

## Screenshots

`data/runtime/final-video/screenshots/` — `selector.png`, `teach-recording.png`, `teach-learned.png`, `route-arrived.png`, `collision-warning.png`, captured at 393×852. Reviewed visually: product copy only, no blocked-play banner, caption above the camera view, camera view uncropped, start button + instruction + full view visible without scrolling.

## Unverified / real-device limits

- User confirmed on an actual iPhone that `https://100.124.205.33:8443/?demo=1` shows the demo selector. Full playback, screen-recording quality and VoiceOver pronunciation on the physical device were **not** verified by this worker — that remains a manual team step.
- Playwright Chromium/WebKit are not hardware Safari; both report H.264/AAC support here, but battery/perf and the iOS audio-unlock interaction were not exercised on device.
- No physical iPhone TLS trust check was done; root's HTTPS check bypassed certificate trust for local diagnostics only.
- A stale installed PWA service worker can briefly serve the previous shell on one load. The runbook documents the refresh/clear steps; no config change was made.

## Decisions for Astra

- None required. No backend, schema or API change was made and none appears necessary.
- Next checkpoint: Astra's acceptance review of the affected diff and screenshots; physical iPhone playback/VoiceOver remains team-owned.
