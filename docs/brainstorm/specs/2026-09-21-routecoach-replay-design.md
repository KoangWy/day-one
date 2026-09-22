# RouteCoach Replay — Design Spec (Teach-and-Replay for First-Day Onboarding)

- Date: 2026-09-21
- Branch: `huy-s-brainstorm`
- Status: draft for review (brainstorming architectural path, not yet implementation plan)
- Language: discussion in Vietnamese, all deliverables/demo in English
- Competition: ADC Hackathon 2026, Team Offixed, Visual Impairment, AI & Employability

## 1. Shared understanding

### 1.1 Intent
Personal agent for a newly hired blind employee. A sighted colleague guides once,
the user says "remember this route", the agent builds route memory from that
natural guided walk (voice + images). Later the user says "take me to the
toilet" and the agent replays step-by-step guidance from the user's current
office location. Zero infrastructure (no beacons, no QR, no manual mapping).

Out of scope for the 3-day prototype: work email/calendar/todo long-term memory
(dropped in Round 1), realtime collision-avoidance as a safety promise (downgraded
to async narration + explicit disclaimer).

### 1.2 Success criteria (ADC rubric)
- Innovation & Impact: one guided walk becomes a replayable indoor graph, framed
  as Stage 4 Workplace Onboarding ("first work day without a hand to hold").
- User-Centered & Accessibility: prototype itself keyboard-accessible, tested
  with real NVDA, WCAG 2.2 AA claimed on a slide; ideally one 20s clip of a real
  blind user (see §7).
- Feasibility: teach 1 route in <60s of processing, replay localization in 2-4s,
  graceful fallback offline.
- Utilization of AI: cloud VLM + Whisper + LLM summarization + CLIP/SigLIP
  embeddings + streaming TTS on replay.

### 1.3 Differentiator (judge Q&A)
- "Different from Be My Eyes Workplace (Feb 2026)?" → "They narrate what they
  see. We remember where you work — one guided walk becomes a replayable route,
  with no beacons, no QR, no remapping."
- "AI errors on numbers/directions?" → Numbers/steps come from stored route JSON,
  AI only localizes and narrates; every step carries a stored landmark +
  human voice cue for user verification.
- "Full automation?" → No. Human-AI collaboration by design (EMNLP 2026: best
  computer-use agent 52.5%). Guide teaches, human confirms checkpoints, AI
  remembers and narrates.

## 2. Architecture

```
Phone PWA (camera + mic, 640px JPEG, ~1fps)
  ↕ WebSocket (WiFi, good-network assumption for demo)
Laptop Python server (relay + memory store + CLIP + state machine)
  ↕ Cloud APIs
  Teach (batch): Whisper (STT) + VLM caption + LLM summarize + CLIP embed
  Replay (streaming): Gemini Live or GPT-4o Realtime (vision+voice) + streaming TTS
```

- Phone never calls cloud directly (privacy control, logging, stage reliability).
- Laptop does no heavy training; only relay, vector search, state machine.
- Teach = batch pipeline (deterministic, auditable). Replay = streaming
  multimodal (low latency). Same route JSON schema in both.

## 3. Memory model: place graph (not a single linear route)

Teach sessions routinely cover multiple places
(e.g. office → toilet, then "turn left, elevator opposite the toilet").
Therefore memory is a graph:

```json
{
  "nodes": [{"id": "office", "aliases": ["my desk", "office"]}, {"id": "toilet"}, {"id": "elevator"}],
  "edges": [
    {"from": "office", "to": "toilet", "steps": [
      {"id": "s1", "instruction": "Go straight about 10 meters past the pantry",
       "landmark": "pantry counter on left",
       "voice_cue": "guide said: cold air from AC here",
       "clip_vector": [...], "keyframe_ref": "..."}
    ]},
    {"from": "toilet", "to": "elevator", "steps": [
      {"id": "s1", "instruction": "Exit toilet, turn left, elevator is opposite",
       "landmark": "metal elevator doors", "voice_cue": "guide said: ding sound", "...": "..."}
    ]}
  ]
}
```

- Teach transcript is segmented by place-name mentions into legs; each leg
  becomes one edge. Nodes merge by name + image similarity (second visit to
  "toilet" does not create a duplicate node).
- Replay does pathfinding over the graph (e.g. office → elevator via toilet).
- Text + CLIP embeddings (Round 2 Q6=B): embedding proposes top-3 candidate
  steps, VLM landmark check + user checkpoint confirms. Embedding alone is never
  trusted because office corridors look alike.

## 4. Data flow

### 4.1 Teach (voice + video, Q7=A)
1. User: "Remember this route, office to toilet."
2. Record guide voice + ~1fps keyframes for the whole walk (multi-leg allowed).
3. Stop → server: Whisper transcript + VLM captions per keyframe + CLIP vectors
   → LLM segments into legs and summarizes each leg into steps with
   `{instruction, landmark, voice_cue}`.
