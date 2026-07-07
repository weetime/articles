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
RATE = "+26%"
XF = 0.4
SUBS = "--subs" in sys.argv   # 默认不烧字幕(画面自带文案,避免被视频号/抖音 UI 遮挡);要字幕加 --subs

SHOTS = [
    ("hook", "国产卡上部署的 DeepSeek V4 Flash，到底能不能胜任日常工作？咱们用 τ 二 bench 来测一测。"),
    ("setup", "怎么测？让它当客服 agent，面对模拟真人的多轮提问，自己去调用工具、查数据库、把事办成，一共跑了 656 次。"),
    ("verdict", "结果出来了 —— 能胜任！订单查询、机票改签、下单购买、售后退换，这些标准工单它都能拿下，单次成功率百分之八十五。"),
    ("compare", "到底有多好？放进参照系看：两个场景都明显高于上一代 DeepSeek V3.2，也稳稳站在公开榜典型区间之上。"),
    ("flaky", "但是，稳定性不足。同一个任务让它多跑几次，结果不一定都让你满意。比如同一个改签，连跑四次，三次成功、一次翻车。"),
    ("scissors", "为什么？看这张图：只要有一次成功，能到百分之九十二；可要求四次全成功，就掉到百分之六十七。中间这道缝，就是有能力、但不稳定。"),
    ("grid", "放大看每个任务：左边一直绿的、每次都过，右边一直红的、每次都挂，中间这条红绿相间的带，就是不稳定的那批。"),
    ("vspro", "那 Flash 是阉割版吗？当然不是。官方基准上，它和旗舰 Pro 几乎打平 —— 国产卡跑的，是接近旗舰的强模型。"),
    ("outro", "结论：国产 P P U 已经能跑强大的 agent 模型，能力达标，稳定性还需打磨。关注我们，下载完整报告。"),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", " ".join(str(c) for c in cmd[:8]), "\n", r.stderr[-1600:]); sys.exit(1)
    return r

def dur(p):
    return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

def display(text):
    # 把 TTS 口语拼写 → 专业字幕形式(顺序敏感:长串先替换)
    for a,b in [
        ("τ 二 bench","τ²-bench"),
        ("τ二 bench","τ²-bench"),
        ("二 bench","τ²-bench"),
        ("DeepSeek V4 Flash","DeepSeek-V4-Flash"),
        ("DeepSeek V3.2","DeepSeek-V3.2"),
        ("V4 Pro","V4-Pro"),
        ("Pass at k","Pass@k"),
        ("Pass k","Pass^k"),
        ("百分之九十二","92%"),
        ("百分之八十五","85%"),
        ("百分之六十七","67%"),
        ("八成三到八成八","83–88%"),
        ("八十一点五","81.5%"),
        ("八十五点七","85.7%"),
        ("九成二","92%"),
        ("八成五","85%"),
        ("六成七","67%"),
        ("二十五个点","25pp"),
        ("P P U","PPU"),
        ("user simulator","user simulator"),
    ]:
        text=text.replace(a,b)
    return text

def chunk_sentence(text, maxlen):
    # 先按标点断成短句
    parts=re.split(r"([，。？！、；：])", text)
    clauses=[]
    for i in range(0,len(parts),2):
        seg=parts[i]+(parts[i+1] if i+1<len(parts) else "")
        if seg.strip(): clauses.append(seg)
    # token 化:连续拉丁/数字/记号(含 τ²-bench 85.7% Pass@k Pass^k)整体不可拆;CJK 单字;空格独立
    tok_re=re.compile(r'[A-Za-z0-9@\^%．.\-–—τ²³·+]+|[一-鿿]|[，。？！、；：]| +')
    chunks=[]
    for cl in clauses:
        toks=tok_re.findall(cl)
        cur=""
        for t in toks:
            if len((cur+t).strip())<=maxlen or not cur.strip():
                cur+=t
            else:
                chunks.append(cur); cur=t
        if cur.strip(): chunks.append(cur)
    P="，。？！、；：,.?!;:： 　"
    return [c.strip(P).strip() for c in chunks if c.strip(P).strip()]

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
    marginv = 60 if land else 470   # 抬高字幕(若开启)避开视频号/抖音底部 UI
    maxlen = 22 if land else 15
    os.chdir(WORK)
    clips=[]
    for i,(name,text) in enumerate(SHOTS,1):
        mp3=f"s{orient}{i}.mp3"; ass=f"s{orient}{i}.ass"; clip=f"c{orient}{i}.mp4"
        src=os.path.join(ANIM, f"{name}{suffix}.mp4")
        sents=asyncio.run(tts(text,mp3))
        if SUBS: build_ass(sents,ass,W,H,fontsize,marginv,maxlen)
        nd=dur(mp3); ad=dur(src)
        tail = 1.6 if i==len(SHOTS) else 0.4   # 最后一幕多留尾:说完让 QR 停留、不硬切
        target=max(ad, nd+tail); pad=max(0.0,target-ad)
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
    D=dur(vo); fs=max(0.0, D-0.8)   # 结尾 0.8s 音画淡出
    run(["ffmpeg","-y","-i",vo,"-i",bgm,"-filter_complex",
         f"[0:v]fade=t=out:st={fs:.2f}:d=0.8[v];"
         "[1:a]volume=0.22[bg];[bg][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[bgd];"
         f"[0:a][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95,afade=t=out:st={fs:.2f}:d=0.8[a]",
         "-map","[v]","-map","[a]","-shortest","-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","192k","-pix_fmt","yuv420p",out])
    print(f"DONE -> {out}  {round(dur(out),1)}s")

# 默认只出竖屏 9:16（视频号/抖音）；要横屏 16:9 时显式加 --land
orients = ["port"] + (["land"] if "--land" in sys.argv else [])
for o in orients:
    print(f"=== building {o} ===")
    build(o)
