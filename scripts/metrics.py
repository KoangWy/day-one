"""Summarize exported replay sessions (version 2) without mixing sample/demo and field results."""
import argparse
import json
import statistics
from pathlib import Path

COUNTED = ["start", "origin_found", "reached", "next", "lost", "where", "manual_override",
           "vision_down", "vision_back", "stop"]
STEP_TOTALS = ["frames_sent", "errors", "candidates", "matches", "hints_spoken"]


def load(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("kind") != "offixed-replay-session":
        raise ValueError(f"Not a replay session: {path.name}")
    if data.get("version") != 2:
        raise ValueError(f"{path.name} is a version 1 (Check/Yes) session; "
                         "summarize it with scripts/metrics.py on main")
    return data["events"]


def median(values):
    return statistics.median(values) if values else None


def summarize(paths):
    events = [event for path in paths for event in load(path)]
    groups = {}
    for label, sample in [("illustrative_sample", True), ("field_route", False)]:
        selected = [e for e in events if bool(e.get("sample")) == sample]
        steps = [e for e in selected if e["event"] == "step_summary"]
        checkpoints = [e for e in steps if e["step"] >= 0]
        arrivals = [e for e in selected if e["event"] == "arrival"]
        reach = [e["time_to_reach_ms"] for e in checkpoints if e.get("time_to_reach_ms") is not None]
        latency = [e["latency_p50_ms"] for e in steps if e.get("latency_p50_ms") is not None]
        groups[label] = {
            **{event: sum(e["event"] == event for e in selected) for event in COUNTED},
            "arrivals": len(arrivals),
            "verified_arrivals": sum(e.get("verified") is True for e in arrivals),
            **{key: sum(e.get(key, 0) for e in steps) for key in STEP_TOTALS},
            "p50_time_to_reach_ms": median(reach),
            "reach_n": len(reach),
            "p50_observe_latency_ms": median(latency),
            "latency_steps_n": len(latency),
        }
    return groups


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("sessions", type=Path, nargs="+")
    print(json.dumps(summarize(parser.parse_args().sessions), indent=2))
