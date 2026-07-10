#!/usr/bin/env python3
"""Demo frames in clean-editorial chrome: header(brand+page+hairline) + accent
   section label + full-width live footage + 出处 footer. Trims each site to a
   settled window. -> SP/oframes (per-site counts in sites.json)."""
import json, os, subprocess
from PIL import Image, ImageDraw
import editorial as E

SP   = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
RAW  = None
FPS  = E.FPS
VIEW = 4.6                      # demo seconds per site
CW, CH = 1080, 1440             # screencast size
TOPY = 300                      # footage top (editorial header band above)
OUTF = f"{SP}/oframes"

# per site (recording order = category order): (section, source line)
DEMO = [
    ("综合竞技场",     "站点 · arena.ai · 真人盲测 Elo"),
    ("中文评测",     "站点 · superclueai.com · 月度中文综合评测"),
    ("选型 · 定价",    "站点 · artificialanalysis.ai · 端到端实测"),
    ("垂直能力",       "站点 · swebench.com · 真实 issue 修复"),
    ("发布追踪",       "站点 · aireleasetracker.com · 全模型时间线"),
    ("API 聚合 · 路由","站点 · openrouter.ai · 真实用量榜"),
    ("模型仓库 · 本地","站点 · huggingface.co · 200 万+ 模型"),
    ("部署 · 推理引擎","站点 · recipes.vllm.ai · 官方部署配方"),
    ("趋势 · 研究",    "站点 · epoch.ai · 增长趋势仪表盘"),
]

ARR = [(0,0),(0,17),(4.4,13.2),(7.6,20),(10.2,19),(6.9,12.2),(12.7,12.2)]
def draw_cursor(cv, x, y, s=2.0):
    pts=[(x+px*s,y+py*s) for px,py in ARR]; d=ImageDraw.Draw(cv)
    d.polygon(pts, fill=(20,20,30,255))
    d.polygon([(x+px*s*0.82+1.4,y+py*s*0.82+1.4) for px,py in ARR], fill=(255,255,255,255))
def cursor_at(pts, t):
    if t<=pts[0][0]: return pts[0][1],pts[0][2]
    if t>=pts[-1][0]: return pts[-1][1],pts[-1][2]
    for i in range(1,len(pts)):
        if pts[i][0]>=t:
            t0,x0,y0=pts[i-1]; t1,x1,y1=pts[i]; k=(t-t0)/(t1-t0) if t1>t0 else 0
            return x0+(x1-x0)*k, y0+(y1-y0)*k
    return pts[-1][1],pts[-1][2]

def main():
    global RAW
    RAW = os.path.join(SP,[f for f in os.listdir(SP) if f.endswith(".webm")][0])
    beats = json.load(open(f"{SP}/beats.json"))
    path  = [(p[0]/1000.0,p[1],p[2]) for p in json.load(open(f"{SP}/path.json"))["path"]]
    subprocess.run(["rm","-rf",OUTF]); os.makedirs(OUTF, exist_ok=True)
    gidx=0; counts=[]
    for bi,b in enumerate(beats):
        start=b["t"]; wdir=f"{SP}/w{bi}"
        subprocess.run(["rm","-rf",wdir]); os.makedirs(wdir)
        subprocess.run(["ffmpeg","-y","-i",RAW,"-ss",f"{start}","-t",f"{VIEW}","-r",str(FPS),f"{wdir}/%04d.png"],capture_output=True)
        frames=sorted(os.listdir(wdir)); section,src=DEMO[bi]
        for fi,fn in enumerate(frames):
            raw_t=start+fi/FPS
            shot=Image.open(f"{wdir}/{fn}").convert("RGBA").resize((CW,CH))
            cv=Image.new("RGBA",(E.W,E.H),E.BG); d=ImageDraw.Draw(cv)
            E.header(d, section, bi+1)
            # accent section label + 打开看看
            d.text((120,240), E.spaced(section)+"   ·   打开看看", font=E.F(25), fill=E.ACC)
            # footage
            cv.alpha_composite(shot,(0,TOPY))
            # thin hairline frame around footage
            d.rectangle([0,TOPY-1,E.W,TOPY], fill=E.HAIR)
            d.rectangle([0,TOPY+CH,E.W,TOPY+CH+1], fill=E.HAIR)
            # cursor
            cx,cy=cursor_at(path,raw_t); draw_cursor(cv,cx,cy+TOPY)
            # footer source
            d.text((120,E.H-118), src, font=E.F(23), fill=E.MUTE)
            cv.convert("RGB").save(f"{OUTF}/{gidx:05d}.png"); gidx+=1
        counts.append(len(frames)); print("demo",bi,section,len(frames))
    json.dump(counts, open(f"{SP}/sites.json","w"))
    print("DONE frames",gidx)

if __name__=="__main__":
    main()
