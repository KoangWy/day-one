> **English** (default) | [Tiếng Việt](./SUPER_FINAL.vi.md)

# Super final — the demo video's features, built into the app

Branch `super-final-project`, started 23/09/2026 from `feat/realtime-replay` (continuous camera
checks, template speech, Next to continue) plus `main`. The submitted video (`OFFIXED_DAY ONE.mp4`)
showed features that were scripted scenes or generated voice-over, not app behaviour. This branch
makes each of them real. Everything below runs in the app; the "Verified" column says how.

| In the video | Built as | Verified |
|---|---|---|
| "Before you start, hang your phone at chest height…" (0:03) | **Wear your phone** card before the first walk: illustration, 4 steps, *Play setup instructions* speaks them; *I'm ready* hides it on this phone; *Phone setup* reopens it | e2e `journeys.spec.ts` (both browsers) |
| Stage 1 · Learn: *Record* → "Recording started." → "Learning." → "Route learned ✓", "3 places remembered" (0:16–0:57) | **Teach a route** page (`#/teach`) for guides: records camera + narration with MediaRecorder, uploads with progress, the laptop learns in the background (FFmpeg frames, Whisper, one DeepSeek draft), then reads back the places remembered | e2e (mocked laptop) + a **real run** on this laptop: a 37 s narrated walk at 720p (12 MB, like a phone) learned in ~63 s |
| "Our AI turns existing signs and doors into recognised checkpoints" (presenter) | The AI drafts steps, sign text, features, **hazards** and places; the **Review** page (`#/review/<id>`) is prefilled with them. Nothing is spoken to a walker until a guide confirms and publishes | pytest `test_guide.py`; e2e review journey; the real draft was refused at publish because two points looked identical (see below) |
| Stage 2 · Walk alone: choose the saved route (presenter) | **Route list** on the Walk page from `/catalog`; the choice is remembered per phone, `?route=<id>` opens one directly | e2e |
| Guide 1 → Guide 2 → Guide 3: entrance → lift, then lift → restroom or → meeting room | **Continue your journey**: on arrival the app offers every route that starts where this one ended (matched by place name) | e2e; `/catalog` on the real server lists the three legs |
| "Be careful. Someone is in front of you." with a chime (1:02, presenter 2:14) | **Obstacle alerts on the phone**: MediaPipe EfficientDet-Lite0 runs in the browser 4×/s; a person (or chair, bench, suitcase…) close ahead in the middle of the frame for 2 frames (objects 3) gets a chime, a red banner and a spoken warning that interrupts everything else, once; "Warning ended." when gone. Frames never leave the phone | Unit tests on detections **recorded from the team's corridor footage**; e2e with that footage as the camera through the real detector; screenshot of the live banner |
| "Be careful. Automatic door ahead." (1:13) and "A glass door is in front of you." → "Push the door open and go through." (Guide 3) | **Route hazards** taught with the route (glass door, automatic door, door, stairs, step, narrow passage, other): "On the way: …" after the direction, then chime + warning + how to pass when the camera sees it close ahead; once per step | DeepSeek on real frames: automatic door 3/3, glass door 3/3 when close (see Verification) |
| "Turn around." · "The call button is on your right." · "Up to level 3" | Reviewed route text in the two new routes | Published with real Edge-TTS audio |
| Guide 1 and Guide 3 as whole routes | `entrance-to-lift-lobby-v1` and `lift-lobby-to-meeting-room-v1`, drafted from the team's footage, published with 56 phrases each | DeepSeek `/observe` eval on tonemapped footage frames |

The existing realtime replay (camera finds each landmark, hints, reached, Next, lost → override,
vision down, Where am I, metrics) is unchanged, and the `lift-lobby-to-toilet-v2` route keeps
working as before.

## How it fits together

```
Guide's phone (#/teach) ──video + voice──▶ laptop: FFmpeg → Whisper → 1 VLM draft ──▶ data/runtime/drafts/<id>
Guide (#/review/<id>) ──checks every word, confirms──▶ prepare: phrases + Edge-TTS ──▶ data/runtime/routes/<id>
Walker's phone (#/) ── /catalog, /observe (landmarks + hazards), /speech, /app-speech
                     └─ MediaPipe on the phone: obstacle alerts (no upload)
```

