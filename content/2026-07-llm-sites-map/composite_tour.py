#!/usr/bin/env python3
"""Composite the 8-site tour into a clean-minimal portrait frame.
   Trims each site to a ~6s settled window (drops load gaps), overlays a
   gliding cursor + click pulse, and a per-site callout with progress dots."""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

SP   = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
RAW  = None  # set from the .webm in SP
FPS  = 30
VIEW = 6.6                      # seconds kept per site
CW, CH = 1080, 1440             # screencast size
W, H   = 1080, 1920            # portrait canvas
HEAD   = 210                    # top band
FOOT   = H - (HEAD + CH)        # 270 bottom band

OUTF = f"{SP}/oframes"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"
INK  = (24, 24, 30, 255)
SUBINK = (120, 122, 134, 255)
PAPER = (247, 247, 245, 255)
BAND  = (241, 241, 238, 255)
ACC   = (79, 70, 229, 255)      # one accent: indigo

def font(sz, mono=False):
    return ImageFont.truetype(MONO if mono else FONT, sz)

# per-site callout: (step tag, big label, sub, ascii-domain-for-chip)
# recipes.vllm.ai 与 recipes.mcpinfra.net 高度重合,只保留后者 -> DROP 掉录制里的第 6 站
DROP = {6}
CALL = [
    ("① 综合竞技场 · 人类偏好", "真人盲测投票的偏好排行",   "arena.ai(原 LMArena)· Elo 评分",     "arena.ai/leaderboard"),
    ("① 中文评测榜",         "中文通用综合榜,月度更新",   "SuperCLUE",                            "superclueai.com"),
    ("② 选型 · 定价分析",     "智能 × 速度 × 价格 综合分",  "LLM-Stats · 300+ 模型",               "llm-stats.com"),
    ("② 选型 · 端到端实测",   "真实发起请求,测性能与价格", "Artificial Analysis",                  "artificialanalysis.ai"),
    ("③ 垂直能力 · 编码 Agent","真实 issue 编码修复基准",   "SWE-bench · 认准 Verified 子榜",       "swebench.com"),
    ("④ API 聚合 · 用量榜",   "真实 token 用量排行",       "OpenRouter",                           "openrouter.ai/rankings"),
    ("⑤ 部署 · 配方",         "按模型 × GPU 给可复制命令",  "recipes.mcpinfra.net · vLLM/SGLang",   "recipes.mcpinfra.net"),
]

ARR = [(0,0),(0,17),(4.4,13.2),(7.6,20),(10.2,19),(6.9,12.2),(12.7,12.2)]
def draw_cursor(cv, x, y, s=2.0):
    pts = [(x+px*s, y+py*s) for px,py in ARR]
    d = ImageDraw.Draw(cv)
    d.polygon(pts, fill=(20,20,30,255))
    inner = [(x+px*s*0.82+1.4, y+py*s*0.82+1.4) for px,py in ARR]
    d.polygon(inner, fill=(255,255,255,255))

def cursor_at(pts, t):
    if t <= pts[0][0]: return pts[0][1], pts[0][2]
    if t >= pts[-1][0]: return pts[-1][1], pts[-1][2]
    for i in range(1, len(pts)):
        if pts[i][0] >= t:
            t0,x0,y0 = pts[i-1]; t1,x1,y1 = pts[i]
            k = (t-t0)/(t1-t0) if t1>t0 else 0
            return x0+(x1-x0)*k, y0+(y1-y0)*k
    return pts[-1][1], pts[-1][2]

def rrect(d, box, r, **kw): d.rounded_rectangle(box, radius=r, **kw)

def main():
    global RAW
    webms = [f for f in os.listdir(SP) if f.endswith(".webm")]
    RAW = os.path.join(SP, webms[0])
    beats = json.load(open(f"{SP}/beats.json"))
    beats = [b for i, b in enumerate(beats) if i not in DROP]   # keep 7 sites
    N = len(beats)
    path  = [(p[0]/1000.0, p[1], p[2]) for p in json.load(open(f"{SP}/path.json"))["path"]]

    subprocess.run(["rm","-rf",OUTF]); os.makedirs(OUTF, exist_ok=True)
    fTag=font(30); fBig=font(46); fSub=font(26,mono=False); fUrl=font(23,mono=True); fBrand=font(24)

    gidx = 0; counts = []
    for bi, b in enumerate(beats):
        start = b["t"]
        wdir = f"{SP}/w{bi}"
        subprocess.run(["rm","-rf",wdir]); os.makedirs(wdir, exist_ok=True)
        # accurate output-seek extraction of this window
        subprocess.run(["ffmpeg","-y","-i",RAW,"-ss",f"{start}","-t",f"{VIEW}",
                        "-r",str(FPS),f"{wdir}/%04d.png"], capture_output=True)
        frames = sorted(os.listdir(wdir))
        tag, big, sub, chip = CALL[bi]
        for fi, fn in enumerate(frames):
            raw_t = start + fi/FPS
            local_t = fi/FPS
            shot = Image.open(f"{wdir}/{fn}").convert("RGBA").resize((CW,CH))
            cv = Image.new("RGBA",(W,H),PAPER)
            d = ImageDraw.Draw(cv)
            d.rectangle([0,0,W,HEAD], fill=BAND)
            d.rectangle([0,HEAD+CH,W,H], fill=BAND)
            # header: brand + window dots + url chip
            d.text((56,58), "大模型生态 · 网站全景盘点", font=fBrand, fill=INK)
            chipw = 96 + int(d.textlength(chip, font=fUrl))
            rrect(d, [56,110,chipw,152], 20, fill=(255,255,255,255), outline=(224,224,220,255), width=2)
            d.text((78,120), chip, font=fUrl, fill=(96,98,112,255))
            d.text((W-150,120), f"{bi+1}/{N}", font=fBrand, fill=ACC)
            # screencast
            cv.alpha_composite(shot,(0,HEAD))
            # cursor + pulse
            cx,cy = cursor_at(path, raw_t); cyf = cy+HEAD
            if local_t < 0.45:  # a soft entry pulse each site
                prog = local_t/0.45; r=int(12+prog*46); a=int(150*(1-prog))
                ov=Image.new("RGBA",cv.size,(0,0,0,0)); od=ImageDraw.Draw(ov)
                od.ellipse([cx-r,cyf-r,cx+r,cyf+r], outline=(ACC[0],ACC[1],ACC[2],a), width=4)
                cv.alpha_composite(ov)
            draw_cursor(cv,cx,cyf)
            # footer callout
            fy = HEAD+CH
            d.text((56, fy+30), tag, font=fTag, fill=ACC)
            d.text((56, fy+82), big, font=fBig, fill=INK)
            d.text((58, fy+150), sub, font=fSub, fill=SUBINK)
            # progress dots
            dotx0 = 56; dy = fy+FOOT-34
            for k in range(N):
                fillc = ACC if k==bi else (208,208,204,255)
                d.ellipse([dotx0+k*30, dy, dotx0+k*30+14, dy+14], fill=fillc)
            cv.convert("RGB").save(f"{OUTF}/{gidx:05d}.png"); gidx += 1
        counts.append(len(frames))
        print("site", bi, "frames", len(frames), "total", gidx)
    json.dump(counts, open(f"{SP}/sites.json","w"))
    print("DONE frames", gidx, "dur", gidx/FPS)

if __name__ == "__main__":
    main()
