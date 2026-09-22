import importlib.util
import json

import pytest

from navigation.config import ROOT

spec = importlib.util.spec_from_file_location("metrics_script", ROOT / "scripts/metrics.py")
metrics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metrics)


def session(events, version=2):
    return {"kind": "offixed-replay-session", "version": version, "events": events}


def test_version_2_sessions_are_summarized_per_group(tmp_path):
    def step(step, **values):
        return {"event": "step_summary", "at": "t", "step": step, "sample": False, **values}
    field = [
        {"event": "start", "at": "t", "step": -1, "sample": False},
        step(-1, frames_sent=3, errors=0, candidates=1, matches=2, hints_spoken=1,
             time_to_reach_ms=None, latency_p50_ms=3000),
        {"event": "origin_found", "at": "t", "step": -1, "sample": False},
        {"event": "reached", "at": "t", "step": 0, "sample": False, "time_to_reach_ms": 9000},
        step(0, frames_sent=8, errors=1, candidates=3, matches=2, hints_spoken=2,
             time_to_reach_ms=9000, latency_p50_ms=3200),
        {"event": "manual_override", "at": "t", "step": 1, "sample": False},
        step(1, frames_sent=20, errors=4, candidates=0, matches=0, hints_spoken=0,
             time_to_reach_ms=None, latency_p50_ms=None),
        {"event": "arrival", "at": "t", "step": 1, "sample": False, "verified": False},
    ]
    sample = [{"event": "arrival", "at": "t", "step": 3, "sample": True, "verified": True}]
    (tmp_path / "a.json").write_text(json.dumps(session(field)), encoding="utf-8")
    (tmp_path / "b.json").write_text(json.dumps(session(sample)), encoding="utf-8")
    result = metrics.summarize([tmp_path / "a.json", tmp_path / "b.json"])
    walk = result["field_route"]
    assert walk["start"] == 1 and walk["manual_override"] == 1
    assert walk["arrivals"] == 1 and walk["verified_arrivals"] == 0
    assert walk["frames_sent"] == 31 and walk["errors"] == 5 and walk["hints_spoken"] == 3
    assert walk["p50_time_to_reach_ms"] == 9000 and walk["reach_n"] == 1
    assert walk["p50_observe_latency_ms"] == 3100 and walk["latency_steps_n"] == 2
    assert result["illustrative_sample"]["verified_arrivals"] == 1
    assert result["illustrative_sample"]["frames_sent"] == 0


def test_old_or_foreign_files_are_rejected(tmp_path):
    (tmp_path / "old.json").write_text(json.dumps({"kind": "offixed-replay-session", "events": []}),
                                       encoding="utf-8")
    with pytest.raises(ValueError, match="version 1"):
        metrics.summarize([tmp_path / "old.json"])
    (tmp_path / "other.json").write_text("{}", encoding="utf-8")
    with pytest.raises(ValueError, match="Not a replay session"):
        metrics.summarize([tmp_path / "other.json"])
