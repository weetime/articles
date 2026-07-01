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
REUSE = "--reuse-tts" in sys.argv   # 复用已缓存 mp3(>2000B 则跳过 TTS)
EDGE_PROXY = os.environ.get("EDGE_TTS_PROXY")   # 本机 edge-tts 需走代理(见 memory video-edge-tts-proxy)

SHOTS = [
    ("hero", "Higress 推理服务上多集群，第一个问题是技术选型。同一套网关能力，按场景能落成四种部署；怎么选，只看两根轴：主集群要不要自己承担算力，以及路由策略放在入口、还是下沉到子集群。下面从最简单的场景开始，逐一讲清取舍。"),
    ("fullstack", "起点是单集群：单地域、规模不大时用它。一套 Higress 同时做治理和 serving。客户端双协议进来，先过治理插件链：协议转换、认证、鉴权、配额、限流、计费；ai-route 选到本地 ai-provider，经 ai-LB 加 EPP 打分选 pod；后端按模型大小三选一，再叠加 PD 分离和分层缓存。它是所有方案的地基，但没有跨集群容灾。当可用性和规模要求上来，就得走多集群。"),
    ("split", "多集群的标准做法，是管控算力分离，也是推荐项。主集群退化成纯路由、不承担算力，主备双活永远在线，配置和运行态靠 CR 加共享 Redis 同步；子集群才跑模型。因为主集群不 serving，所以没有回环、也不需要破环。那么跨集群具体怎么分？这就由上游池的 DestinationRule 决定。"),
    ("cluster", "最基础的是加权轮询：ServiceEntry 定义权重，按三比七固定比例分到两个子集群。适合按固定比例分流,这是基线。"),
    ("swap", "但固定比例不总是最优。覆盖 DestinationRule 就能换策略：最少请求，发往在途更少的子集群，适合负载不均；会话亲和，同一会话粘同集群、复用 K V 缓存，适合多轮对话；熔断，超并发即刻拒绝，实现过载保护。选哪种，取决于你的流量形态。"),
    ("failover", "无论用哪种策略，故障转移都由 DestinationRule 的 outlier 兜底：子集群连续探测失败就自动摘除，流量归并到健康集群，恢复后先探活、再回填权重。权重和故障转移分属两个对象，可以叠加。"),
    ("unified", "如果集群数少、算力紧张，可以让主集群也参与 serving，这就是管控算力一体。上游池端点包含主集群自身，请求会回环；破环靠改 model 名，让回环腿只命中本地别名。换来复用主集群算力，代价是破环与双重治理的复杂度。"),
    ("decentral", "如果要跨地域就近、并且全量容灾，就用去中心：每个集群都部署全量模型和全套 Higress，F5 直连就近，策略下沉各集群自治。换来最低延迟、任一集群独立可用；代价是全量复制，存储和一致性成本最高。"),
    ("mechanism", "这套跨集群路由到底怎么工作？看一个请求依次经过三个 CR。客户端发 Qwen-demo 进来：先命中 Ingress，model-mapper 把它改成本地名 Qwen-test，完成破环；再进 ServiceEntry 加权池，按权重选中一个子集群网关；最后 DestinationRule 应用负载均衡、并由 outlier 判活。三个对象各司其职，一次请求依次经过。"),
    ("impl", "而这一切都是全声明式的：就这三个 CR，零 EnvoyFilter，装好 Istio CRD 再重启 controller 即可。实测：正常三比七，子集群故障时自动归并到百比零，恢复后回填，全程无路由环路。"),
    ("outro", "回到选型：单地域起步用单集群；多集群常态用管控算力分离；算力紧张复用主集群用一体；跨地域全量容灾用去中心。方案内的路由策略,随流量形态换一个 DestinationRule 即可。完整方案与配置，关注查看。"),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", " ".join(str(c) for c in cmd[:8]), "\n", r.stderr[-1600:]); sys.exit(1)
    return r

def dur(p):
    return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

def display(text):
    for a,b in [("L L M","LLM"),("K V","KV"),("三比七","3:7"),("F5","F5")]:
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

async def tts(text, mp3, tries=8):
    last=""
    for k in range(tries):
        comm = edge_tts.Communicate(text, VOICE, rate=RATE, proxy=EDGE_PROXY)
        sents=[]
        try:
            with open(mp3,"wb") as f:
                async for ch in comm.stream():
                    if ch["type"]=="audio": f.write(ch["data"])
                    elif ch["type"]=="SentenceBoundary":
                        sents.append((ch["offset"]/1e7, ch["duration"]/1e7, ch["text"]))
        except Exception as e:
            last=str(e)
        if os.path.exists(mp3) and os.path.getsize(mp3)>2000:
            return sents
        await asyncio.sleep(1.5)
    raise SystemExit(f"TTS 反复失败 {mp3}: {last[:200]}")

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
        if REUSE and os.path.exists(mp3) and os.path.getsize(mp3)>2000:
            sents=[]
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
    vo=os.path.join(WORK,f"_vo{orient}.mp4")
    run(["ffmpeg","-y",*inputs,"-filter_complex",fc,"-map",f"[{vlab}]","-map",f"[{alab}]",
         "-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","192k","-pix_fmt","yuv420p",vo])
    bgm=os.path.join(DIR,"bgm.wav")
    out=os.path.join(DIR, f"video-{'landscape' if land else 'portrait'}.mp4")
    run(["ffmpeg","-y","-i",vo,"-stream_loop","-1","-i",bgm,"-filter_complex",
         "[1:a]volume=0.22[bg];[bg][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[bgd];"
         "[0:a][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]",
         "-map","0:v","-map","[a]","-shortest","-c:v","copy","-c:a","aac","-b:a","192k",out])
    print(f"DONE -> {out}  {round(dur(out),1)}s")

# 默认只出竖屏 9:16（视频号/抖音）；要横屏 16:9 时显式加 --land
if __name__ == "__main__":
    orients = ["port"] + (["land"] if "--land" in sys.argv else [])
    for o in orients:
        print(f"=== building {o} ===")
        build(o)
