# Unified Day-1 Navigation — Design Spec (Teach-and-Replay + Lobby Guidance)

- Date: 2026-09-21
- Branches merged: `huy-s-brainstorm` (RouteCoach Replay) + `brainstorm/khoa` (Lobby Navigation)
- Extra input: Clew open-source review (ideas only, no copied code)
- Status: draft for team vote before implementation plan
- Language: all deliverables/demo in English
- Competition: ADC Hackathon 2026, Team Offixed, Visual Impairment, AI & Employability

## 1. One-sentence product

A newly hired blind employee is guided once, the team keeps the memory, and the
employee replays it alone: entrance → elevator (crowded lobby) + office → toilet
→ elevator (daily routes). One guided walk becomes a replayable place graph.
Zero infrastructure: no beacons, no QR, no LiDAR scan team.

Pitch line: "They narrate what they see. We remember where you work."

## 2. What we keep from each brainstorm

### From Huy (route memory)
- Natural guided walk as the only mapping step: user says "remember this route",
  agent records guide voice + ~1fps keyframes, LLM segments into legs.
- Memory = place graph (nodes: office/toilet/elevator/lobby; edges: step lists),
  each step = `{instruction, landmark, voice_cue, clip_vector, keyframe_ref}`.
- Replay = origin verification first ("Are you in the office? I see desks."),
  then one step at a time with checkpoint confirmations; advance only on "yes".
- Hybrid architecture: PWA ↔ laptop relay ↔ cloud (Teach batch + Replay
  streaming multimodal). Offline mp4 ingest via the same pipeline for stage
  reliability (downsample 1fps + dedup cosine > 0.95).

### From Khoa (lobby guidance)
- The hard problem is the open lobby: no walls to trail, crowds force detours,
  then heading is lost. Fixed obstacles: columns, reception desk, planters, ads.
- Per-frame runtime in the lobby segment: landmark match (template + OCR on
  signs) + YOLO people + monocular depth for columns/walls → 3 zones
  (left/middle/right) → steer toward next landmark via the free zone.
- Short instructions + vibration ("Clear, go straight." / "Person ahead, shift
  right." / "Column ahead, go left." / "Stop."), cane remains primary safety.
- "I'm lost" fallback: repeat last confirmed landmark + message a registered buddy.
- Demo craft: 2 videos (empty-hall map scan + daily walk with people/column),
  split screen (annotated video with boxes/arrows + route dot "you are here" +
  "Landmark 2/4"). Honest framing: simulated on recorded video, real-time on
  phone is vision.

### From Clew (occamLab/Clew, ideas only — no code copied, no LICENSE found)
- Record-with-guide-first, save/share routes (`.crd` → our `route.json`).
- Compress paths into keypoints at turns/stairs (3-5 per leg).
- Physical anchor at start (hold phone to door frame) to solve origin check.
- Non-speech audio: steady click = on path, silence = off path, whistle = turn.
- Safety framing: cane/dog primary, app gives reverse-route info only.
- Credit line for deck/README: "Route teach-and-share inspired by OCCAM Lab
  Clew (github.com/occamLab/Clew); original implementation by Team Offixed."

## 3. Unified architecture (3-day MVP)

```
Phone PWA (camera + mic, 640px, ~1fps, chest-mounted, big accessible buttons)
  ↕ WebSocket
Laptop server FastAPI (/teach, /ingest-video, /replay, /routes)
  + face-blur + CLIP/SigLIP vectors (sqlite-vec) + state machine
  ↕ Cloud
  Teach (batch): Whisper + VLM caption + LLM segment/summarize
  Replay: vector shortlist → VLM confirm → streaming TTS (Gemini Live or GPT-4o Realtime)
  Lobby segment only: YOLO-nano people + MiDaS/Depth-Anything near-field check
```

- Phone never calls cloud directly (privacy, logging).
- Corridor/office segments: Huy flow (localize 1-2s, read stored steps).
- Lobby segment: Khoa flow (continuous steer with 3-zone free-space check).
- MVP route (single, seed prebuilt): entrance → reception → column → elevator →
  office → toilet (5-7 landmarks, favor signs with text).

## 4. Memory + guidance flows

### Teach (any colleague, once)
1. "Remember this route, entrance to office." Record voice + video.
2. Server builds legs → steps with voice cues quoted from the guide
   (AI never claims to feel anything itself).
3. Human reviews/edits steps (Khoa approval gate). Agent reads back summary.
4. Graph merges by place name + image similarity; corridor and lobby legs share nodes.

### Replay (blind employee, daily)
1. "Take me to the toilet." Capture 2-3 frames → localize → origin question.
   Wrong origin → disambiguate or refuse instead of misguiding.
2. Lobby legs: continuous short steering + vibration.
   Corridor legs: stepwise + checkpoint (one machine-seen landmark + one quoted
   guide cue per step).
3. Lost (no match for N seconds): "I lost track, slowly turn left or right."
   Button: last landmark + buddy ping.
4. Arrival states name the next useful link ("Elevator is opposite, left side.").

## 5. Privacy, safety, honesty (judge-proofing)
- Keyframes only during active sessions (~1fps), face-blur pre-upload, store
  captions/transcripts/vectors only, explicit consent + retention in deck.
- "Wayfinding aid, not a safety device." No full-automation promise (EMNLP 2026
  52.5% reference). No blindfold empathy demo. Prototype keyboard + NVDA/TalkBack
  pass, "WCAG 2.2 AA / ISO/IEC 40500:2025" on slide.

## 6. Demo script (<5 min, MP4/MOV, 16:9, English speech + subtitles)
1. 0:00-0:30 problem (94% unemployment VN, 3-6 months to learn a route).
2. 0:30-1:00 teach recap (pre-ingested) + 20s live mini-teach proof.
3. 1:00-3:30 replay: lobby detour around a person (boxes/arrows) + corridor
   checkpoints with origin check (split screen + progress).
4. 3:30-4:30 differentiators (GoodMaps/Clew/Be My Eyes table; company-owns-the-map).
5. 4:30-5:00 metrics + disclaimer + ask (teach time, replay success, p50 latency).

## 7. Metrics for deck
Teach processing time per minute of walk; replay success (correct checkpoints /
total); replay p50 turn latency; disambiguation rate; landmarks count.

## 8. Risks and cut lines
- Landmark mismatch (lighting/crowd) → 3-5 text-rich landmarks, same-lighting
  capture; cut to timed-dot simulation keeping YOLO overlay if matcher slips.
- Depth false positives → center-bottom ROI + conservative near threshold.
- Corridor aliasing → never trust embedding alone; VLM + user confirm required.
- Scope creep → YOLO only in lobby; background-run, AprilTags, BlindSquare
  integration = Future Work slide.

## 9. Open decisions for planning
Cloud pick (Gemini Live vs GPT-4o Realtime: keys/budget?), CLIP vs SigLIP,
filmable venue/floor, YOLO in MVP or lobby-only, Sao Mai user clip (Tan Phu,
~40 min from RMIT; 400+ NVDA users) — yes/no.

## 10. Self-review
Single-route MVP feasible; teach vs replay ownership clear; no TBD; graph covers
multi-leg requirement; checkpoints fixed to quote-guide pattern; origin check
mandatory; Clew credited without copying code.
