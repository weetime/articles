#!/usr/bin/env python3
"""Clean-editorial leaderboard reveals (rows fade+rise in one-by-one), per category.
   -> SP/lb/{k}/%04d.png"""
import os
from PIL import Image, ImageDraw
import editorial as E

SP  = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
LB  = f"{SP}/lb"
FPS = E.FPS
DUR = 3.9
NFR = round(DUR*FPS)

# (section label, headline, [ (name, stars) ... top5 ], source)
CATS = [
 ("综合竞技场","看谁,最被引用",[("LMArena → Arena",5),("OpenLM Arena+",3),("Vellum",3),("Onyx",3),("BenchLM",3)],"榜首 · arena.ai · 真人盲测 Elo"),
 ("中文评测榜","中文场景,谁在顶端",[("SuperCLUE",5),("OpenCompass 司南",5),("FlagEval 天秤",3),("C-Eval",3),("CMMLU",3)],"榜首 · superclueai.com · 月度中文综合榜"),
 ("选型 · 定价","质量与价格,怎么权衡",[("Artificial Analysis",5),("LLM-Stats",4),("DemandSphere",3),("LMmarketcap",3),("Inference.net",3)],"榜首 · artificialanalysis.ai · 端到端实测"),
 ("垂直能力","具体任务,谁更能打",[("SWE-bench",5),("MTEB / C-MTEB",5),("BFCL",4),("tau-bench",4),("LiveBench",4)],"榜首 · swebench.com · 真实 issue 修复"),
 ("发布追踪","新模型,别错过",[("AI Release Tracker",4),("LLM-Stats Updates",4),("LMmarketcap",3)],"榜首 · aireleasetracker.com · 全模型时间线"),
 ("API 聚合 · 路由","统一入口,谁被用得最多",[("OpenRouter",5),("Groq",4),("Together AI",4),("Fireworks AI",4),("Replicate",3)],"榜首 · openrouter.ai · 真实用量榜"),
 ("模型仓库 · 本地","权重与数据,从哪来",[("Hugging Face",5),("ModelScope 魔搭",4),("Ollama",4)],"榜首 · huggingface.co · 200 万+ 模型"),
 ("部署 · 推理引擎","把模型,跑起来",[("recipes.mcpinfra.net",5),("vLLM",5),("SGLang",4),("TensorRT-LLM",4),("NVIDIA Dynamo",4)],"榜首 · recipes.mcpinfra.net · 可复制命令"),
 ("趋势 · 研究","往哪走,看数据",[("Epoch AI",5),("Stanford HAI Index",4),("a16z LLMflation",3)],"榜首 · epoch.ai · 增长趋势仪表盘"),
]

def ease(p): return 1-(1-p)**3

def render():
    os.system(f"rm -rf {LB}"); os.makedirs(LB, exist_ok=True)
    for ci,(label,headline,items,src) in enumerate(CATS):
        od=f"{LB}/{ci}"; os.makedirs(od, exist_ok=True)
        n=len(items); top=760; rowh=168
        for fr in range(NFR):
            t=fr/FPS
            im=Image.new("RGB",(E.W,E.H),E.BG); d=ImageDraw.Draw(im)
            E.header(d, label, ci+1)
            # accent tracked label + big headline (fade in)
            hp=ease(min(1,t/0.4))
            d.text((120,430), E.spaced(label), font=E.F(26), fill=E.ACC)
            d.text((120,486), headline, font=E.F(66, bold=True), fill=E.INK)
            # rows
            for i,(nm,s) in enumerate(items):
                st=0.55+i*0.30
                p=ease(max(0,min(1,(t-st)/0.36)))
                if p<=0: continue
                y=top+i*rowh; rise=int((1-p)*26)
                first=(i==0)
                layer=Image.new("RGBA",(E.W,rowh),(0,0,0,0)); ld=ImageDraw.Draw(layer)
                # rank
                rc=E.ACC if first else E.INK
                ld.text((120,20), f"{i+1:02d}", font=E.F(58 if first else 52, bold=first), fill=rc)
                # name
                nx=250
                ld.text((nx,26 if first else 30), nm, font=E.F(48 if first else 42, bold=first),
                        fill=E.ACC if first else E.INK)
                # 榜首 tag
                if first:
                    b=ld.textbbox((0,0),nm,font=E.F(48,bold=True)); tagx=nx+(b[2]-b[0])+22
                    ld.rounded_rectangle([tagx,34,tagx+84,80],radius=10,fill=E.ACC)
                    ld.text((tagx+14,42),"榜首",font=E.F(24),fill=(255,255,255,255))
                # stars right
                sw=5*(30+8)-8
                E.stars(ld, E.W-120-sw, 34, s, sz=30, gap=8)
                # hairline divider
                if i<n-1: ld.rectangle([120,rowh-2,E.W-120,rowh-1],fill=E.HAIR+(255,))
                al=layer.split()[3].point(lambda v:int(v*p)); layer.putalpha(al)
                im.paste(Image.alpha_composite(im.crop((0,y-rise,E.W,y-rise+rowh)).convert("RGBA"),layer).convert("RGB"),(0,y-rise))
            # footer source after rows
            fp=ease(max(0,min(1,(t-1.85)/0.4)))
            if fp>0.02:
                col=tuple(int(E.MUTE[j]*fp+E.BG[j]*(1-fp)) for j in range(3))
                d.text((120,E.H-150), src, font=E.F(23), fill=col)
            im.save(f"{od}/{fr:04d}.png")
        print("lb",ci,label,NFR)
    print("DONE",len(CATS),"x",NFR)

if __name__=="__main__":
    render()
