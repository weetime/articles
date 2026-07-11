#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""图谱录屏科技风竖屏讲解视频。相机 beat 的 hold 由每句配音时长决定 → 画面与配音锁定、零重叠。
流程:TTS → 算调度 → 写 tour.json → node 录屏 → 定点配音 + BGM ducking → mux。"""
import os, sys, subprocess, json

DIR = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(DIR)
RECORD_MJS = "/Users/fangyong/articles/content/2026-07-llm-sites-map/record_graph.mjs"
VIDEO = os.path.join(DIR, "graph-tour.mp4")
OUT = os.path.join(ART, "video-graph-tech.mp4")
sys.path.insert(0, DIR)
from huoshan_tts import synth, DEFVOICE   # 火山引擎(豆包)· 儒雅青年
SPEED = 1.1

# 口播(与 STEPS 一一对应;line 0 在 settle 播,line 1..12 对应 12 个相机 beat)
LINES = [
    "首先看这张图:Agent 评测,并非单一维度的一件事。",
    "这是它的全景 —— 五类基准,加一层评测框架,每一类衡量的能力各不相同。",
    "整体分为两支:固定数据集的基准,与自带数据的评测框架。",
    "本文的主角 tau bench,只占据其中一格:面向对话、需在后端执行动作、且须遵守策略的 Agent。",
    "其一,判分以后端数据库的最终状态为准 —— 不看表述是否漂亮,只看是否真正完成。",
    "其二,以 pass 的 k 次方衡量可靠性:同一任务多次独立执行,次次成功方才计入。",
    "其三,由一个独立模型扮演用户进行多轮对话;该用户模拟器的版本必须锁定,否则基准不可复现。",
    "实测中最关键的一点:能说,不等于能办 —— 自然语言层几乎全部通过,后端状态层却大面积失败。",
    "再看周边的其它格子,各自回答不同的问题。仅评测函数调用格式,应选用 BFCL,更为快速经济。",
    "评测代码修改能力,应选用 SWE-bench。",
    "评测浏览器与桌面操作,应选用 WebArena、OSWorld。",
    "评测通用助手的能力上限,应选用 GAIA。",
    "因此,不宜以单一分数回答全部问题。tau bench 所衡量的,是能否在业务规则下、经多轮真正把事办成。完整方法论与踩坑,详见正文。",
]
# (fit?, node, scale, ease_ms, line_idx) —— 12 个相机 beat 对应 line 1..12
STEPS = [
    ("fit",  None,       None, 1300, 1),
    ("focus","root",     1.35, 1400, 2),
    ("focus","tau",      2.05, 1600, 3),
    ("focus","dbjudge",  2.3,  1300, 4),
    ("focus","passk",    2.3,  1300, 5),
    ("focus","usersim",  2.3,  1300, 6),
    ("focus","ev1",      2.2,  1300, 7),
    ("focus","bfcl",     1.95, 1800, 8),
    ("focus","swe",      1.95, 1300, 9),
    ("focus","webarena", 1.95, 1300, 10),
    ("focus","gaia",     1.95, 1300, 11),
    ("fit",  None,       None, 1500, 12),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("FAIL", " ".join(map(str,cmd[:6])), "\n", r.stderr[-1500:]); raise SystemExit(1)
    return r
def dur(p): return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())
# 1) TTS(火山 儒雅青年;存在则复用)
print("voice:", DEFVOICE)
durs=[]; mp3=[]
for i,t in enumerate(LINES):
    m=os.path.join(DIR,f"n{i}.mp3")
    if not (os.path.exists(m) and os.path.getsize(m)>2000):
        ok,info=synth(t,m,speed=SPEED)
        if not ok: raise SystemExit(f"TTS fail line{i}: {info}")
    mp3.append(m); durs.append(dur(m))

# 2) 调度:hold = 配音时长 - ease + 500(下限 1600),画面锁配音
settle = int(durs[0]*1000) + 600
steps=[]; offsets={0:300}; cur=settle
for kind,nid,scale,ease,li in STEPS:
    hold=max(1600, int(durs[li]*1000)-ease+500)
    steps.append({"fit":kind=="fit","id":nid,"scale":scale,"ease":ease,"hold":hold})
    offsets[li]=cur+120; cur+=ease+hold
json.dump({"settle":settle,"steps":steps}, open(os.path.join(DIR,"tour.json"),"w"))
print(f"tour ≈ {cur/1000:.1f}s; settle {settle}ms")

# 3) 录屏(node → graph-tour.mp4)
print("recording tour…"); run(["node", RECORD_MJS]); print("recorded", dur(VIDEO), "s")

# 4) 定点配音轨(adelay 落位,不重叠 → normalize=0 直加)
inp=[]; parts=[]
for i,m in enumerate(mp3):
    off=offsets[i]; inp+=["-i",m]; parts.append(f"[{i}:a]adelay={off}|{off}[a{i}]")
mix="".join(f"[a{i}]" for i in range(len(mp3)))+f"amix=inputs={len(mp3)}:normalize=0[narr]"
narr=os.path.join(DIR,"narration.wav")
run(["ffmpeg","-y",*inp,"-filter_complex",";".join(parts)+";"+mix,"-map","[narr]",narr])
narr_end=max(offsets[i]/1000+durs[i] for i in range(len(mp3)))

# 5) 字幕 ASS(每句切成短块,落在句子时窗内;底部,避开视频号 UI)
import re
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
ASS="/tmp/tau_graph_subs.ass"
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

# 6) 视频末尾冻结补足 + 烧录字幕
vd=dur(VIDEO); target=max(vd,narr_end)+0.6; pad=max(0.0,target-vd)
vpad=os.path.join(DIR,"_vpad.mp4")
run(["ffmpeg","-y","-i",VIDEO,"-vf",f"tpad=stop_mode=clone:stop_duration={pad:.2f},subtitles={ASS}",
     "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p","-r","30","-t",f"{target:.2f}",vpad])

# 6) BGM + mux(sidechain duck)
run(["python3", os.path.join(ART,"make_bgm.py"), DIR]); bgm=os.path.join(DIR,"bgm.wav")
run(["ffmpeg","-y","-i",vpad,"-i",narr,"-i",bgm,"-filter_complex",
     f"[2:a]volume=0.20,atrim=0:{target:.2f}[bg];[bg][1:a]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[bgd];"
     "[1:a][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]",
     "-map","0:v","-map","[a]","-shortest","-c:v","copy","-c:a","aac","-b:a","192k",OUT])
print(f"DONE -> {OUT}  {dur(OUT):.1f}s")
