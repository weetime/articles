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
RATE = "+18%"   # 语速加快,单位时间塞更多内容
XF = 0.5
SUBS = "--subs" in sys.argv   # 默认不烧字幕(画面自带文案,避免被视频号/抖音 UI 遮挡);要字幕加 --subs

# 中立视角:陈述目的/方法/结果/边界,不推广、无品牌。scene 名与 anim/src Composition 一致。
SHOTS = [
    ("Intro", "先看一份实测报告。一台八卡的国产加速卡，跑 DeepSeek V4 Flash，推理引擎是 SGLang。问题很朴素：厂商给的默认参数，是不是已经用满了？下面不站任何立场，只讲怎么做的、测到了什么、这些数字该怎么读。"),
    ("Setup", "方法是控制变量。硬件、模型、显存比例、张量并行全部固定，只动一个参数——同时在跑的请求数上限，从三十二一路放开到一百二十八。两类负载各测一遍：一类是普通短对话，一类是真实的智能体工具调用轨迹，特点是输入很长。"),
    ("ChatWall", "先看短对话。把并发上限往上抬，每秒输出的 token 一路涨：五百六十八、六百一十九、七百二十、八百二十三。但柱子下面的显存占用也在跟着涨。并发九十六是个甜点，比默认高百分之四十五，显存还留两成余量；再往上到一百二十八，显存打满百分之百，吞吐却只多百分之二。吞吐的尽头是显存，不是算力。"),
    ("LowConc", "但有个反直觉的细节：高并发的参数，在低负载时反而更慢。同样是并发三十二，吞吐从五百六十八掉到三百四十。批处理的固定开销就在那儿，请求少的时候特别吃亏。所以没有一套参数全场都占优，得按你线上真实的并发来选。"),
    ("Agent", "换成智能体负载，画风突变。同一台机器，首字延迟从零点几秒，飙到六十五秒、甚至一百零八秒；每秒只能处理不到两个请求，而轨迹本身要求接近四个，过载两到七倍。原因在负载形状：输入长、预填充重，输出却很短，瓶颈卡在算力。这种情况，单机怎么调参都救不了，得靠拆分预填充和解码、再加多机。"),
    ("Context", "顺带说上下文。这个模型官方支持一百万 token，可部署却锁在八千。把上限提到六万四，并不额外吃显存，只是放行更长的请求——而原来八千的设置，会直接拒掉真实智能体里两成四的请求。卡住它的是这台机器的显存，不是模型能力。"),
    ("HowRead", "所以，读这类压测报告，盯住四件事。第一，看峰值，也要看低并发。第二，吞吐的尽头是显存墙。第三，分清两类负载：短对话吃并发，长输入吃算力。第四，一次实验不是普适结论，换模型、换数据、换硬件，甜点都会移动。"),
    ("Outro", "一句话：默认参数，值得测一测；更重要的是，学会判断你的部署，到底卡在了哪里。数据来自一次具体环境的实测，换个环境，结论可能就变。"),
]

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
    comm = edge_tts.Communicate(text, VOICE, rate=RATE)
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
    out=os.path.join(DIR, f"video-{'landscape' if land else 'portrait'}.mp4")
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
