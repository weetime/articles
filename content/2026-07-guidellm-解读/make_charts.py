#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render real guidellm charts (dark ModelDoctor brand) from runs/summary_real.json → figs/.
  fig-curve.png     : latency-throughput capacity curve + knee + 4 rate-types' 落点 (hero)
  fig-sweep.png     : concurrency sweep — throughput & p95 latency vs concurrency, knee marked
  fig-ratetype.png  : rate-type comparison — throughput | p95 latency bars (4 施压方式)
"""
import os, json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm

DIR = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(DIR, "runs", "summary_real.json")))
FIG = os.path.join(DIR, "figs"); os.makedirs(FIG, exist_ok=True)

# ---- CJK font ----
for f in ("Heiti TC", "Arial Unicode MS", "Songti SC", "STHeiti"):
    if f in {x.name for x in fm.fontManager.ttflist}:
        plt.rcParams["font.family"] = [f]; break
plt.rcParams["axes.unicode_minus"] = False

# ---- brand palette (dark) ----
BG="#0f1117"; PANEL="#141824"; GRID="#2a2f3d"; TXT="#e7eaf3"; DIM="#8b94a4"
VIOLET="#9d8bff"; CYAN="#2bc4e6"; AMBER="#f0a93b"; GREEN="#3ddc84"; ROSE="#ff5d7a"
plt.rcParams.update({
    "figure.facecolor":BG, "axes.facecolor":BG, "savefig.facecolor":BG,
    "text.color":TXT, "axes.labelcolor":TXT, "xtick.color":DIM, "ytick.color":DIM,
    "axes.edgecolor":GRID, "grid.color":GRID, "font.size":13,
})
MODEL=S["model"]; GW=S["gateway"]; PT=S["prompt_tokens"]; OT=S["output_tokens"]
HW=S.get("hardware_short","").replace("单卡","1×GPU")
sub=f"{MODEL} · {HW} · {GW} gateway · synthetic {PT}/{OT} token"
curve=S["curve"]; rt=S["rate_types"]; knee_rps=S["knee_rps"]
# knee point from curve
knee=min(curve, key=lambda p: abs(p["rps"]-knee_rps))

def style(ax):
    ax.grid(True, lw=.7, alpha=.5); ax.set_axisbelow(True)
    for s in ("top","right"): ax.spines[s].set_visible(False)

# ============ 1) capacity curve + rate-type 落点 ============
fig, ax = plt.subplots(figsize=(9.2,6.2), dpi=150)
xs=[p["rps"] for p in curve]; ys=[p["lat95"] for p in curve]
ax.plot(xs, ys, "-o", color=CYAN, lw=2.4, ms=7, mfc=BG, mec=CYAN, mew=2, label="concurrency sweep", zorder=3)
for p in curve:
    ax.annotate(f"c{p['conc_set']}", (p["rps"],p["lat95"]), color=DIM, fontsize=9,
                xytext=(0,9), textcoords="offset points", ha="center")
# SLO line + 违约区 (goodput framing)
slo = S.get("slo_lat95", knee["lat95"]); ymax = max(ys)*1.06
ax.set_ylim(bottom=min(ys)*0.9, top=ymax)
ax.axhspan(slo, ymax, color=ROSE, alpha=0.07, zorder=0)
ax.axhline(slo, color=AMBER, ls="--", lw=1.7, alpha=.85, zorder=2)
ax.annotate(f"SLO: P95 ≤ {slo:.1f}s", (max(xs)*1.14, slo), color=AMBER, fontsize=11.5, fontweight="bold",
            va="bottom", ha="right")
ax.annotate("SLO violation zone", (max(xs)*1.14, ymax*0.985), color=ROSE, fontsize=11, fontweight="bold",
            va="top", ha="right")
# goodput point (= knee: SLO 内最大吞吐)
ax.scatter([knee["rps"]],[knee["lat95"]], s=380, marker="*", color=GREEN, ec=BG, lw=1.5, zorder=6)
ax.annotate(f"goodput ≈ {knee['rps']:.0f} req/s\n(deliverable under SLO)", (knee["rps"],knee["lat95"]),
            color=GREEN, fontsize=12, fontweight="bold", xytext=(10,-46), textcoords="offset points")
# rate-type 落点(每种单独偏移,避免叠字)
RTC={"synchronous":GREEN,"constant":CYAN,"poisson":ROSE,"throughput":VIOLET}
RTOFF={"synchronous":(8,-18,"left"),"constant":(-10,12,"right"),"poisson":(8,8,"left"),"throughput":(6,10,"left")}
for k,c in RTC.items():
    p=rt[k]; dx,dy,ha=RTOFF[k]
    ax.scatter([p["rps"]],[p["lat95"]], s=130, color=c, ec=BG, lw=1.5, zorder=5)
    lbl = k+" (raw peak)" if k=="throughput" else k
    ax.annotate(lbl, (p["rps"],p["lat95"]), color=c, fontsize=10.5, fontweight="bold",
                xytext=(dx,dy), textcoords="offset points", ha=ha)
ax.set_xlabel("Throughput (req/s)"); ax.set_ylabel("P95 Latency (s)")
ax.set_xlim(left=-0.5, right=max(xs)*1.16)
style(ax); ax.legend(loc="upper left", facecolor=PANEL, edgecolor=GRID, labelcolor=TXT)
fig.suptitle("goodput: deliverable capacity under SLO, not raw peak", color=TXT, fontsize=17, fontweight="bold", y=0.99)
fig.text(0.5, 0.93, sub, color=DIM, fontsize=11, ha="center")
fig.tight_layout(rect=[0,0,1,0.9]); fig.savefig(os.path.join(FIG,"fig-curve.png"), bbox_inches="tight"); plt.close(fig)

# ============ 2) concurrency sweep: throughput & p95 latency ============
fig, ax = plt.subplots(figsize=(9.2,5.6), dpi=150)
cs=[p["conc_set"] for p in curve]; rps=[p["rps"] for p in curve]; lat=[p["lat95"] for p in curve]
ax.plot(cs, rps, "-o", color=CYAN, lw=2.4, ms=6, mfc=BG, mec=CYAN, mew=2, label="Throughput (req/s)")
ax.set_xscale("log", base=2); ax.set_xticks(cs); ax.set_xticklabels([str(c) for c in cs])
ax.set_xlabel("Concurrency"); ax.set_ylabel("Throughput (req/s)", color=CYAN)
ax.tick_params(axis="y", colors=CYAN); style(ax)
ax2=ax.twinx(); ax2.plot(cs, lat, "-s", color=ROSE, lw=2.4, ms=6, mfc=BG, mec=ROSE, mew=2, label="P95 Latency (s)")
ax2.set_ylabel("P95 Latency (s)", color=ROSE); ax2.tick_params(axis="y", colors=ROSE)
for s in ("top",): ax2.spines[s].set_visible(False)
ax.axvline(knee["conc_set"], color=AMBER, ls="--", lw=1.6, alpha=.8)
ax.annotate(f"knee · c{knee['conc_set']}", (knee["conc_set"], max(rps)*.62), color=AMBER,
            fontsize=12, fontweight="bold", ha="center", xytext=(0,0), textcoords="offset points")
l1,la1=ax.get_legend_handles_labels(); l2,la2=ax2.get_legend_handles_labels()
ax.legend(l1+l2, la1+la2, loc="upper left", facecolor=PANEL, edgecolor=GRID, labelcolor=TXT)
fig.suptitle("Concurrency sweep: throughput plateaus, latency takes off", color=TXT, fontsize=17, fontweight="bold", y=0.99)
fig.text(0.5, 0.93, sub, color=DIM, fontsize=11, ha="center")
fig.tight_layout(rect=[0,0,1,0.9]); fig.savefig(os.path.join(FIG,"fig-sweep.png"), bbox_inches="tight"); plt.close(fig)

# ============ 3) rate-type comparison bars ============
order=["synchronous","constant","poisson","throughput"]
cols=[RTC[k] for k in order]
fig,(a1,a2)=plt.subplots(1,2, figsize=(10.4,5.4), dpi=150)
rpsv=[rt[k]["rps"] for k in order]; latv=[rt[k]["lat95"] for k in order]
b1=a1.bar(order, rpsv, color=cols, ec=BG); a1.set_title("Throughput (req/s)", color=TXT, fontsize=14, fontweight="bold")
for r,v in zip(b1,rpsv): a1.text(r.get_x()+r.get_width()/2, v, f"{v:.2f}", ha="center", va="bottom", color=TXT, fontsize=12, fontweight="bold")
b2=a2.bar(order, latv, color=cols, ec=BG); a2.set_title("P95 Latency (s)", color=TXT, fontsize=14, fontweight="bold")
for r,v in zip(b2,latv): a2.text(r.get_x()+r.get_width()/2, v, f"{v:.2f}", ha="center", va="bottom", color=TXT, fontsize=12, fontweight="bold")
for a in (a1,a2):
    style(a); a.set_xticks(range(len(order))); a.set_xticklabels(order, rotation=18, ha="right", fontsize=11)
    a.margins(y=.18)
fig.suptitle("One endpoint, four rate-types: throughput vs tail latency", color=TXT, fontsize=17, fontweight="bold", y=1.0)
fig.text(0.5,0.925, sub, color=DIM, fontsize=11, ha="center")
fig.tight_layout(rect=[0,0,1,0.9]); fig.savefig(os.path.join(FIG,"fig-ratetype.png"), bbox_inches="tight"); plt.close(fig)

print("✓ charts →", FIG)
for f in ("fig-curve.png","fig-sweep.png","fig-ratetype.png"):
    print("   ", f)
