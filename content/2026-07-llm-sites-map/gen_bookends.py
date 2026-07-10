#!/usr/bin/env python3
"""Generate a dark outro card (1080×1920) that bookends the constellation intro."""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FONT="/System/Library/Fonts/Hiragino Sans GB.ttc"; MONO="/System/Library/Fonts/Menlo.ttc"
HERE=os.path.dirname(os.path.abspath(__file__))
def f(sz, mono=False): return ImageFont.truetype(MONO if mono else FONT, sz)
def ctext(d, y, s, font, fill):
    b=d.textbbox((0,0),s,font=font); d.text(((W-(b[2]-b[0]))//2, y), s, font=font, fill=fill)

im=Image.new("RGBA",(W,H),(11,11,22,255)); d=ImageDraw.Draw(im)
# center radial glow
ov=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ov)
od.ellipse([W//2-460,H//2-420,W//2+460,H//2+420], fill=(124,110,247,30)); im.alpha_composite(ov)
d.rectangle([0,0,W,10], fill=(139,125,247,255))

ctext(d, 640, "链 路 速 览 · 到 此", f(32), (154,160,184,255))
# gradient-ish title (two tones)
ctext(d, 720, "完整盘点见公众号", f(94), (238,240,248,255))
dw=200; d.rounded_rectangle([(W-dw)//2,884,(W+dw)//2,892], radius=4, fill=(139,125,247,255))
ctext(d, 950, "9 大类 · 50+ 站点 · 推荐指数", f(38), (176,181,205,255))
ctext(d, 1024, "图文 · 贴图 · 全景图,一并奉上", f(34), (128,133,160,255))
ctext(d, 1770, "recipes.mcpinfra.net · ModelDoctor", f(26, mono=True), (120,125,150,255))
im.convert("RGB").save(f"{HERE}/cards/outro.png")
print("outro written")
