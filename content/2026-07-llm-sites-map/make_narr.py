#!/usr/bin/env python3
"""Generate 8 timed narration segments (edge-tts) for the site tour.
   Each seg anchors to a site window at k*VIEW seconds in the final cut."""
import asyncio, subprocess, edge_tts

VIEW = 6.6
VOICE = "zh-CN-YunyangNeural"
RATE = "+15%"
PROXY = "http://127.0.0.1:7897"

SEGS = [
    "综合竞技场,看模型整体能力。以 arena 为例,基于真人盲测的偏好对比。",
    "中文场景对标,以 SuperCLUE 为例,月度更新的中文通用综合评测。",
    "选型定价,看质量、速度与价格。以 Artificial Analysis 为例,端到端实测。",
    "垂直能力,按任务看专项。以 SWE-bench 为例,真实代码问题的编码修复。",
    "发布追踪,跟住新模型。以 AI Release Tracker 为例,前沿模型的发布时间线。",
    "接入模型,统一入口与比价。以 OpenRouter 为例,统一接口并提供真实用量。",
    "模型仓库,拿权重、本地跑。以 Hugging Face 为例,两百多万模型的社区。",
    "部署环节,在自己的卡上跑。以 vLLM 官方配方为例,给可复制的部署命令。",
    "宏观趋势,以 Epoch AI 为例,前沿增长趋势的数据仪表盘。",
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
