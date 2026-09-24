# Main entrance → Lift lobby (v1)

Guide 1 of the demo video: from inside the main entrance, along the corridor of display cases,
through the automatic RMIT glass doors, past the ticket gates to the lifts. Drafted on 23/09/2026
from the team's footage (`collision_source.mp4`, 22/09), not from an on-site walk.

| Point | `short_name` | Evidence | `expected_seconds` | Footage |
|---|---|---|---|---|
| Origin | display corridor | display cases + RMIT doors at the far end (features only) | — | ~3–6 s |
| s0 | ticket gates | row of ticket gates + tiled wall with a TV (features only) | 15 | ~19–22 s |
| s1 | lift doors | text `DO NOT USE ELEVATOR` + stainless lift doors | 10 | ~28–30 s |

Hazard on s0: **automatic door** — "Be careful. Automatic door ahead." then "Keep going straight.
It opens by itself." The outer entrance doors carry the same RMIT logos, so the doors are a hazard,
not a checkpoint: a checkpoint there would already match at the start.

DeepSeek check on tonemapped frames (`data/runtime/deepseek-super-final-eval-2026-09-23.json`):
9/11 checkpoint frames matched, 0 false matches; the door warning fired on 3/3 close frames and once
about 5 m early. Arrival tells the walker to take the lift to level 3, where
`lift-lobby-to-toilet-v2` and `lift-lobby-to-meeting-room-v1` start.

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/entrance-to-lift-lobby-v1 --reviewer "Team Offixed" --reviewed
```

Before relying on it: walk it once on site with the phone and correct `expected_seconds`.
