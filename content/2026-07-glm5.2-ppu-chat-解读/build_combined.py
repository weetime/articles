#!/usr/bin/env python3
# 组合片:动画场景(claim)↔ 真报告走查(proof)交替。男声 +26% + drive BGM。
import subprocess, os, asyncio
import edge_tts

DIR = os.path.dirname(os.path.abspath(__file__))
ANIM = os.path.join(DIR, "anim", "out")
RW2 = os.path.join(ANIM, "ReportWalk2.mp4")
BGM = os.path.join(DIR, "bgm.wav")
OUT = os.path.join(DIR, "video-combined-portrait.mp4")
VOICE = "zh-CN-YunyangNeural"; RATE = "+26%"; XF = 0.4; W, H = 1080, 1920

# (kind, param, narration) — kind: 'anim'=out/<param>.mp4 缩放贴合旁白; 'proof'=RW2 从 param 秒截取
SHOTS = [
 ('anim','Intro',   "国产八卡上,DeepSeek V4 Flash 到底能压出多少?默认参数很稳,但给定一个 SLO,还有没有优化空间——我用实测数据帮大家验一遍。"),
 ('anim','Setup',   "方法是控制变量,只动一个参数:并发上限,从三十二扫到一百二十八。"),
 ('anim','ChatWall',"先看短对话。并发上限往上抬,峰值吞吐一路涨到八百二十三,甜点在九十六,比默认高百分之四十五。"),
 ('proof', 34.0,    "看真实报告:再往上到一百二十八,K V cache 打满,吞吐只多百分之二,收益很低。"),
 ('anim','LowConc', "还有个坑:同样并发三十二,高并发的配置反而更慢,固定开销吃掉了。"),
 ('anim','Agent',   "换成 Agent 长输入,情况完全不同:首字延迟飙到一百零八秒,过载好几倍。"),
 ('proof', 53.5,    "报告里看得很清楚:瓶颈在 prefill 算力,单机怎么调都解决不了,得上 P D 分离。"),
 ('anim','HowRead', "所以分场景:高吞吐用九十六,延迟敏感用默认,Agent 走架构,给定 SLO 各有各的解。"),
 ('anim','Outro',   "完整报告、启动命令、全分位数据都在下面图文。想测什么模型或用例,评论区告诉我。"),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", " ".join(map(str, cmd[:6])), "\n", r.stderr[-1400:]); raise SystemExit(1)
    return r
def dur(p): return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())
async def tts(t, m):
    with open(m, "wb") as f:
        async for ch in edge_tts.Communicate(t, VOICE, rate=RATE).stream():
            if ch["type"] == "audio": f.write(ch["data"])

os.chdir(DIR)
clips = []
for i, (kind, param, txt) in enumerate(SHOTS, 1):
    mp3 = f"cb{i}.mp3"; asyncio.run(tts(txt, mp3)); nd = dur(mp3)
    T = nd + 0.5
    srcv = f"cbv{i}.mp4"  # 视觉源(无音),时长=T
    if kind == 'anim':
        s = os.path.join(ANIM, f"{param}.mp4"); sd = dur(s)
        # setpts 缩放到 T:动画在旁白结束时正好完成/停住
        run(["ffmpeg","-y","-i",s,"-an","-vf",
             f"setpts={T/sd:.4f}*PTS,scale={W}:{H},setsar=1,format=yuv420p",
             "-r","30","-t",f"{T:.2f}","-c:v","libx264","-preset","medium","-crf","20",srcv])
    else:
        run(["ffmpeg","-y","-ss",f"{param}","-t",f"{T:.2f}","-i",RW2,"-an",
             "-vf",f"scale={W}:{H},setsar=1,format=yuv420p","-r","30",
             "-c:v","libx264","-preset","medium","-crf","20",srcv])
    clip = f"cbc{i}.mp4"
    run(["ffmpeg","-y","-i",srcv,"-i",mp3,"-filter_complex",
         "[1:a]adelay=250|250,apad[a]","-map","0:v","-map","[a]","-r","30","-t",f"{T:.2f}",
         "-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","192k",
         "-pix_fmt","yuv420p","-fps_mode","cfr",clip])
    cd = dur(clip); clips.append((clip, cd))
    print(f"  {i} {str(param)[:9]:9s} narr {nd:5.2f}s  clip {cd:5.2f}s  ({kind})")

# xfade + acrossfade 拼接
inputs = []
for c, _ in clips: inputs += ["-i", c]
vp, ap, off, vl, al = [], [], 0.0, "0:v", "0:a"
for i in range(1, len(clips)):
    off += clips[i-1][1] - XF
    vp.append(f"[{vl}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[v{i}]")
    ap.append(f"[{al}][{i}:a]acrossfade=d={XF}[a{i}]")
    vl, al = f"v{i}", f"a{i}"
vo = os.path.join(DIR, "_vocb.mp4")
run(["ffmpeg","-y",*inputs,"-filter_complex",";".join(vp+ap),"-map",f"[{vl}]","-map",f"[{al}]",
     "-c:v","libx264","-preset","medium","-crf","20","-c:a","aac","-b:a","192k","-pix_fmt","yuv420p",vo])
# BGM 侧链(复用输入 pad [0:a] 合法)
run(["ffmpeg","-y","-i",vo,"-i",BGM,"-filter_complex",
     "[1:a]volume=0.22[bg];[bg][0:a]sidechaincompress=threshold=0.03:ratio=9:attack=12:release=320[bgd];"
     "[0:a][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]",
     "-map","0:v","-map","[a]","-shortest","-c:v","copy","-c:a","aac","-b:a","192k",OUT])
print(f"DONE -> {OUT}  {dur(OUT):.1f}s")
