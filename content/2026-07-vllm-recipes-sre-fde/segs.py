import asyncio, edge_tts, subprocess
# (final_video_time_sec, text) — aligned to each callout/mouse beat
SEGS=[
 (9.0,  "打开 recipes 站,上百个大模型的部署配方全在这。"),
 (17.4, "点开一个模型,直接给你一条能跑的 serve 命令,并行、K V、parser 全带齐。"),
 (24.0, "换硬件换量化,命令和显存实时重算,换到 AMD 自动切 ROCm。"),
 (32.7, "选并行策略,多机部署一键展开主节点加工作节点。"),
 (38.9, "vLLM、SGLang 双引擎随便切,开好特性,复制粘贴就能跑。"),
 (47.9, "还提供 JSON API,直接喂给你的 Agent。"),
 (52.2, "展开筛选,从英伟达到昇腾、海光、寒武纪,国产卡全覆盖。"),
 (61.3, "最后镜像选择器,一条 docker pull,直接开跑。"),
]
async def one(i,txt):
    c=edge_tts.Communicate(txt,"zh-CN-YunyangNeural",rate="+18%"); await c.save(f"seg{i}.mp3")
async def main():
    for i,(t,txt) in enumerate(SEGS): 
        for _ in range(3):
            try: await one(i,txt); break
            except Exception as e: await asyncio.sleep(2)
asyncio.run(main())
def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p],capture_output=True,text=True).stdout.strip())
for i,(t,txt) in enumerate(SEGS):
    d=dur(f"seg{i}.mp3"); print(f"seg{i} @{t}s dur {d:.2f} end {t+d:.1f}")
