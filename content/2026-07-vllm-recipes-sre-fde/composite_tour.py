#!/usr/bin/env python3
import json, os, sys, subprocess, math
from PIL import Image, ImageDraw, ImageFont

SP = "/private/tmp/claude-501/-Users-fangyong-articles/f744d5c5-dc03-4917-b213-752401878e18/scratchpad"
RAW = f"{SP}/tour_raw.mp4"
OFFSET = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0   # video_t = path_t + OFFSET
END = 64.0            # comprehensive tour
FPS = 30
CW, CH = 1080, 1440   # screencast size
W, H = 1080, 1920     # portrait canvas
HEAD = 200            # top band; screencast at y=HEAD..HEAD+CH=1640 ; footer 1640..1920

FRAMES = f"{SP}/frames"; OUTF = f"{SP}/oframes"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"

def font(sz, mono=False, idx=0):
    return ImageFont.truetype(MONO if mono else FONT, sz, index=idx)

# ---- callout schedule (video seconds -> big label, sub) ----
BEATS = [
    (0.0,   "选模型 · 116 个配方",          "recipes.mcpinfra.net"),
    (11.3,  "点开一个模型",                "DeepSeek · 9 个配方"),
    (14.4,  "一条能直接跑的 serve 命令",     "DeepSeek-V3.2 · 671B MoE"),
    (17.9,  "换到 AMD,安装自动变 ROCm",     "MI300X · EP + DP"),
    (20.9,  "换到 Blackwell,命令实时重算",   "B200"),
    (23.7,  "换量化权重,显存直接减半",       "FP8 805G → NVFP4 403G"),
    (26.6,  "选并行策略",                 "EP + DP · MoE 吞吐优先"),
    (29.4,  "一键多机部署",               "Head + Worker · --nnodes 2"),
    (32.8,  "vLLM ↔ SGLang 双引擎",       "同一个模型,一键切换"),
    (35.9,  "按需开启特性",               "reasoning · tool-call · MTP"),
    (38.5,  "复制即用",                  "copy → paste → serve"),
    (41.8,  "JSON API · 喂给 Agent",     "models.json 直接调用"),
    (45.0,  "全库总览",                  "Browse · 116 recipes"),
    (47.9,  "展开筛选,一览全谱系",         "任务·架构·规模·精度·硬件"),
    (51.5,  "国产卡全覆盖",              "昇腾·寒武纪·海光·天数·昆仑·摩尔线程"),
    (55.4,  "镜像选择器 · GPUStack",      "国产卡适配镜像,docker pull 直接跑"),
]
def callout(t):
    lab, sub = BEATS[0][1], BEATS[0][2]
    for bt, l, s in BEATS:
        if t >= bt: lab, sub = l, s
    return lab, sub

def load_path():
    d = json.load(open(f"{SP}/tour/path.json"))
    pts = [(p[0]/1000.0 + OFFSET, p[1], p[2]) for p in d["path"]]
    clk = [(c[0]/1000.0 + OFFSET, c[1], c[2]) for c in d["clicks"]]
    return pts, clk

def cursor_at(pts, t):
    if t <= pts[0][0]: return pts[0][1], pts[0][2]
    if t >= pts[-1][0]: return pts[-1][1], pts[-1][2]
    for i in range(1, len(pts)):
        if pts[i][0] >= t:
            t0, x0, y0 = pts[i-1]; t1, x1, y1 = pts[i]
            k = (t - t0) / (t1 - t0) if t1 > t0 else 0
            return x0 + (x1-x0)*k, y0 + (y1-y0)*k
    return pts[-1][1], pts[-1][2]

# cursor arrow (tip at 0,0), scale ~1.9
ARR = [(0,0),(0,17),(4.4,13.2),(7.6,20),(10.2,19),(6.9,12.2),(12.7,12.2)]
def draw_cursor(canvas, x, y, s=2.0):
    pts = [(x + px*s, y + py*s) for px, py in ARR]
    d = ImageDraw.Draw(canvas)
    d.polygon(pts, fill=(11,11,28,255))          # dark outline
    inner = [(x + px*s*0.86 + 1.4, y + py*s*0.86 + 1.4) for px, py in ARR]
    d.polygon(inner, fill=(255,255,255,255))

def draw_pulse(canvas, cx, cy, prog):  # prog 0..1
    r = int(10 + prog*40); a = int(200*(1-prog))
    ov = Image.new("RGBA", canvas.size, (0,0,0,0))
    dd = ImageDraw.Draw(ov)
    dd.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(139,125,247,a), width=4)
    canvas.alpha_composite(ov)

def main():
    os.makedirs(OUTF, exist_ok=True)
    subprocess.run(["rm","-rf",FRAMES]); os.makedirs(FRAMES, exist_ok=True)
    subprocess.run(["ffmpeg","-y","-i",RAW,"-t",str(END),"-r",str(FPS),f"{FRAMES}/%04d.png"],
                   capture_output=True)
    pts, clk = load_path()
    n = len(os.listdir(FRAMES))
    fL = font(46); fS = font(26); fBrand = font(26); fUrl = font(24, mono=True)
    for i in range(1, n+1):
        t = (i-1)/FPS
        shot = Image.open(f"{FRAMES}/{i:04d}.png").convert("RGBA").resize((CW, CH))
        cv = Image.new("RGBA", (W, H), (8, 8, 18, 255))
        d = ImageDraw.Draw(cv)
        # subtle top/bottom band tint
        d.rectangle([0,0,W,HEAD], fill=(12,12,28,255))
        d.rectangle([0,HEAD+CH,W,H], fill=(12,12,28,255))
        # header: window dots + url chip + brand
        for j,c in enumerate([(255,95,87),(254,188,46),(40,200,64)]):
            d.ellipse([54+j*30,64,54+j*30+18,82], fill=c)
        d.rounded_rectangle([170,54,760,96], radius=21, fill=(20,20,40,255), outline=(60,55,110,255), width=2)
        d.text((196,62), "recipes.mcpinfra.net", font=fUrl, fill=(150,150,190,255))
        d.text((820,60), "产品速览", font=fBrand, fill=(139,125,247,255))
        # screencast
        cv.alpha_composite(shot, (0, HEAD))
        # cursor + pulse (coords are in screencast space -> add HEAD to y)
        cx, cy = cursor_at(pts, t); cyf = cy + HEAD
        for ct, ccx, ccy in clk:
            if 0 <= t-ct < 0.5:
                draw_pulse(cv, int(ccx), int(ccy)+HEAD, (t-ct)/0.5)
        draw_cursor(cv, cx, cyf)
        # footer callout
        lab, sub = callout(t)
        d.text((56, 1668), lab, font=fL, fill=(238,240,248,255))
        d.text((58, 1730), sub, font=fS, fill=(154,161,186,255))
        d.text((W-300, 1740), "github.com/weetime", font=fUrl, fill=(90,96,120,255))
        cv.convert("RGB").save(f"{OUTF}/{i:04d}.png")
    print("composited", n, "frames")

if __name__ == "__main__":
    main()
