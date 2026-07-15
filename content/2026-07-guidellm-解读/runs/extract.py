#!/usr/bin/env python3
"""Extract the 4 rate-type runs → summary.json (canonical numbers for the video)."""
import json, os
DIR = os.path.dirname(os.path.abspath(__file__))

def g(d, *path, default=None):
    for p in path:
        if isinstance(d, dict) and p in d: d = d[p]
        else: return default
    return d

def row(name, label, f):
    d = json.load(open(os.path.join(DIR, f)))
    b = d["benchmarks"][0]; m = b["metrics"]
    return {
        "key": name, "label": label,
        "rps":   round(g(m,"requests_per_second","successful","mean") or 0, 2),
        "conc":  round(g(m,"request_concurrency","successful","mean") or 0, 1),
        "tps":   round(g(m,"output_tokens_per_second","successful","mean") or 0),
        "lat50": round(g(m,"request_latency","successful","median") or 0, 2),
        "lat95": round(g(m,"request_latency","successful","percentiles","p95") or 0, 2),
        "ttft50":round(g(m,"time_to_first_token_ms","successful","median") or 0),
        "ttft95":round(g(m,"time_to_first_token_ms","successful","percentiles","p95") or 0),
        "tpot":  round(g(m,"time_per_output_token_ms","successful","median") or 0, 1),
        "ok":    g(m,"request_totals","successful"),
    }

rows = [
    row("synchronous","同步 · 一次一条", "sync.json"),
    row("constant","恒定 · 目标 2 req/s", "constant.json"),
    row("poisson","泊松 · 均值 2 req/s", "poisson.json"),
    row("throughput","吞吐 · 打满并发", "throughput.json"),
]
summary = {
    "model": "Qwen3-32B",
    "gateway": "Higress",
    "data": "合成负载 · 输入 512 / 输出 128 token",
    "duration_s": 40,
    "rows": rows,
}
json.dump(summary, open(os.path.join(DIR,"summary.json"),"w"), ensure_ascii=False, indent=2)
print(json.dumps(summary, ensure_ascii=False, indent=2))
