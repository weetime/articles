#!/usr/bin/env python3
"""Generate 8 timed narration segments (edge-tts) for the site tour.
   Each seg anchors to a site window at k*VIEW seconds in the final cut."""
import asyncio, subprocess, edge_tts

VIEW = 6.6
VOICE = "zh-CN-YunyangNeural"
RATE = "+15%"
PROXY = "http://127.0.0.1:7897"

SEGS = [
    "综合竞技场,arena,原 LMArena,基于真人盲测投票的偏好排行。",
    "中文场景,SuperCLUE,国内影响力最大的中文通用综合榜,月度更新。",
    "选型定价,LLM-Stats,将基准分与每 token 价格,合成一个综合分。",
    "Artificial Analysis,端到端实测,真实发起请求,测量速度、价格与延迟。",
    "垂直能力,SWE-bench,以真实代码问题为题的编码修复基准,认准 Verified 子榜。",
    "获取模型,OpenRouter,统一接口聚合多家模型,并提供真实用量排行。",
    "落地部署,recipes.mcpinfra,按模型和显卡给出可复制的启动命令,兼容 vLLM 与 SGLang。",
]

async def one(i, txt):
    for _ in range(4):
        try:
            c = edge_tts.Communicate(txt, VOICE, rate=RATE, proxy=PROXY)
            await c.save(f"seg{i}.mp3"); return
        except Exception as e:
            print("retry", i, str(e)[:60]); await asyncio.sleep(2)
    raise RuntimeError(f"seg{i} failed")

INTRO_TXT = "大模型工具站又多又杂?一张全景图,帮你理清常用站点。"

async def one_named(name, txt):
    for _ in range(4):
        try:
            c = edge_tts.Communicate(txt, VOICE, rate=RATE, proxy=PROXY)
            await c.save(f"{name}.mp3"); return
        except Exception as e:
            print("retry", name, str(e)[:60]); await asyncio.sleep(2)
    raise RuntimeError(f"{name} failed")

async def main():
    await one_named("intro", INTRO_TXT)
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
