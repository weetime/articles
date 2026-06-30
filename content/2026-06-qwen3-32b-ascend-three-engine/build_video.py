#!/usr/bin/env python3
# 终版：7 镜全动画(含前缀树) + 配音 + 烧录字幕(底部安全区) + BGM，竖屏 & 横屏双输出
import subprocess, os, sys, asyncio, re
import edge_tts

# 用法: python build_video.py <report-dir>
# <report-dir> 下需有: anim/out/<scene>.mp4 + <scene>_l.mp4（Remotion 渲染产物）、bgm.wav
DIR = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.getcwd()
WORK = DIR
ANIM = os.path.join(DIR, "anim", "out")
VOICE = "zh-CN-YunyangNeural"
# ⚠️ SHOTS 是「本篇报告」专属：scene 名要与 anim/src 的 Composition 一致，narration 按本报告改写
RATE = "+8%"
XF = 0.5
SUBS = "--subs" in sys.argv   # 默认不烧字幕(画面自带文案,避免被视频号/抖音 UI 遮挡);要字幕加 --subs

SHOTS = [
    ("hero", "同一台昇腾 910B4、同一个 Qwen3-32B、同一份真实流量，只更换推理引擎。高压档下，vLLM 输出吞吐第一，明显领先另外两家。"),
    ("scaling", "并发越高，差距越明显。超过六十四并发后，vLLM 持续增长、仍未见顶；MindIE 增速放缓；而 SGLang 达峰后，吞吐不升反降。"),
    ("collapse", "客户端指标只反映结果，引擎内部指标才能定位根因。MindIE 首字延迟大幅升高，源于调度排队过深；SGLang 吞吐回退，源于 K V 缓存被打满。而 vLLM 排队浅、显存仍有余量。"),
    ("latency", "延迟同样拉开。首字延迟，vLLM 比 MindIE 低一个数量级；逐 token 延迟，SGLang 明显偏高；端到端时延，vLLM 全程最优。"),
    ("outro", "结论：这套昇腾栈上，vLLM-Ascend 是唯一可全场景默认推荐的引擎。完整的对齐参数与全量数据，都在公众号原文里，欢迎关注查看。"),
]

# --en：English Shorts (Hero → Scaling → Collapse → Latency → Outro),女声 en-US-AvaNeural
EN = "--en" in sys.argv
EN_SHOTS = [
    ("heroen", "Same 910B4, same Qwen3-32B, same workload — only the engine changes. At 128 concurrency, vLLM leads throughput at 1228 tokens per second."),
    ("scalingen", "Below 32, they match. Past 64 they split: vLLM keeps climbing, while SGLang peaks, then drops from 721 to 550."),
    ("collapseen", "Client metrics show what; internal metrics show why. MindIE's first token spikes at a queue depth of 34. SGLang regresses when KV-cache hits 100 percent. vLLM keeps headroom on both."),
    ("latencyen", "Latency follows suit: vLLM is lowest on first-token, inter-token, and end-to-end."),
    ("outroen", "Bottom line: vLLM-Ascend is the only across-the-board default here. Full data in the description."),
]
if EN:
    VOICE = "en-US-AvaNeural"
    RATE = "+10%"
    SHOTS = EN_SHOTS

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", " ".join(str(c) for c in cmd[:8]), "\n", r.stderr[-1600:]); sys.exit(1)
    return r

def dur(p):
    return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

def display(text):
    for a,b in [("K V","KV"),("Qwen3-32B","Qwen3-32B"),
                ("每秒一千二百二十八 token","1228 tok/s"),("一千二百二十八","1228"),
                ("一百二十八","128"),("二点二倍","2.2×"),
                ("百分之六十一","61%"),("百分之百","100%"),
                ("二十五点三秒","25.3s"),("三十四","34"),
                ("七百二十一","721"),("五百五十","550"),
                ("一点二秒","1.2s"),("二十一倍","21×"),("二百零二毫秒","202ms")]:
        text=text.replace(a,b)
    return text

def chunk_sentence(text, maxlen):
    parts=re.split(r"([，。？！、；：])", text)
    clauses=[]
    for i in range(0,len(parts),2):
        seg=parts[i]+(parts[i+1] if i+1<len(parts) else "")
        if seg: clauses.append(seg)
    chunks=[]; cur=""
    for cl in clauses:
        if len(cur)+len(cl)<=maxlen: cur+=cl
        else:
            if cur: chunks.append(cur)
            if len(cl)>maxlen:
                while len(cl)>maxlen: chunks.append(cl[:maxlen]); cl=cl[maxlen:]
                cur=cl
            else: cur=cl
    if cur: chunks.append(cur)
    P="，。？！、；：,.?!;:： 　"
    return [c.strip(P) for c in chunks if c.strip(P)]

def ass_ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h:d}:{m:02d}:{s:05.2f}"

