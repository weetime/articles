#!/usr/bin/env python3
"""Generate 8 timed narration segments (edge-tts) for the site tour.
   Each seg anchors to a site window at k*VIEW seconds in the final cut."""
import asyncio, subprocess, edge_tts

VIEW = 6.6
VOICE = "zh-CN-YunyangNeural"
RATE = "+15%"
PROXY = "http://127.0.0.1:7897"

SEGS = [
    "第一,综合竞技场。榜首是 arena,原 LMArena,基于真人盲测投票的偏好排行。",
    "第二,中文评测榜。榜首 SuperCLUE,国内影响力最大的中文通用综合榜。",
    "第三,选型定价。榜首 Artificial Analysis,端到端实测速度、价格与延迟。",
    "第四,垂直能力。榜首 SWE-bench,以真实代码问题为题的编码修复基准。",
    "第五,发布追踪。榜首 AI Release Tracker,收录全部前沿模型的发布时间线。",
    "第六,API 聚合。榜首 OpenRouter,统一接口,并提供真实用量排行。",
    "第七,模型仓库。榜首 Hugging Face,两百多万模型的社区基础设施。",
    "第八,部署引擎。榜首是 vLLM 官方配方站,按模型和显卡,给可复制的部署命令。",
    "第九,趋势研究。榜首 Epoch AI,前沿增长趋势的数据仪表盘。",
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
