"""Summarize exported replay sessions without mixing sample/demo and field results."""
import argparse
import json
import statistics
from pathlib import Path


def summarize(paths):
    events = []
    for path in paths:
        data = json.loads(path.read_text())
        if data.get("kind") != "offixed-replay-session":
            raise ValueError(f"Not a replay session: {path.name}")
        events.extend(data["events"])
    groups = {}
    for label, sample in [("illustrative_sample", True), ("field_route", False)]:
        selected = [e for e in events if bool(e.get("sample")) == sample]
        checks = [e for e in selected if e["event"] == "visual_check" and e["step"] >= 0]
        times = [e["duration_ms"] for e in checks if "duration_ms" in e]
        groups[label] = {
            "starts": sum(e["event"] == "start" for e in selected),
            "completions": sum(e["event"] == "arrival" for e in selected),
            "visual_checks_n": len(checks),
            "visual_matches": sum(e.get("matched") is True for e in checks),
            "manual_overrides": sum(e["event"] == "manual_override" for e in selected),
            "lost_track": sum(e["event"] == "lost_track" for e in selected),
            "p50_click_to_result_ms": statistics.median(times) if times else None,
            "latency_n": len(times),
        }
    return groups


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("sessions", type=Path, nargs="+")
    print(json.dumps(summarize(parser.parse_args().sessions), indent=2))