Sounds: one audio queue. **P0** (obstacle or hazard warning) plays at once with a two-tone chime
(and a vibration on Android) and interrupts; **P1** (directions, arrivals) is never dropped; **P2**
(where the landmark is in the frame) is dropped when busy. With *App voice* off, P0 becomes a
screen-reader `role="alert"`, P1 goes to the polite live region.

## Run it

Same as the runbook, plus three things:

```bash
cd apps/server && uv sync --all-extras --frozen   # includes imageio-ffmpeg: teach works without FFmpeg on PATH
cd ../web && npm ci && npm run build               # prebuild copies the MediaPipe runtime and downloads
                                                   # the 4.6 MB detector model once (needs internet)
```

- **Teach from a phone:** put `TEACH_PIN=<4+ characters>` in `.env` and restart. On the phone open
  `https://<laptop>:8443/#/teach` and enter the guide code. On the laptop itself no code is needed.
- **Walk:** open `https://<laptop>:8443/`, pick a route, tap *Start this walk*. *Obstacle alerts* can
  be switched off per phone.
- Windows laptop without `uv` on PATH: `python -m uv …` works (uv installed as a module), and the
  venv runs everything: `apps/server/.venv/Scripts/python.exe -m uvicorn --app-dir apps/server navigation.main:app --port 8000`.

## Verification (23/09/2026, Windows laptop)

- **Automated:** server 133 pytest + ruff clean; web 75 vitest; Playwright e2e 12/12 on Chromium
  (WebKit on Windows has no MediaStream, so camera journeys skip there; the two that do not need a
  camera pass); `test:real` 5 pass, 1 WebKit skip.
- **Obstacle alerts on footage.** The corridor clip used in the video (a colleague walks towards the
  camera and passes at ~11.5 s): one alert at **7.25 s**, about 4 s before they pass, and nothing for
  people far down the corridor or at the edge. The lift-lobby → meeting-room clip (turning past a sofa
  behind a glass wall, plants, people at the side): **no alerts**. The first thresholds alerted at
  10 s and flagged the sofa; they were tuned on this footage, and the recorded detections are now a
  regression test (`apps/web/src/obstacles.footage.test.ts`). Detector speed: ~100 ms per frame on
  this laptop's CPU in Chromium. **Not yet measured on an iPhone.**
- **New routes, DeepSeek V4.1 Flash on tonemapped frames** (`data/runtime/deepseek-super-final-eval-2026-09-23.json`):
  entrance → lift lobby 9/11 checkpoint frames matched, **0 false matches**, automatic-door warning
  3/3 close frames and once ~5 m early; lift lobby → meeting room 8/9 matched, **0 false matches**,
  glass-door warning 3/3. The first glass-door description ("frameless glass door with a tall handle")
  fired 0/3 because the door has a frame — review matters. p50 2.5–3.0 s per frame.
- **Real teach run.** The AI draft of the gate → lift walk was plausible but put the same RMIT door
  at the start and at step 1, and told the walker to *push* an automatic door. Publishing now refuses
  a checkpoint that looks identical to the point before it; the Review page showed that error.

## Honest limits

- No on-site walk yet with an iPhone, VoiceOver and these features (same open item as the realtime
  branch). Timings (`expected_seconds`) of the two new routes come from footage.
- Hazard warnings come from the cloud VLM, ~2.5–3 s per frame: at walking speed a warning can arrive
  1–2 m later than a person would say it. The on-device obstacle alert is fast, but only knows COCO
  objects: it cannot see glass walls, poles, low signs, steps or stairs unless a guide taught them as
  a hazard. **Wayfinding aid, not a safety device** — keep the cane.
- Obstacle detection runs only while the walker is searching (starting point, walking, lost), not
  while waiting for Next.
- Teaching from a phone needs `TEACH_PIN`; anyone with the code on the same network can teach and
  publish. Use the team's private network.
- Phone live transcription is an opt-in backup; on iPhone it may compete with the recording for the
  microphone, so Whisper on the laptop is the main path.