async def tts(text, mp3):
    _proxy = os.environ.get("EDGE_TTS_PROXY") or None
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, proxy=_proxy)
    sents=[]
    with open(mp3,"wb") as f:
        async for ch in comm.stream():
            if ch["type"]=="audio": f.write(ch["data"])
            elif ch["type"]=="SentenceBoundary":
                sents.append((ch["offset"]/1e7, ch["duration"]/1e7, ch["text"]))
    return sents

def build_ass(sents, path, W, H, fontsize, marginv, maxlen):
    head=f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,PingFang SC,{fontsize},&H00FFFFFF,&H00FFFFFF,&H6E0A0D14,&H6E0A0D14,1,0,0,0,100,100,0,0,3,14,0,2,80,80,{marginv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines=[]
    for off,d,raw in sents:
        chunks=chunk_sentence(display(raw), maxlen)
        tot=sum(len(c) for c in chunks) or 1
        t=off
        for c in chunks:
            seg=d*len(c)/tot
            lines.append((t,t+seg,c)); t+=seg
    with open(path,"w") as f:
        f.write(head)
        for s,e,t in lines:
            f.write(f"Dialogue: 0,{ass_ts(s)},{ass_ts(e)},Cap,,0,0,0,,{t}\n")

def build(orient):
    land = orient=="land"
    W,H = (1920,1080) if land else (1080,1920)
    suffix = "_l" if land else ""
    fontsize = 44 if land else 52
    marginv = 60 if land else 430   # 抬高字幕(若开启)避开视频号/抖音底部 UI
    maxlen = 22 if land else 15
    os.chdir(WORK)
    clips=[]
    for i,(name,text) in enumerate(SHOTS,1):
        tag="en" if EN else ""
        mp3=f"s{orient}{tag}{i}.mp3"; ass=f"s{orient}{tag}{i}.ass"; clip=f"c{orient}{tag}{i}.mp4"
        src=os.path.join(ANIM, f"{name}{suffix}.mp4")
        if os.path.exists(mp3) and os.path.getsize(mp3)>2000 and "--reuse-tts" in sys.argv:
            sents=[]   # 复用已生成配音(代理不稳时离线重建)
        else:
            sents=asyncio.run(tts(text,mp3))
        if SUBS: build_ass(sents,ass,W,H,fontsize,marginv,maxlen)
        nd=dur(mp3); ad=dur(src)
        target=max(ad, nd+0.4); pad=max(0.0,target-ad)
        vchain=f"scale={W}:{H},setsar=1" + (f",subtitles={ass}" if SUBS else "")
        if pad>0.02: vchain+=f",tpad=stop_mode=clone:stop_duration={pad:.2f}"
        vchain+=",format=yuv420p"
        run(["ffmpeg","-y","-i",src,"-i",mp3,"-filter_complex",
             f"[0:v]{vchain}[v];[1:a]adelay=250|250,apad[a]",
             "-map","[v]","-map","[a]","-r","30","-t",f"{target:.2f}",
             "-c:v","libx264","-preset","medium","-crf","20",
             "-c:a","aac","-b:a","192k","-pix_fmt","yuv420p","-fps_mode","cfr",clip])
        clips.append((clip,dur(clip)))
        print(f"  [{orient}] {i} {name:11s} narr {nd:5.2f}s clip {clips[-1][1]:5.2f}s")

    inputs=[]
    for c,_ in clips: inputs+=["-i",c]
    vparts=[]; aparts=[]; off=0.0; vlab="0:v"; alab="0:a"
    for i in range(1,len(clips)):
        off += clips[i-1][1]-XF
        vparts.append(f"[{vlab}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[v{i}]")
        aparts.append(f"[{alab}][{i}:a]acrossfade=d={XF}[a{i}]")
        vlab=f"v{i}"; alab=f"a{i}"
    fc=";".join(vparts+aparts)
    vo=os.path.join(WORK,f"_vo{orient}{'en' if EN else ''}.mp4")
    run(["ffmpeg","-y",*inputs,"-filter_complex",fc,"-map",f"[{vlab}]","-map",f"[{alab}]",
         "-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","192k","-pix_fmt","yuv420p",vo])
    bgm=os.path.join(DIR,"bgm.wav")
    out=os.path.join(DIR, f"video-{'landscape' if land else 'portrait'}{'-en' if EN else ''}.mp4")
    run(["ffmpeg","-y","-i",vo,"-i",bgm,"-filter_complex",
         "[1:a]volume=0.22[bg];[bg][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[bgd];"
         "[0:a][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]",
         "-map","0:v","-map","[a]","-shortest","-c:v","copy","-c:a","aac","-b:a","192k",out])
    print(f"DONE -> {out}  {round(dur(out),1)}s")

# 默认只出竖屏 9:16（视频号/抖音）；要横屏 16:9 时显式加 --land
orients = ["port"] + (["land"] if "--land" in sys.argv else [])
for o in orients:
    print(f"=== building {o} ===")
    build(o)
