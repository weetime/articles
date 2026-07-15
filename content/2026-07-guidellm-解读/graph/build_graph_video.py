#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Act 1:guidellm 能力图谱录屏科技风竖屏讲解。相机 beat 的 hold 由每句配音时长决定 → 画面与配音锁定。
流程:TTS → 算调度 → 写 tour.json → node 录屏 → 定点配音 + 字幕 → video/act1-graph.mp4(不含 BGM)。"""
import os, sys, subprocess, json, re

DIR = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(DIR)
RECORD_MJS = "/Users/fangyong/articles/content/2026-07-llm-sites-map/record_graph_guidellm.mjs"
VIDEO = os.path.join(DIR, "graph-tour.mp4")
OUT = os.path.join(ART, "video", "act1-graph.mp4")
sys.path.insert(0, DIR)
from huoshan_tts import synth, DEFVOICE
SPEED = 1.2

def tts_adapt(s):
    # TTS-only 读音修正(字幕仍显示原词):GuideLLM 读 guide + L-L-M;vLLM 读 V-L-L-M
    return s.replace("guidellm", "guide L L M").replace("vLLM", "V L L M")

# 口播(line 0 在 settle 播,line 1..N 对应相机 beat)—— 口语化;术语保英文;已裁剪加快
LINES = [
    "大模型上线前,压测这关绕不开。但很多人漏了一件事:同一个服务,压法不一样,报出来的数能差好几倍。这期聊聊 guidellm。",
    "先看张全景图 —— guidellm 这把压测器的家当都在这。",
    "评测推理服务分两件事:精度看答得准不准,性能看扛不扛得住。guidellm 管性能。",
    "它是 vLLM 官方生态的参考压测器,一条命令怼一个 OpenAI 兼容端点。两张王牌:内置合成负载,和 rate-type 家族。",
    "合成负载 —— 一行参数把输入输出的 token 数锁死,不用数据集,换机器换时间都能复现。",
    "而主角是 rate-type,决定你怎么把请求打进去:synchronous 一次一条、throughput 打满、constant 匀速、poisson 突发。换个 rate-type,延迟和吞吐完全两码事。",
    "每种到底什么时候用、数差多少?接下来先测容量,再对同一个真实的 Qwen2.5-0.5B 端点各跑一遍,见分晓。",
]
# (fit?, node, scale, ease_ms, line_idx) —— 相机 beat 对应 line 1..N
STEPS = [
    ("fit",  None,          None, 1300, 1),
    ("focus","root",        1.45, 1300, 2),
    ("focus","guidellm",    1.70, 1500, 3),
    ("focus","synthetic",   2.00, 1400, 4),
    ("focus","presscat",    1.70, 1500, 5),
    ("focus","ev1",         1.85, 1500, 6),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("FAIL", " ".join(map(str,cmd[:6])), "\n", r.stderr[-1500:]); raise SystemExit(1)
    return r
def dur(p): return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

# 1) TTS
print("voice:", DEFVOICE)
durs=[]; mp3=[]
for i,t in enumerate(LINES):
    m=os.path.join(DIR,f"n{i}.mp3")
    if not (os.path.exists(m) and os.path.getsize(m)>2000):
        ok,info=synth(tts_adapt(t),m,speed=SPEED)
        if not ok: raise SystemExit(f"TTS fail line{i}: {info}")
    mp3.append(m); durs.append(dur(m))

# 2) 调度:hold = 配音时长 - ease + 150(下限 950)
settle = int(durs[0]*1000) + 250
steps=[]; offsets={0:250}; cur=settle
for kind,nid,scale,ease,li in STEPS:
    hold=max(950, int(durs[li]*1000)-ease+150)
    steps.append({"fit":kind=="fit","id":nid,"scale":scale,"ease":ease,"hold":hold})
    offsets[li]=cur+120; cur+=ease+hold
json.dump({"settle":settle,"steps":steps}, open(os.path.join(DIR,"tour.json"),"w"))
print(f"tour ≈ {cur/1000:.1f}s; settle {settle}ms")

# 3) 录屏
print("recording tour…"); run(["node", RECORD_MJS]); print("recorded", dur(VIDEO), "s")

# 4) 定点配音轨
inp=[]; parts=[]
for i,m in enumerate(mp3):
    off=offsets[i]; inp+=["-i",m]; parts.append(f"[{i}:a]adelay={off}|{off}[a{i}]")
mix="".join(f"[a{i}]" for i in range(len(mp3)))+f"amix=inputs={len(mp3)}:normalize=0[narr]"
narr=os.path.join(DIR,"narration.wav")
run(["ffmpeg","-y",*inp,"-filter_complex",";".join(parts)+";"+mix,"-map","[narr]",narr])
narr_end=max(offsets[i]/1000+durs[i] for i in range(len(mp3)))

# 5) 字幕 ASS
def _chunks(text,maxlen=17):
    ps=re.split(r"([,,。!?!?、;;:—])",text); segs=[]; cur=""
    for i in range(0,len(ps),2):
        seg=ps[i]+(ps[i+1] if i+1<len(ps) else "")
        if not seg: continue
        if len(cur)+len(seg)<=maxlen: cur+=seg
        else:
            if cur: segs.append(cur)
            cur=seg
    if cur: segs.append(cur)
    P="，。！？、；：— ,.!?;: "
    return [c.strip(P) for c in segs if c.strip(P)]
def _ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60; return f"{h:d}:{m:02d}:{s:05.2f}"
ASS="/tmp/gd_graph_subs.ass"
head=("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n"
      "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
      "Style: Cap,PingFang SC,52,&H00FFFFFF,&H00FFFFFF,&H00101014,&H00000000,1,0,0,0,100,100,0,0,1,5,2,2,80,80,430,1\n\n"
      "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
ev=[]
for i,text in enumerate(LINES):
    st=offsets[i]/1000.0; d=durs[i]; cks=_chunks(text); tot=sum(len(c) for c in cks) or 1; t=st
    for c in cks:
        seg=d*len(c)/tot; ev.append(f"Dialogue: 0,{_ts(t)},{_ts(t+seg)},Cap,,0,0,0,,{c}"); t+=seg
open(ASS,"w",encoding="utf-8").write(head+"\n".join(ev)+"\n")

# 6) 冻结补足 + 烧录字幕
vd=dur(VIDEO); target=max(vd,narr_end)+0.6; pad=max(0.0,target-vd)
vpad=os.path.join(DIR,"_vpad.mp4")
run(["ffmpeg","-y","-i",VIDEO,"-vf",f"tpad=stop_mode=clone:stop_duration={pad:.2f},subtitles={ASS}",
     "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p","-r","30","-t",f"{target:.2f}",vpad])

# 7) 只叠配音(BGM 留到总装)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
run(["ffmpeg","-y","-i",vpad,"-i",narr,
     "-map","0:v","-map","1:a","-shortest","-c:v","copy","-c:a","aac","-b:a","192k",OUT])
print(f"DONE Act1 -> {OUT}  {dur(OUT):.1f}s")
