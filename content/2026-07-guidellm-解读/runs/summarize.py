#!/usr/bin/env python3
"""Summarize guidellm benchmark JSON → key rate-type metrics."""
import json, sys

def g(d, *path, default=None):
    for p in path:
        if isinstance(d, dict) and p in d:
            d = d[p]
        else:
            return default
    return d

def stat(m, key, sub="median"):
    v = g(m, key, sub)
    return v

for f in sys.argv[1:]:
    d = json.load(open(f))
    b = d["benchmarks"][0]
    m = b["metrics"]
    rt = m["request_totals"]
    strat = g(b, "config", "strategy", "type_") or g(b, "type_")
    def num(x):
        return f"{x:.3g}" if isinstance(x,(int,float)) else "—"
    rps = g(m, "requests_per_second", "successful", "mean")
    conc = g(m, "request_concurrency", "successful", "mean")
    otps = g(m, "output_tokens_per_second", "successful", "mean") or g(m,"tokens_per_second","successful","mean")
    lat_p50 = g(m, "request_latency", "successful", "median")
    lat_p95 = g(m, "request_latency", "successful", "percentiles", "p95")
    ttft_p50 = g(m, "time_to_first_token_ms", "successful", "median")
    ttft_p95 = g(m, "time_to_first_token_ms", "successful", "percentiles", "p95")
    tpot_p50 = g(m, "time_per_output_token_ms", "successful", "median")
    itl_p50 = g(m, "inter_token_latency_ms", "successful", "median")
    print(f"\n=== {f}  [{strat}] ok={rt['successful']} err={rt['errored']} ===")
    print(f"  req/s(mean)      : {num(rps)}")
    print(f"  concurrency(mean): {num(conc)}")
    print(f"  out tok/s(mean)  : {num(otps)}")
    print(f"  latency p50/p95 s: {num(lat_p50)} / {num(lat_p95)}")
    print(f"  TTFT p50/p95 ms  : {num(ttft_p50)} / {num(ttft_p95)}")
    print(f"  TPOT p50 ms      : {num(tpot_p50)}   ITL p50 ms: {num(itl_p50)}")
