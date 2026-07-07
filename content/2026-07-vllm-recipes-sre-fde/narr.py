import asyncio, edge_tts
TXT=("打开 recipes 站,一百多个开源大模型的部署配方全在这。随便点开一个,比如 DeepSeek V3.2,"
"它直接给你一条能跑的 serve 命令,并行、K V、parser 全带齐。换一块卡,命令实时重算;"
"换量化权重,显存直接减半;换到 AMD,安装自动切到 ROCm,权重还会智能回落。"
"并行策略、多机部署,点一下就展开成主节点加工作节点。vLLM 还是 SGLang,同一个模型双引擎随便切;"
"开好特性,复制粘贴就能跑。还提供 JSON API,直接喂给你的 Agent。"
"回到总览,一键展开筛选:任务、架构、规模、精度、硬件,从英伟达到昇腾、海光、寒武纪,国产卡全覆盖。"
"最后打开镜像选择器,GPUStack 把国产卡适配好的引擎镜像,一条 docker pull 拉下来,直接开跑。")
async def main():
    c=edge_tts.Communicate(TXT,"zh-CN-YunyangNeural",rate="+2%")
    await c.save("narr.mp3")
asyncio.run(main())
print("narr ok")
