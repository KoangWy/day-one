# Unified Day-1 Navigation — Design Spec (TRIMMED Tier A MVP)

- Date: 2026-09-21 (trimmed 2026-09-21, team vote: Tier A)
- Branches merged: `huy-s-brainstorm` (RouteCoach Replay) + `brainstorm/khoa` (Lobby Navigation)
- Extra input: Clew open-source review (ideas only, no copied code)
- Status: LOCKED for implementation planning — Tier A minimal; everything else is Future Work
- Language: all deliverables/demo in English
- Competition: ADC Hackathon 2026, Team Offixed, Visual Impairment, AI & Employability

## 1. One-sentence product (trimmed)

A newly hired blind employee's single guided walk on one linear route
(office → toilet, 4-5 text-rich landmarks) becomes replayable step-by-step
guidance with origin check and checkpoints. Zero infrastructure.

Pitch line: "They narrate what they see. We remember where you work."

## 2. Tier A scope — what is IN

- ONE linear route, 4-5 landmarks with visible text signs, English only.
- Teach: offline ingest of a pre-recorded mp4 (downsample ~1fps, manual cleanup
  allowed) → `route.json` with `{instruction, landmark, voice_cue}` per step.
  Same schema as the live pipeline; live teach shown only as a 20s log recap.
- Replay: request/response VLM (no streaming realtime) + stored steps + Edge-TTS
  audio files. Flow: origin check → step 1 → checkpoint "yes" → step 2 … → arrival.
- PWA: camera snapshot button, mic/voice command (or typed fallback), audio
  playback, Next/Yes buttons, full keyboard operability.
- Server (FastAPI, laptop): `/ingest-video`, `/routes`, `/replay` (stateless per
  step: given current frame + step index → localize + next instruction).
- Demo video: split screen (walk footage with subtitles + route progress
  "Step 2/5"), <5 min, MP4/MOV 16:9.
- Accessibility: keyboard-only pass + real NVDA run recorded; "WCAG 2.2 AA /
  ISO/IEC 40500:2025" on slide.
- Deck: differentiator table (GoodMaps/Clew/Be My Eyes), metrics (teach time,
  replay success, p50 latency), safety disclaimer, Clew inspiration credit.

## 3. Explicitly OUT (Future Work slide only)

- Realtime YOLO + depth obstacle steering every frame → replaced by honest
  caption: no avoidance in MVP. (Single YOLO snapshot MAY be added only if a
  member finishes early — not in plan.)
- CLIP/SigLIP vector search → replaced by VLM caption match against stored
  landmark text, with manual Next-step fallback for stage reliability.
- Streaming realtime APIs (Gemini Live / GPT-4o Realtime) → plain request/response.
- Place graph + pathfinding multi-route → one linear route; graph diagram stays
  in deck as vision.
- Vibration, buddy ping/notify, barometer floor detection, background run,
  Vietnamese voice, live on-stage teach — all cut.

## 4. Data contracts (frozen for plan)

```json
{
  "route_id": "office-to-toilet-v1",
  "steps": [
    {"id": "s1", "instruction": "Go straight past the pantry",
     "landmark": "pantry counter on left",
     "voice_cue": "guide said: cold air from AC here"}
  ]
}
```

Replay request: `{route_id, step_index, image_jpeg_640}`.
Replay response: `{matched: true/false, instruction, checkpoint_question, audio_url}`.
Fallback: if `matched=false` twice → "I lost track, slowly turn left or right.
Last confirmed: <landmark>." + on-screen Next/Repeat buttons.

## 5. Origin check (mandatory, kept from full spec)

Before any guidance: capture 2-3 frames → VLM confirms top landmark → ask
"Are you in the office right now? I see desks behind you." Yes → start at s1.
No/unsure → ask location or refuse ("I only know the office route").

## 6. Checkpoints (kept, simplified)

Each step = one machine-checkable visual ("I see glass doors on your right —
past the pantry?") + optionally one quoted guide cue. Advance only on "yes"
(voice or button). AI never claims to sense non-visual things itself.

## 7. Privacy / safety / honesty (kept)

- Keyframes only during sessions (~1fps), no raw video
  retention, consent + retention line in deck.
- "Wayfinding aid, not a safety device." No full-automation claim (EMNLP 2026
  52.5%). No blindfold demo. Cane primary.
- Credit: "Route teach-and-share inspired by OCCAM Lab Clew
  (github.com/occamLab/Clew); original implementation by Team Offixed."

## 8. Demo script (<5 min)

1. 0:00-0:30 problem (94% unemployment VN, months to learn a route).
2. 0:30-1:00 teach recap (pre-ingested + log, no live risk).
3. 1:00-3:30 replay with origin check + 3-4 checkpoints + arrival.
4. 3:30-4:30 differentiators + honest-simulation note.
5. 4:30-5:00 metrics + disclaimer + ask.

## 9. Work split hint (3 people, for planning)

- PWA shell + accessible UI + audio playback.
- Server + ingest script + route.json seed.
- Replay endpoint + VLM prompts + video/deck assembly.

## 10. Self-review

Single linear route, no TBD, no streaming/CLIP/YOLO dependency in the critical
path; every guidance turn has a stored-text fallback; scope fits 2 builders ×
2 days with 1 day buffer for video/deck.