4. Agent reads back: "I learned 2 legs, 7 steps. Want to review?"
5. Offline ingest (demo reliability): same pipeline accepts a pre-recorded
   30-60fps mp4 → downsample to 1fps + dedup (cosine > 0.95 dropped) → same
   teach pipeline → route JSON. Live short teach still shown on stage to prove
   it is not faked.

### 4.2 Replay (stepwise with checkpoints, Q8=A)
1. User: "Take me to the toilet."
2. Origin verification (mandatory): capture 2-3 current frames → localize to
   top node → ask: "Are you in the office right now? I see desks behind you."
   - Yes → load path from verified origin.
   - No/unsure → ask "Where are you — near toilet or elevator?" → re-route on
     graph or refuse ("I only know routes from the office") rather than guide blindly.
3. Loop per step: localize (vector shortlist + VLM landmark confirm) → speak one
   instruction → wait for checkpoint confirmation.
   - Checkpoint = one machine-verifiable visual ("I see glass doors on your
     right — past the pantry?") + optionally one stored human cue ("Your guide
     mentioned AC cold air here — feel it?"). AI never claims to feel anything;
     it quotes the guide and asks the user to confirm.
   - Only advance on "yes".
4. Arrival: "You arrived at the toilet. Elevator is opposite, left side."

### 4.3 Latency budget (good-network assumption)
- Teach: batch, 20-30s for a 1-minute walk is acceptable.
- Replay: 1 frame / 1.5-2s, VLM call only for localization; otherwise read stored
  steps. Target 2-4s per turn; streaming TTS saves ~700-1000ms vs.
  STT→VLM→TTS chain. Optional on-device YOLO-nano "stop" beep (<300ms) is future
  work, not in MVP.

## 5. Components to build (3-day MVP)
1. PWA: capture (camera snapshot + mic), WebSocket send, audio playback, big
   accessible buttons, full keyboard flow. No native app.
2. Server (FastAPI): `/teach`, `/ingest-video`, `/replay`, `/routes`;
   CLIP/SigLIP embedding + cosine search (in-memory or sqlite-vec).
3. Teach worker: Whisper → VLM caption → LLM segment+summarize → route JSON.
4. Replay worker: origin check → vector shortlist → VLM confirm → streaming TTS
   → checkpoint state machine.
5. Seed demo data: one real office→toilet→elevator graph, 5-7 steps total.

## 6. Error handling and safety framing
- Lost localization (low similarity): ask disambiguation with two visible options,
  never guess a turn.
- Direction hallucination guard: every turn instruction must cite a stored
  landmark + voice cue; no bare "turn left".
- Network drop: fallback reads stored step text offline without localization.
- Deck disclaimer: "wayfinding aid, not a safety device; does not replace cane /
  guide skills."

## 7. Privacy (cloud + HR concerns, Stages 4-5)
- Send keyframes only during active teach/replay (~1fps), never continuous video.
- Store captions + transcript + vectors only, no raw video
  retention; explicit consent + retention line in deck.
- English-first demo and transcripts.

## 8. Testing, demo script, metrics
- Prototype self-accessibility: keyboard-only pass + real NVDA run (record it),
  "WCAG 2.2 AA / ISO/IEC 40500:2025" on a slide.
- User research (optional but high-value): Sao Mai Center for the Blind,
  Tan Phu, HCMC (~40 min from RMIT South Saigon; 400+ Vietnamese NVDA users;
  32 placed in jobs; hiring 17 blind staff per team research doc §1). One 45-min
  test + one 20s user voice clip in the video ≈ max User-Centered points.
- Demo: (a) 30s pre-ingested teach recap, (b) 60s live mini-teach, (c) 2-min
  replay office→toilet with origin check + 2 checkpoints + arrival.
- Metrics for deck: teach processing time, replay success (correct checkpoints /
  total), replay p50 turn latency, % turns needing disambiguation.

## 9. Open decisions for implementation planning
- Cloud pick: Gemini Live vs GPT-4o Realtime (keys, budget, quota?).
- CLIP pick: openAI CLIP vs SigLIP (license, laptop RAM?).
- Demo venue: which floor/route is legally filmable?
- YOLO beep: in or out of MVP?

## 10. Spec self-review (brainstorming gate)
- No TBD placeholders; all behaviors have an owner phase (teach vs replay).
- Consistent: graph model matches multi-leg requirement; checkpoint model matches
  "AI quotes guide, user feels" correction; origin check precedes all guidance.
- Scope: single implementation plan feasible; YOLO + LMS + email memory
  explicitly deferred.
- Ambiguity fixed: 1fps capture, English-first, keyframes-only privacy,
  offline text fallback.
