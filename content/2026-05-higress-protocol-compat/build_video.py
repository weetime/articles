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
    ("hero", "同一个网关、同一个后端、同一把密钥，并行承载 OpenAI 与 Anthropic 两种协议。网关在中间完成协议互转——这层转换是否引入可观测的延迟？实测八十次：首 token 中位延迟相差六点六毫秒，总时延相差百分之零点一。"),
    ("dualentry", "网关提供两类入口，共用同一后端。OpenAI 请求原样直通，仅做路由与计量；Anthropic 请求先映射为 OpenAI 形态，响应再回译为 Anthropic 事件流。转换运行在网关的 wasm 插件内，按入口路径自动判别。"),
    ("compare", "四项核心指标：首 token 与总时延的中位数、九五分位。两种协议数值高度一致，所有差异均小于百分之五，且小于样本自身的标准差。统计上，两协议无可测差异。"),
    ("zeroloss", "零损耗源于量级。输出两百个 token 约二十一点五秒，其中百分之九十九以上来自后端推理；协议转换在 wasm 层仅毫秒量级。毫秒级的开销，无法在二十秒级的总时延中显现。"),
    ("modelfit", "转换存在适用边界，仅在两种协议具备结构等价表示时成立。文本与视觉类大模型可无损耗互转；文本嵌入、图像生成、语音与视频，在 Anthropic 协议中没有对应表示，须使用 OpenAI 或原生端点。"),
    ("outro", "结论：同一网关并行承载两种协议，转换零可测损耗，接入零改造。保留现有 OpenAI 或 Anthropic SDK，仅替换 base 地址即可对接。完整分析见全文。"),
]

# --short：YouTube Shorts 专用 ~60s 强钩子精剪(hook → hero → compare → zeroloss → outro)
SHORT = "--short" in sys.argv
SHORT_SHOTS = [
    ("hook", "一个网关，两种协议并行接入——转换,到底有没有损耗？"),
    ("hero", "同一后端、同一把密钥，OpenAI 与 Anthropic 两种协议并行接入。网关在中间完成协议互转——这层转换是否引入可观测的延迟？实测八十次：首 token 中位延迟相差六点六毫秒，总时延相差百分之零点一。"),
    ("compare", "四项核心指标：首 token 与总时延的中位数、九五分位。两种协议数值高度一致，所有差异均小于百分之五，且小于样本自身的标准差。统计上，两协议无可测差异。"),
    ("zeroloss", "原因在量级：输出两百个 token 约二十一点五秒，其中九成九以上来自后端推理；协议转换在 wasm 层仅毫秒量级，无法在二十秒级的总时延中显现。"),
    ("outro", "结论：同一网关并行承载两种协议，转换零可测损耗，接入零改造。保留现有 SDK，仅替换 base 地址即可对接。"),
]
if SHORT:
    SHOTS = SHORT_SHOTS

# --en：English Shorts(hook → hero → compare → zeroloss → outro),英文配音
EN = "--en" in sys.argv
EN_SHOTS = [
    ("hooken", "One gateway, two protocols, side by side. Is there any conversion overhead?"),
    ("heroen", "Same backend, same key — OpenAI and Anthropic, both accepted in parallel. The gateway translates between the two protocols in the middle. Does that conversion add latency? Eighty runs: median time to first token differs by 6.6 milliseconds, total latency by 0.1 percent."),
    ("compareen", "Four core metrics — median and 95th percentile of first-token and total latency. The two protocols line up almost exactly. Every difference is under 5 percent, and smaller than the sample's own standard deviation. Statistically, no measurable difference."),
    ("zerolossen", "Why? Generating 200 tokens takes about 21 and a half seconds, and over 99 percent of that is backend inference. The protocol conversion runs in the wasm layer in milliseconds — it simply can't show up in a 20-second total."),
    ("outroen", "Bottom line: one gateway carries both protocols, with zero measurable overhead and zero client changes. Keep your existing OpenAI or Anthropic SDK, and just point the base URL at the gateway."),
]
if EN:
    VOICE = "en-US-AndrewNeural"
    RATE = "+0%"
    SHOTS = EN_SHOTS

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", " ".join(str(c) for c in cmd[:8]), "\n", r.stderr[-1600:]); sys.exit(1)
    return r

def dur(p):
    return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

def display(text):
    for a,b in [("K V","KV"),("SHA 1","SHA-1"),("prefix cache","prefix_cache"),("P 九五","P95"),
                ("百分之二十二","22%"),("百分之六十五","65%"),("百分之六十四","+64%"),
                ("百分之六十六到六十八","66–68%"),("百分之六十七","+67%"),
                ("百分之四十","40%"),("百分之二十七到二十九","27–29%")]:
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
    # edge-tts 走微软在线端点，网络偶发抖动会断连——重试直到拿到完整音频
    last=None
    for attempt in range(1, 9):
        comm = edge_tts.Communicate(text, VOICE, rate=RATE)
        sents=[]
        try:
            with open(mp3,"wb") as f:
                async for ch in comm.stream():
                    if ch["type"]=="audio": f.write(ch["data"])
                    elif ch["type"]=="SentenceBoundary":
                        sents.append((ch["offset"]/1e7, ch["duration"]/1e7, ch["text"]))
            if os.path.getsize(mp3) > 0:
                return sents
            raise RuntimeError("empty audio")
        except Exception as e:
            last=e
            print(f"   ⟳ TTS 第 {attempt} 次失败({type(e).__name__})，重试…")
            await asyncio.sleep(min(2*attempt, 10))
    raise last

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
        mp3=f"s{orient}{i}.mp3"; ass=f"s{orient}{i}.ass"; clip=f"c{orient}{i}.mp4"
        src=os.path.join(ANIM, f"{name}{suffix}.mp4")
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
    vo=os.path.join(WORK,f"_vo{orient}.mp4")
    run(["ffmpeg","-y",*inputs,"-filter_complex",fc,"-map",f"[{vlab}]","-map",f"[{alab}]",
         "-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","192k","-pix_fmt","yuv420p",vo])
    bgm=os.path.join(DIR,"bgm.wav")
    out=os.path.join(DIR, f"video-{'landscape' if land else 'portrait'}{'-short' if SHORT else ''}{'-en' if EN else ''}.mp4")
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
