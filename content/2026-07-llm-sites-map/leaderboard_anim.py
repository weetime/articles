#!/usr/bin/env python3
"""Clean-editorial category CARDS (资料梳理,非排名): site names + 定位 fade in
   one-by-one, no ranks/stars/榜首. -> SP/lb/{k}/%04d.png"""
import os
from PIL import Image, ImageDraw
import editorial as E

SP  = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
LB  = f"{SP}/lb"
FPS = E.FPS
DUR = 3.9
NFR = round(DUR*FPS)

# (section, purpose headline, [ (name, 定位) ... ], footer note)
CATS = [
 ("综合竞技场","看模型综合能力",[("LMArena → Arena","真人盲测 Elo"),("OpenLM Arena+","Elo × 硬基准"),("Vellum","基准聚合"),("Onyx","开/闭源对比"),("LLMReference","基准数据库")],"本类常用站点 · 打开看看"),
 ("中文评测","中文场景对标",[("SuperCLUE","中文月度综合"),("OpenCompass 司南","学术全维度"),("FlagEval 天秤","智源多模态"),("C-Eval","52 学科"),("CMMLU","本土 67 学科")],"本类常用站点 · 打开看看"),
 ("选型 · 定价","质量 × 速度 × 价格",[("Artificial Analysis","端到端实测"),("LLM-Stats","综合分 + 价格"),("DemandSphere","宏观追踪"),("LMmarketcap","综合分"),("Inference.net","价格横评")],"本类常用站点 · 打开看看"),
 ("垂直能力","按任务看专项",[("SWE-bench","编码修复"),("MTEB / C-MTEB","向量 / RAG"),("BFCL","工具调用"),("tau-bench","任务型 Agent"),("LiveBench","抗污染动态")],"本类常用站点 · 打开看看"),
 ("发布追踪","跟住新模型发布",[("AI Release Tracker","发布时间线"),("LLM-Stats Updates","每小时更新"),("LMmarketcap","周报订阅")],"本类常用站点 · 打开看看"),
 ("API 聚合 · 路由","统一接入与比价",[("OpenRouter","统一入口 + 用量"),("Groq","LPU 低延迟"),("Together AI","开源托管"),("Fireworks AI","高性能推理"),("Replicate","一行代码调")],"本类常用站点 · 打开看看"),
 ("模型仓库 · 本地","拿权重 / 本地跑",[("Hugging Face","200 万+ 模型"),("ModelScope 魔搭","国内社区"),("Ollama","本地运行")],"本类常用站点 · 打开看看"),
 ("部署 · 推理引擎","在自己的卡上 serve",[("recipes.vllm.ai","官方配方"),("recipes.mcpinfra.net","配方站"),("vLLM","高吞吐引擎"),("SGLang","RadixAttention"),("TensorRT-LLM","NVIDIA 优化")],"本类常用站点 · 打开看看"),
 ("趋势 · 研究","宏观视角看数据",[("Epoch AI","增长趋势"),("Stanford HAI Index","年度报告"),("a16z LLMflation","成本论述")],"本类常用站点 · 打开看看"),
]

def ease(p): return 1-(1-p)**3

def render():
    os.system(f"rm -rf {LB}"); os.makedirs(LB, exist_ok=True)
    for ci,(label,headline,items,note) in enumerate(CATS):
        od=f"{LB}/{ci}"; os.makedirs(od, exist_ok=True)
        n=len(items); top=740; rowh=158
        for fr in range(NFR):
            t=fr/FPS
            im=Image.new("RGB",(E.W,E.H),E.BG); d=ImageDraw.Draw(im)
            E.header(d, label, ci+1)
            d.text((120,430), E.spaced(label), font=E.F(26), fill=E.ACC)
            d.text((120,486), headline, font=E.F(66, bold=True), fill=E.INK)
            for i,(nm,dfn) in enumerate(items):
                st=0.55+i*0.28
                p=ease(max(0,min(1,(t-st)/0.36)))
                if p<=0: continue
                y=top+i*rowh; rise=int((1-p)*24)
                layer=Image.new("RGBA",(E.W,rowh),(0,0,0,0)); ld=ImageDraw.Draw(layer)
                # accent tick + name (left), 定位 (right, gray)
                ld.rectangle([120,30,126,86],fill=E.ACC+(255,))
                ld.text((150,26), nm, font=E.F(46, bold=True), fill=E.INK+(255,))
                b=ld.textbbox((0,0),dfn,font=E.F(32)); ld.text((E.W-120-(b[2]-b[0]),38), dfn, font=E.F(32), fill=E.INK2+(255,))
                if i<n-1: ld.rectangle([120,rowh-2,E.W-120,rowh-1],fill=E.HAIR+(255,))
                al=layer.split()[3].point(lambda v:int(v*p)); layer.putalpha(al)
                im.paste(Image.alpha_composite(im.crop((0,y-rise,E.W,y-rise+rowh)).convert("RGBA"),layer).convert("RGB"),(0,y-rise))
            fp=ease(max(0,min(1,(t-1.8)/0.4)))
            if fp>0.02:
                col=tuple(int(E.MUTE[j]*fp+E.BG[j]*(1-fp)) for j in range(3))
                d.text((120,E.H-150), note, font=E.F(23), fill=col)
            im.save(f"{od}/{fr:04d}.png")
        print("card",ci,label,NFR)
    print("DONE",len(CATS),"x",NFR)

if __name__=="__main__":
    render()
