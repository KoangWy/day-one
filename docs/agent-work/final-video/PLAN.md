# Final video demo — approved implementation contract

User approved implementation on 2026-09-22. This replaces the previous live-product priorities only for this demo branch.

## Baseline and ownership

- Branch: `demo/final-video`, created from `feat/realtime-replay` at `674cdd626cee6fdb84579b5fbaf315aa0fa43497`.
- `git pull origin main` completed, already up to date. Pre-existing untracked `data/models/` belongs to the user; preserve it.
- Astra owns this plan, CHECKPOINT.md, final review and integration. One native `astra_flash_builder` owns implementation, media preparation, debugging, tests and routine visual QA. No commits, pushes or deployments.

## Deliverable and sources

Three independently replayable iPhone web scenes and prepared local media for the team to screen-record. Keep the existing live app at `/`. Demo selector: `/?demo=1`; direct scenes: `/?demo=teach`, `/?demo=route`, `/?demo=collision`.

Drive folder: https://drive.google.com/drive/folders/1TfZv7NMnl_UgNNRKt2ULLvOJA8tHUsK4

| Scene | Exact Drive file ID | Source name | Probed source |
| --- | --- | --- | --- |
| teach | `1YQ8oPQBle9ZYzXiEZz3Yaz7DtIvnOEfM` | teach_demo | 37.613333 s, 3840x2160 HEVC, 30 fps, AAC |
| route | `1BE6mhLiRE6TGpmBd2zrDjXuTqofQUbNj` | replay_elevator to restroom | 14.373333 s, 3840x2160 HEVC, 24 fps, AAC |
| collision | `1G3K8LyYVbpm9FHe2herSxpTWnvj92MhT` | replay_collision warning | 58.835 s, 3840x2160 HEVC, 24 fps, AAC |

Verified public download pattern: `https://drive.usercontent.google.com/download?id=FILE_ID&export=download&confirm=t` (supports HTTP Range). Preserve originals under ignored runtime storage. Do not stream Google Drive in the demo.

## Scene contract

- Teach: tap Record with visible press feedback; two-second opening first-frame hold with English TTS `Recording started.`; then the entire source footage and its original audio; then hide/close the camera viewport, show exactly one second of loading with `Learning.`; then success/checkmark and TTS `Route learned.` with a three-second tail. Retain success after playback finishes. Teacher speech must remain intact and never compete with the AI voice. Record indicator and elapsed timer during the recording phase.
- Route: retain the full source and mute source audio. TTS/caption at 0 s `Turn right.`, 3.5 s `Continue straight.`, 10 s `You have arrived. The restroom is on your right.`. Footage was visually reviewed: initial motion is a RIGHT turn around 2–3 s, the destination is on the right. End in arrived state. Verify the final speech fits in the actual prepared clip.
- Collision: accurately re-encode only source [5 s, 14 s), exactly nine seconds (within one output frame). Mute source audio. Around clip 1 s, show prominent warning and short chime followed by TTS `Be careful. Someone is in front of you.`. The person starts stepping into the path around this point, comes close around 4–6 s, and has passed around 7 s; remove warning around 7 s. Do not add an unverified path-clear claim.
- Product text and speech in English, reuse `en-US-AriaNeural`. Static button labels need normal accessible labels; dynamically spoken instructions and state messages must match visible text.

## Implementation boundary

- Select the demo before mounting the existing App, so demo never initializes getUserMedia, mic, camera loops, routes/health requests or live AI APIs.
- Keep Day One green/cream visual language; iPhone portrait layout with prominent instructions and controls above a full, uncropped 16:9 camera viewport. Preserve person/sign visibility. Avoid exposing media-production details in the scene UI.
- Bake speech and any effects into a single audio track in each H.264/AAC 1080p fast-start MP4. Tone-map source HDR to SDR if indicated by source metadata. Media under `apps/web/public/demo-media/`, fully gitignored. Preparation script and timeline configuration are tracked and reproducible.
- One shared scene/timeline contract drives preparation and player cues/phases. Derive text/phase/timer from video.currentTime, including teach's loading and success tail; no independent wall-clock cue timer. Use inline video, direct tap-to-play, pause/resume/restart, explicit play/load failure recovery, scene cleanup and pause on document hidden. Keep the video element playback usable during teach's visually closed-camera tail.
- No backend API change is expected: Vite public media is copied to dist, and existing FastAPI StaticFiles supports Range. Verify the actual production GET/HEAD/206 path. Existing PWA does not precache media; do not promise offline operation.
- Source media, generated MP3/MP4/frames and screenshots are ignored. Do not touch credentials, existing route speech assets or user model files. No paid AI calls, live provider smoke tests, global installs or service configuration changes.

## Acceptance and handoff

- Teach source audio retained; AI start/learning/success complete, one-second loading; route cues synchronized; exact collision trim, early warning and no cut-off audio.
- Pause/resume/restart/scene change/hidden tab do not drift or leak prior audio. Missing media and blocked play have a useful recovery UI. Keyboard and axe checks; meaningful VoiceOver semantics without double speech when app narration is on.
- Run web unit tests/build, focused demo E2E and appropriate live-app regression E2E. Test real media playback in Chromium and WebKit when supported and record any codec/tool limitations honestly. Check production HTTP media MIME and byte ranges. Routine screenshots at iPhone viewport and assess no clipping.
- Physical iPhone Safari/screen-recording/VoiceOver remains a real-device check unless hardware is actually available; do not describe emulation as hardware testing.
- Deliver actual processed assets, scripts/config, direct demo URLs and Vietnamese run instructions in `docs/FINAL_VIDEO_DEMO.md`, plus implementation/validation evidence in `docs/agent-work/final-video/WORKER_REPORT.md`.

## Execution

One coherent Flash bundle: prepare media + isolated DemoApp + focused tests + runbook + report. Astra reviews specification compliance and code quality together, with one consolidated correction cycle if needed.
