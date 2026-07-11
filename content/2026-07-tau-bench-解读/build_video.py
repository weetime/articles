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
    ("hero", "什么叫会说话、不等于会办事？看这个数：同一个任务，让 Agent 单独跑一次，成功率百分之八十六；但连着跑四次、要求次次都对，就只剩百分之六十七。tau bench 干的，就是把 Agent 到底能不能办成事，量出来。"),
    ("mechanism", "它怎么测？让一个大模型扮成客户，跟被测 Agent 多轮对话、一点点给信息；Agent 要理解需求、守住业务规则、再调用工具去改后端数据库。判分不看话说得漂不漂亮，只比对数据库的最终状态——有没有真办成。多轮对话、工具调用、守策略、按末态判分，四件事一次考完。"),
    ("evolution", "tau bench 一共三代，越测越像真实业务。第一代两个域：航空和零售。第二代加了电信，还引入双向控制——用户自己也能操作，Agent 得学会指挥用户，而不是自己一手包办。第三代再加银行知识域和语音，还有可发现工具：关键操作被藏起来，必须先解锁才能调用。"),
    ("passk", "最关键的指标叫 pass 的 k 次方：同一个任务做 k 次、次次都成功的比例。它衰减得很快——单次八成，四次全对就只剩六成八。单次高、pass k 低，说明模型会做，但不稳。放到公开榜上，连 GPT-4o 都不到五成，零售域连对八次、不到两成五。"),
    ("talkvsdo", "实测里最扎心的一点：会说话，真不等于会办事。自然语言这一层，核对身份、讲政策、报告已处理，几乎全过；可后端数据库那一层大面积挂。航空域一百零三个失败里，八十七个是嘴上说通了、数据库改错了；零售域一百一十个失败，全部通过了语言检查。只看沟通、只用大模型打分，会严重高估一个模型。"),
    ("cliff", "第三代最难的一关，是异形工具协议。同一个三十二 B 模型，零售、电信、航空的单次成功率还有五成上下，到银行域直接断崖，只剩百分之四点七。三重崩：凭空捏造隐藏工具名、没解锁就瞎调；调用格式传错，该给 JSON 字符串却塞了个字典；最后干脆把该自己执行的写操作，甩给用户去做。知识全懂，协议玩不转。"),
    ("outro", "所以这套数怎么用？一句话：判断一个 Agent 能不能上生产，看 pass 四次方，别看单次。四次方到七成以上，可以自主上线；三到七成，只能辅助、状态变更得人工复核；低于三成不建议；低于百分之五，完全不能用。阈值随业务风险再校准。先收藏备用，按需查阅。"),
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
