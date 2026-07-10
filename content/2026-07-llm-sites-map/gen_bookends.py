#!/usr/bin/env python3
"""Editorial intro (hook headline) + outro (CTA) cards, 1080x1920."""
import os
from PIL import Image, ImageDraw
import editorial as E
HERE=os.path.dirname(os.path.abspath(__file__))

def card(section, page, kicker, line1, line2, sub_ink, sub_acc):
    im=Image.new("RGB",(E.W,E.H),E.BG); d=ImageDraw.Draw(im)
    E.header(d, section, page)
    d.text((120,470), E.spaced(kicker), font=E.F(27), fill=E.ACC)
    d.text((120,548), line1, font=E.F(96, bold=True), fill=E.INK)
    d.text((120,680), line2, font=E.F(96, bold=True), fill=E.INK)
    y=848
    d.text((120,y), sub_ink, font=E.F(36), fill=E.INK2)
    b=d.textbbox((0,0),sub_ink,font=E.F(36))
    d.text((120,y+58), sub_acc, font=E.F(36, bold=True), fill=E.ACC)
    d.text((120,E.H-150), "recipes.mcpinfra.net · ModelDoctor", font=E.F(23), fill=E.MUTE)
    return im

# intro — hook
card("网站全景 · 盘点", 0, "大 模 型 生 态",
     "工具站又多又杂?", "一张全景盘点。",
     "按「看榜 · 选型 · 拿模型 · 部署 · 趋势」的链路,",
     "9 大类 50+ 站点,逐一盘点、给出推荐指数。"
     ).save(f"{HERE}/cards/intro.png")

# outro — CTA
card("完整盘点 · 收藏", 9, "看 完 这 一 轮",
     "完整盘点,", "见公众号。",
     "9 大类 50+ 站点 · 推荐指数 · 避坑要点 ·",
     "部署配方,图文与全景图一并奉上。"
     ).save(f"{HERE}/cards/outro.png")
print("intro/outro (editorial) written")
