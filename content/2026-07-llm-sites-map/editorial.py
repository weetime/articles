#!/usr/bin/env python3
"""Shared clean-editorial style (mcp-chronicle 减法风): warm bg, big type,
   single accent, hairline rules, page numbers. Used by leaderboard + demo frames."""
from PIL import ImageFont

W, H = 1080, 1920
FPS = 30
TOTAL_CATS = 9
BRAND = "大模型网站 · 全景盘点"

# tokens (from CleanFrame.tsx)
BG   = (244, 242, 238)
INK  = (23, 23, 26)
INK2 = (87, 87, 92)
MUTE = (163, 161, 155)
HAIR = (217, 214, 206)
ACC  = (192, 69, 59)     # 单一强调色(编辑红)
STAR_ON  = ACC
STAR_OFF = (208, 205, 197)

FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"
def F(sz, bold=False, mono=False):
    if mono: return ImageFont.truetype(MONO, sz)
    return ImageFont.truetype(FONT, sz, index=1 if bold else 0)

def spaced(s, gap=" "):        # letter-spaced caps
    return gap.join(list(s))

def header(d, section, page, total=TOTAL_CATS, accent=ACC):
    """top: brand · section (left) + page (right) + hairline progress."""
    d.text((120, 150), spaced(BRAND, " "), font=F(23), fill=MUTE)
    pg = f"{page:02d} / {total:02d}"
    b = d.textbbox((0,0), pg, font=F(23, mono=True))
    d.text((W-120-(b[2]-b[0]), 150), pg, font=F(23, mono=True), fill=MUTE)
    y = 196
    d.rectangle([120, y, W-120, y+2], fill=HAIR)
    fillw = int((W-240) * page/total)
    d.rectangle([120, y, 120+fillw, y+2], fill=INK)

def footer(d, src, accent=ACC):
    d.text((120, H-150), src, font=F(23), fill=MUTE)

def stars(d, x, y, n, sz=30, gap=8, on=STAR_ON, off=STAR_OFF):
    fs = F(sz)
    for i in range(5):
        d.text((x+i*(sz+gap), y), "★", font=fs, fill=on if i < n else off)
    return 5*(sz+gap)-gap
