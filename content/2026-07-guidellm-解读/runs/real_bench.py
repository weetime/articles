#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Real guidellm scenario: ① concurrency sweep → latency-throughput curve + SLO knee,
② rate-type comparison AT the knee (constant vs poisson) + bookends (sync / throughput).
Secrets from env only: GD_KEY, GD_HMODEL. Writes runs/curve.json + runs/summary_real.json.

Run: GD_KEY=... GD_HMODEL=... python real_bench.py
Idempotent: reuses existing *.json outputs.
"""
import os, sys, json, subprocess

DIR = os.path.dirname(os.path.abspath(__file__))
GD_TARGET = os.environ.get("GD_TARGET", "http://ENDPOINT:PORT")
GD_MODEL  = os.environ.get("GD_MODEL",  "MODEL_NAME")
GD_KEY    = os.environ["GD_KEY"]
GD_HMODEL = os.environ.get("GD_HMODEL")          # optional Higress routing header
PROMPT_TOKENS = int(os.environ.get("PROMPT_TOKENS", 512))
OUTPUT_TOKENS = int(os.environ.get("OUTPUT_TOKENS", 128))
PROCESSOR = os.environ.get("PROCESSOR", "Qwen/Qwen2.5-0.5B-Instruct")
SWEEP_SECS = int(os.environ.get("SWEEP_SECS", 30))
RATE_SECS  = int(os.environ.get("RATE_SECS", 45))
CONC_LIST  = os.environ.get("CONC_LIST", "1,2,4,8,16,32,64,96,128")
SLO_MULT   = float(os.environ.get("SLO_MULT", 2.0))   # knee = max rps with lat p95 ≤ SLO_MULT × single-stream baseline
HARDWARE       = os.environ.get("HARDWARE", "沐曦 MetaX C500 · 单卡 · 64GiB · 240 TFLOPS")
HARDWARE_SHORT = os.environ.get("HARDWARE_SHORT", "沐曦 MetaX C500 单卡")

_headers = {"Authorization": f"Bearer {GD_KEY}"}
if GD_HMODEL:
    _headers["x-higress-llm-model"] = GD_HMODEL
_extras = {"headers": _headers}
if os.environ.get("GD_NO_THINK"):                # Qwen3-style reasoning models only
    _extras["body"] = {"chat_template_kwargs": {"enable_thinking": False}}
RFK = json.dumps({"extras": _extras})

WARMUP = float(os.environ.get("WARMUP", 0.2))   # discard first fraction of each benchmark (rampup/cold-start)

def guidellm(rate_type, rate, out, secs, warmup=True):
    if out and os.path.exists(out) and os.path.getsize(out) > 2000:
        print(f"  reuse {os.path.basename(out)}"); return out
    argv = ["guidellm","benchmark","run",
        f"--target={GD_TARGET}", f"--model={GD_MODEL}", f"--rate-type={rate_type}",
        f"--data=prompt_tokens={PROMPT_TOKENS},output_tokens={OUTPUT_TOKENS}",
        f"--processor={PROCESSOR}", "--request-type=chat_completions",
        f"--request-formatter-kwargs={RFK}", '--backend-kwargs={"validate_backend": false}',
        f"--max-seconds={secs}", "--max-requests=100000", "--random-seed=42",
        f"--output-path={out or '/tmp/gd_discard.json'}"]
    if rate is not None:
        argv.append(f"--rate={rate}")
    if warmup and WARMUP > 0:
        argv.append(f"--warmup={WARMUP}")
    print(f"  >> {rate_type} rate={rate} secs={secs}{' (warmup '+str(WARMUP)+')' if warmup else ''}")
    r = subprocess.run(argv, capture_output=True, text=True)
    if (r.returncode or (out and not os.path.exists(out))):
        print(r.stdout[-500:], r.stderr[-1500:]); raise SystemExit(f"guidellm failed: {rate_type} {rate}")
    return out

# ---- prime the endpoint (warm model + CUDA graphs + prefix cache; discarded) ----
print("⓪ warmup / prime (discarded)…")
subprocess.run(["rm","-f","/tmp/gd_prime.json"])
guidellm("concurrent", "16", "/tmp/gd_prime.json", 15, warmup=False)

def metrics(b):
    m = b["metrics"]; st = b["config"]["strategy"]
    def g(k, s="mean"): return m[k]["successful"][s]
    def p95(k): return m[k]["successful"]["percentiles"]["p95"]
    return {
        "conc_set": st.get("max_concurrency") or st.get("streams"),
        "conc": round(g("request_concurrency"), 2),
        "rps": round(g("requests_per_second"), 3),
        "tps": round(g("output_tokens_per_second"), 1),
        "lat50": round(g("request_latency", "median"), 3),
        "lat95": round(p95("request_latency"), 3),
        "ttft50": round(g("time_to_first_token_ms", "median"), 1),
        "ttft95": round(p95("time_to_first_token_ms"), 1),
        "tpot": round(g("time_per_output_token_ms", "median"), 2),
        "ok": m["request_totals"]["successful"], "err": m["request_totals"]["errored"],
    }

# ---- ① concurrency sweep (one process, multiple points) ----
print("① concurrency sweep:", CONC_LIST)
sweep_out = os.path.join(DIR, "sweep.json")
guidellm("concurrent", CONC_LIST, sweep_out, SWEEP_SECS)
sweep = json.load(open(sweep_out))
pts = [metrics(b) for b in sweep["benchmarks"]]
pts = [p for p in pts if p["ok"] > 0]
pts.sort(key=lambda p: p["conc"])
for p in pts:
    print(f"    conc={p['conc_set']:>3} → rps {p['rps']:.2f} · tok/s {p['tps']:.0f} · lat p95 {p['lat95']:.2f}s · TTFT p95 {p['ttft95']:.0f}ms · ok {p['ok']}/{p['ok']+p['err']}")

# ---- knee: highest rps while p95 latency stays within SLO_MULT× the single-stream baseline ----
base_lat95 = pts[0]["lat95"] or 1e9
slo_lat = SLO_MULT * base_lat95
under = [p for p in pts if p["lat95"] <= slo_lat]
knee = max(under, key=lambda p: p["rps"]) if under else max(pts, key=lambda p: p["rps"])
knee_rps = max(1, round(knee["rps"]))
print(f"② knee @ concurrency {knee['conc_set']}: {knee['rps']:.2f} req/s "
      f"(lat p95 {knee['lat95']:.2f}s ≤ {slo_lat:.2f}s = {SLO_MULT}×{base_lat95:.2f}s baseline); "
      f"rate-type runs @ {knee_rps} req/s")

# ---- ② rate-type comparison at a stable operating point (below the knee) ----
# Open-loop constant/poisson AT the knee-rps overshoots into saturation (queueing +
# max-num-seqs cap), muddying the arrival-shape contrast. Run at RATE_FRAC × knee —
# a realistic operating point with headroom, where poisson's bursts show a clean tail.
RATE_FRAC = float(os.environ.get("RATE_FRAC", 0.5))
op_rate = max(1, round(RATE_FRAC * knee_rps))
print(f"   rate-type comparison @ {op_rate} req/s  ({RATE_FRAC:.0%} of knee, 留余量的稳态点)")
const_out = guidellm("constant", op_rate, os.path.join(DIR, "rt_constant.json"), RATE_SECS)
pois_out  = guidellm("poisson",  op_rate, os.path.join(DIR, "rt_poisson.json"),  RATE_SECS)
rt = {
    "synchronous": pts[0],                                   # sweep concurrency=1
    "constant":    metrics(json.load(open(const_out))["benchmarks"][0]),
    "poisson":     metrics(json.load(open(pois_out))["benchmarks"][0]),
    "throughput":  max(pts, key=lambda p: p["rps"]),         # peak-throughput sweep point (the real ceiling)
}

json.dump({"model": "Qwen2.5-0.5B-Instruct", "gateway": "Higress",
           "hardware": HARDWARE, "hardware_short": HARDWARE_SHORT,
           "prompt_tokens": PROMPT_TOKENS, "output_tokens": OUTPUT_TOKENS,
           "sweep_secs": SWEEP_SECS, "rate_secs": RATE_SECS,
           "slo_mult": SLO_MULT, "slo_lat95": round(slo_lat, 3),
           "knee_rps": knee_rps, "knee_conc": knee["conc_set"], "op_rate": op_rate,
           "curve": pts, "rate_types": rt},
          open(os.path.join(DIR, "summary_real.json"), "w"), ensure_ascii=False, indent=2)
print("✓ wrote → summary_real.json")
