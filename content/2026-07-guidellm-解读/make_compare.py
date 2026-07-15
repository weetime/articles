#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""沐曦 C500 vs A100:baseline(max-num-seqs 64) vs 优化(512) 峰值吞吐对比 → figs/fig-compare.png"""
import os, json
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(DIR,"runs"); FIG=os.path.join(DIR,"figs")
for f in ("Heiti TC","Arial Unicode MS","Songti SC"):
    if f in {x.name for x in fm.fontManager.ttflist}: plt.rcParams["font.family"]=[f]; break
plt.rcParams["axes.unicode_minus"]=False
BG="#0f1117"; GRID="#2a2f3d"; TXT="#e7eaf3"; DIM="#8b94a4"; AMBER="#f0a93b"; CYAN="#2bc4e6"; GREEN="#3ddc84"; ROSE="#ff5d7a"
plt.rcParams.update({"figure.facecolor":BG,"axes.facecolor":BG,"savefig.facecolor":BG,
    "text.color":TXT,"axes.labelcolor":TXT,"xtick.color":DIM,"ytick.color":DIM,"axes.edgecolor":GRID,"grid.color":GRID,"font.size":13})

def peak(p):
    S=json.load(open(os.path.join(R,p,"summary_real.json")))
    return max(x["tps"] for x in S["curve"]), max(x["rps"] for x in S["curve"])
mb,mbr=peak("metax"); mo,mor=peak("metax_opt"); ab,abr=peak("a100_baseline"); ao,aor=peak("a100_opt")

fig,ax=plt.subplots(figsize=(9.6,5.8),dpi=150)
groups=["MetaX C500 (1×GPU)","NVIDIA A100 (1×GPU)"]; x=np.arange(2); w=0.34
base=[mb,ab]; opt=[mo,ao]
b1=ax.bar(x-w/2, base, w, color=DIM, ec=BG, label="baseline · max-num-seqs 64")
b2=ax.bar(x+w/2, opt,  w, color=[AMBER,CYAN], ec=BG, label="tuned · max-num-seqs 512")
for bars in (b1,b2):
    for r in bars:
        ax.text(r.get_x()+r.get_width()/2, r.get_height(), f"{r.get_height():.0f}", ha="center", va="bottom", color=TXT, fontsize=13, fontweight="bold")
# 优化增益标注
ax.annotate(f"+{mo/mb-1:.0%}", (0, max(mb,mo)), xytext=(0,26), textcoords="offset points", ha="center", color=GREEN, fontsize=12, fontweight="bold")
ax.annotate(f"+{ao/ab-1:.0%}", (1, max(ab,ao)), xytext=(0,26), textcoords="offset points", ha="center", color=GREEN, fontsize=12, fontweight="bold")
# 硬件差
ax.annotate(f"A100 ≈ {ao/mo:.1f}× MetaX", (0.5, max(ab,ao)*0.62), ha="center", color=ROSE, fontsize=13, fontweight="bold")
ax.set_xticks(x); ax.set_xticklabels(groups, fontsize=13); ax.set_ylabel("Peak output (tok/s)")
ax.set_ylim(top=max(ab,ao)*1.2)
ax.grid(True, axis="y", lw=.7, alpha=.5); ax.set_axisbelow(True)
for s in ("top","right"): ax.spines[s].set_visible(False)
ax.legend(loc="upper left", facecolor="#141824", edgecolor=GRID, labelcolor=TXT, fontsize=11)
fig.suptitle("1.7× across GPUs, but tuning max-num-seqs barely helps", color=TXT, fontsize=17, fontweight="bold", y=0.99)
fig.text(0.5,0.925,"Qwen2.5-0.5B · 512/128 · Higress gateway · peak output tok/s", color=DIM, fontsize=11, ha="center")
fig.tight_layout(rect=[0,0,1,0.9]); fig.savefig(os.path.join(FIG,"fig-compare.png"), bbox_inches="tight"); plt.close(fig)
print(f"沐曦 {mb:.0f}→{mo:.0f}  A100 {ab:.0f}→{ao:.0f}  | A100/沐曦 {ao/mo:.2f}x  → fig-compare.png")
