# Lift lobby → Meeting room 2.3.001 (v1)

Guide 3 of the demo video: from the level-3 lift lobby, turn around, through the glass door and
along the corridor beside the red staircase to room 2.3.001 on the right. Drafted on 23/09/2026
from the team's footage (`IMG_0758.MOV`, 22/09), not from an on-site walk.

| Point | `short_name` | Evidence | `expected_seconds` | Footage |
|---|---|---|---|---|
| Origin | floor number 3 | text `3` + numeral beside the lift (same as the toilet route) | — | 0–1 s |
| s0 | glass door | text `access hours` (printed "Classroom access hours" sheet) + sheet on a glass door | 7 | ~6–8 s |
| s1 | meeting room sign | text `001` and `Classroom` + number sign in boxes 2 / 3 / 001 | 14 | ~22–24 s |

Hazard on s0: **glass door** — "Be careful. A glass door is in front of you." then "Push the door
open and go through." The first description ("frameless glass door with a tall handle") never
fired: the door has a metal frame. "Glass door with a printed sheet taped on it, directly ahead"
fired on 3/3 close frames. The neighbouring door is 2.3.002 (Lab), so `001` is required.

DeepSeek check (`data/runtime/deepseek-super-final-eval-2026-09-23.json`): 8/9 checkpoint frames
matched, 0 false matches.

```bash
cd apps/server
uv run python -m navigation.prepare ../../data/examples/lift-lobby-to-meeting-room-v1 --reviewer "Team Offixed" --reviewed
```

Before relying on it: walk it once on site with the phone and correct `expected_seconds`.
