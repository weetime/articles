#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""总装:Act1(知识图谱)+ Act2(RUNBOOK 终端实跑)拼接 → 全程一条 BGM(在配音下自动压低)。
输出 content/2026-07-evalscope-解读/video-runbook.mp4(竖屏)。"""
import os, subprocess
DIR = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(DIR)
VID = os.path.join(ART, "video")
BGM_PY = os.path.join(DIR, "make_bgm.py")
ACT1 = os.path.join(VID, "act1-graph.mp4")
ACT2 = os.path.join(VID, "act2-runbook.mp4")
OUT  = os.path.join(ART, "video-runbook.mp4")

def run(cmd):
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print("FAIL"," ".join(map(str,cmd[:6])),"\n",r.stderr[-1500:]); raise SystemExit(1)
    return r
def dur(p): return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

for f in (ACT1,ACT2):
    assert os.path.exists(f), f"缺段:{f}"
print(f"act1 {dur(ACT1):.1f}s + act2 {dur(ACT2):.1f}s")

# pass 1:拼接两段(保留各自配音)
comb=os.path.join(DIR,"_combined.mp4")
run(["ffmpeg","-y","-i",ACT1,"-i",ACT2,"-filter_complex",
     "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]","-map","[v]","-map","[a]",
     "-r","30","-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",comb])
total=dur(comb)

# pass 2:铺一条 BGM,在配音下 sidechain 压低([0:a] 是输入 pad,可被两处复用)
run(["python3",BGM_PY,DIR]); bgm=os.path.join(DIR,"bgm.wav")
run(["ffmpeg","-y","-i",comb,"-stream_loop","-1","-i",bgm,"-filter_complex",
     f"[1:a]volume=0.18,atrim=0:{total:.2f}[bg];"
     "[bg][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[bgd];"
     "[0:a][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]",
     "-map","0:v","-map","[a]","-shortest","-c:v","copy","-c:a","aac","-b:a","192k",OUT])
os.remove(comb)
print(f"DONE -> {OUT}  {dur(OUT):.1f}s")
