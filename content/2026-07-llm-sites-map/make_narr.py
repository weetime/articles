#!/usr/bin/env python3
"""Generate 8 timed narration segments (edge-tts) for the site tour.
   Each seg anchors to a site window at k*VIEW seconds in the final cut."""
import asyncio, subprocess, edge_tts

VIEW = 6.2
VOICE = "zh-CN-YunyangNeural"
RATE = "+8%"
PROXY = "http://127.0.0.1:7897"

SEGS = [
    "谁最强?先看真人怎么投。arena,原来的 LMArena,真人盲测。",
    "中文场景看 SuperCLUE,国产模型的梯队,一眼就清楚。",
    "该上哪个、多少钱?LLM-Stats 把质量和价格,拉成一个综合分。",
    "Artificial Analysis 更狠,真发请求,实测速度、价格和延迟。",
    "我这活它到底行不行?编码就看 SWE-bench,真实的代码修复。",
    "谁真被用得最多?OpenRouter 的真实用量榜,最诚实。",
    "选好了就落地。recipes 按模型和显卡,直接给你能跑的命令。",
    "到我的主场,双引擎把模型,从能跑,做到敢上线。",
]

async def one(i, txt):
    for _ in range(4):
        try:
            c = edge_tts.Communicate(txt, VOICE, rate=RATE, proxy=PROXY)
            await c.save(f"seg{i}.mp3"); return
        except Exception as e:
            print("retry", i, str(e)[:60]); await asyncio.sleep(2)
    raise RuntimeError(f"seg{i} failed")

async def main():
    for i, t in enumerate(SEGS):
        await one(i, t)

asyncio.run(main())

def dur(p):
    return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                                 "-of","default=nk=1:nw=1",p], capture_output=True, text=True).stdout.strip())
for i, t in enumerate(SEGS):
    at = i*VIEW; d = dur(f"seg{i}.mp3")
    flag = "  <-- OVER" if d > VIEW-0.2 else ""
    print(f"seg{i} @{at:5.1f}s  dur {d:4.2f}  end {at+d:5.1f}{flag}")
