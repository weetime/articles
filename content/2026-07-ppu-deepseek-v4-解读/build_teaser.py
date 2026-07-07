#!/usr/bin/env python3
# 引流片组装:ReportWalk.mp4(走查真实报告)+ 4 段旁白(按批注时点落位)+ drive BGM。
import subprocess, os, asyncio
import edge_tts

DIR = os.path.dirname(os.path.abspath(__file__))
VOICE = "zh-CN-YunyangNeural"; RATE = "+16%"
VID = os.path.join(DIR, "anim", "out", "ReportWalk.mp4")
BGM = os.path.join(DIR, "bgm.wav")
OUT = os.path.join(DIR, "video-teaser-portrait.mp4")

# (旁白, 落位秒) —— 秒数对齐 ReportWalk 的 NOTES in-帧 /30
BEATS = [
    ("先看一份实测报告:八张国产卡跑 DeepSeek,只调一个并发参数——默认到底够不够?", 0.4),
    ("并发上限往上抬,吞吐冲到八百二十三,再往上就撞显存墙,甜点在九十六。", 8.6),
    ("可一换成智能体长输入,首字延迟飙到一百零八秒,过载好几倍,单机救不了。", 16.0),
    ("怎么调、怎么读、卡在哪——完整实测解读,都在下面图文。", 23.2),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL:", " ".join(str(c) for c in cmd[:6]), "\n", r.stderr[-1400:]); raise SystemExit(1)
    return r

def dur(p):
    return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())

async def tts(text, mp3):
    with open(mp3, "wb") as f:
        async for ch in edge_tts.Communicate(text, VOICE, rate=RATE).stream():
            if ch["type"] == "audio": f.write(ch["data"])

# 1) 合成 4 段旁白
os.chdir(DIR)
mp3s = []
for i, (txt, off) in enumerate(BEATS, 1):
    m = f"tb{i}.mp3"; asyncio.run(tts(txt, m)); d = dur(m)
    print(f"  beat {i}  @{off:>5.1f}s  narr {d:.2f}s  {'OK' if off+d < (BEATS[i][1] if i < len(BEATS) else 28) else '⚠超窗'}")
    mp3s.append((m, off))

VD = dur(VID)  # 视频总长(≈28s)
# 2) 旁白各自 adelay 落位 → amix 成人声轨;3) BGM 侧链闪避;4) 混音贴回视频
inputs = ["-i", VID]
for m, _ in mp3s: inputs += ["-i", m]
inputs += ["-i", BGM]
n = len(mp3s)
fc = []
for i, (m, off) in enumerate(mp3s):
    ms = int(off * 1000)
    fc.append(f"[{i+1}:a]adelay={ms}|{ms}[v{i}]")
fc.append("".join(f"[v{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,volume=2.4[voice]")
fc.append("[voice]asplit=2[vsc][vfin]")
bgm_idx = n + 1
fc.append(f"[{bgm_idx}:a]volume=0.20[bg]")
fc.append("[bg][vsc]sidechaincompress=threshold=0.02:ratio=12:attack=10:release=320[bgd]")
fc.append("[vfin][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]")
run(["ffmpeg","-y",*inputs,"-filter_complex",";".join(fc),
     "-map","0:v","-map","[a]","-t",f"{VD:.2f}",
     "-c:v","copy","-c:a","aac","-b:a","192k","-shortest",OUT])
print(f"DONE -> {OUT}  {dur(OUT):.1f}s")
