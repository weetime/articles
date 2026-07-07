#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 ModelDoctor 报告文章 (article.md + final-*.png) 推到微信公众号草稿箱,可选直接发布。

用法:
  source ~/.secrets   # 提供 WECHAT_APPID / WECHAT_APPSECRET
  python3 publish_wechat.py --dir <报告文件夹> \
      --title "标题" --author "ModelDoctor" [--digest "摘要"] \
      [--cover final-1.png] [--publish]

默认只建草稿;加 --publish 才调用 freepublish 正式发布。
前提:调用机器的出口 IP 已加入公众号后台「IP 白名单」。
"""
import os, sys, re, json, argparse, time
import requests

API = "https://api.weixin.qq.com/cgi-bin"


def die(msg):
    print(f"\n❌ {msg}", file=sys.stderr)
    sys.exit(1)


def check(resp, what):
    try:
        j = resp.json()
    except Exception:
        die(f"{what}: 非 JSON 响应 -> {resp.text[:300]}")
    if isinstance(j, dict) and j.get("errcode", 0) not in (0,):
        die(f"{what} 失败: errcode={j.get('errcode')} errmsg={j.get('errmsg')}")
    return j


def get_token(appid, secret):
    r = requests.get(f"{API}/token", params={
        "grant_type": "client_credential", "appid": appid, "secret": secret})
    j = check(r, "获取 access_token")
    if "access_token" not in j:
        die(f"获取 token 异常: {j}")
    return j["access_token"]


def upload_thumb(token, path):
    """永久图片素材 -> thumb_media_id (用作封面)"""
    with open(path, "rb") as f:
        r = requests.post(f"{API}/material/add_material",
                          params={"access_token": token, "type": "image"},
                          files={"media": (os.path.basename(path), f, "image/png")})
    j = check(r, f"上传封面素材 {os.path.basename(path)}")
    return j["media_id"]


def upload_content_img(token, path):
    """图文消息内图片 -> 返回微信域名 URL"""
    with open(path, "rb") as f:
        r = requests.post(f"{API}/media/uploadimg",
                          params={"access_token": token},
                          files={"media": (os.path.basename(path), f, "image/png")})
    j = check(r, f"上传正文图 {os.path.basename(path)}")
    return j["url"]


# ---------- 极简 markdown -> 公众号内联样式 HTML ----------
def inline(text):
    text = re.sub(r"`([^`]+)`", r'<code style="background:#eef1f4;border-radius:4px;padding:1px 6px;font-size:13px;color:#3b5b80;">\1</code>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r'<strong style="color:#16161a;font-weight:700;">\1</strong>', text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r'<em style="color:#666;">\1</em>', text)
    return text


def md_to_html(md, img_urls):
    """img_urls: {'final-1.png': url, ...}。返回 (title, digest, html)。"""
    lines = md.splitlines()
    title, digest = None, None
    out, i, n = [], 0, len(lines)
    para, quote, ul, ol, tbl, code = [], [], [], [], [], []
    in_code = False

    def flush_para():
        if para:
            out.append(f'<p style="margin:20px 0;font-size:15px;line-height:1.8;color:#2b2b33;">{inline(" ".join(para))}</p>')
            para.clear()

    def flush_quote():
        if quote:
            body = "<br>".join(inline(q) for q in quote)
            out.append(f'<blockquote style="margin:20px 0;padding:14px 18px;background:#f3f6fa;border-left:4px solid #1a4d80;border-radius:8px;color:#4a5058;font-size:14px;line-height:1.8;">{body}</blockquote>')
            quote.clear()

    def flush_ul():
        if ul:
            items = "".join(f'<li style="margin:7px 0;font-size:15px;line-height:1.8;color:#2b2b33;">{inline(x)}</li>' for x in ul)
            out.append(f'<ul style="margin:14px 0;padding-left:22px;">{items}</ul>')
            ul.clear()

    def flush_ol():
        if ol:
            items = "".join(f'<li style="margin:7px 0;font-size:15px;line-height:1.8;color:#2b2b33;">{inline(x)}</li>' for x in ol)
            out.append(f'<ol style="margin:14px 0;padding-left:26px;">{items}</ol>')
            ol.clear()

    def flush_table():
        if not tbl:
            return
        rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in tbl]
        # 丢掉分隔行 |---|---|
        rows = [r for r in rows if not all(re.fullmatch(r":?-{2,}:?", c or "-") for c in r)]
        tbl.clear()
        if not rows:
            return
        head, body = rows[0], rows[1:]
        # 第一列(标签列)不换行,避免"搜 索 方 式"逐字折行;内容列照常换行
        th = "".join(f'<th style="padding:9px 12px;border:1px solid #e3e3ea;background:#f7f6fb;font-size:14px;color:#16161a;text-align:left;{"white-space:nowrap;" if j == 0 else ""}">{inline(c)}</th>' for j, c in enumerate(head))
        trs = ""
        for r in body:
            tds = "".join(f'<td style="padding:9px 12px;border:1px solid #ececf0;font-size:14px;color:#2b2b33;{"white-space:nowrap;" if j == 0 else ""}">{inline(c)}</td>' for j, c in enumerate(r))
            trs += f"<tr>{tds}</tr>"
        out.append(f'<table style="border-collapse:collapse;width:100%;margin:18px 0;"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>')

    def flush_all():
        flush_para(); flush_quote(); flush_ul(); flush_ol(); flush_table()

    while i < n:
        raw = lines[i]
        ln = raw.rstrip()
        s = ln.strip()
        if s.startswith("```"):
            if in_code:
                esc = "\n".join(code).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                out.append('<pre style="margin:20px 0;padding:16px 18px;background:#1f2328;border-radius:10px;overflow-x:auto;">'
                           f'<code style="font-family:SFMono-Regular,Consolas,Menlo,monospace;font-size:13px;color:#e6edf3;white-space:pre;line-height:1.7;">{esc}</code></pre>')
                code.clear(); in_code = False
            else:
                flush_all(); in_code = True
            i += 1; continue
        if in_code:
            code.append(raw.rstrip("\n"))
            i += 1; continue
        if s.startswith("# ") and title is None:
            title = s[2:].strip(); i += 1; continue
        m_img = re.match(r"!\[([^\]]*)\]\(\.?/?([^)]+)\)", s)
        if m_img:
            flush_all()
            key = os.path.basename(m_img.group(2))
            url = img_urls.get(key)
            if url:
                out.append(f'<p style="margin:22px 0;text-align:center;"><img src="{url}" alt="{m_img.group(1)}" style="width:100%;border-radius:10px;display:block;"></p>')
            i += 1; continue
        if s.startswith("### "):
            flush_all()
            out.append(f'<h3 style="margin:28px 0 10px;font-size:16px;font-weight:700;color:#15507d;line-height:1.5;">{inline(s[4:].strip())}</h3>')
            i += 1; continue
        if s.startswith("## "):
            flush_all()
            out.append(f'<h2 style="text-align:center;margin:42px 0 22px;"><span style="display:inline-block;background:#1a4d80;color:#ffffff;font-size:17px;font-weight:700;padding:9px 24px;border-radius:9px;">{inline(s[3:].strip())}</span></h2>')
            i += 1; continue
        if s == "---":
            flush_all()
            out.append('<hr style="border:none;border-top:1px solid #ececf0;margin:30px 0;">')
            i += 1; continue
        if s.startswith("|") and s.endswith("|"):
            flush_para(); flush_quote(); flush_ul(); flush_ol(); tbl.append(s); i += 1; continue
        if s.startswith("> "):
            flush_para(); flush_ul(); flush_ol(); flush_table(); quote.append(s[2:]); i += 1; continue
        if s == ">":
            i += 1; continue
        if s.startswith("- "):
            flush_para(); flush_quote(); flush_ol(); flush_table(); ul.append(s[2:]); i += 1; continue
        m_ol = re.match(r"(\d+)\.\s+(.*)", s)
        if m_ol:
            flush_para(); flush_quote(); flush_ul(); flush_table(); ol.append(m_ol.group(2)); i += 1; continue
        if s == "":
            flush_all(); i += 1; continue
        # 普通段落行
        flush_quote(); flush_ul(); flush_ol(); flush_table(); para.append(s); i += 1

    flush_all()
    # 摘要:取第一段引用文字,去标记,<=110 字
    if not digest:
        for ln in lines:
            t = ln.strip()
            if t.startswith("> ") and len(t) > 4:
                digest = re.sub(r"[*`>#]", "", t).strip()[:110]; break
    html = '<section style="font-family:-apple-system,PingFang SC,sans-serif;">' + "".join(out) + "</section>"
    return title, (digest or ""), html


def add_draft(token, article):
    body = json.dumps({"articles": [article]}, ensure_ascii=False).encode("utf-8")
    r = requests.post(f"{API}/draft/add", params={"access_token": token},
                      data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    j = check(r, "创建草稿 draft/add")
    return j["media_id"]


def freepublish(token, media_id):
    r = requests.post(f"{API}/freepublish/submit", params={"access_token": token},
                      data=json.dumps({"media_id": media_id}).encode("utf-8"))
    j = check(r, "发布 freepublish/submit")
    return j.get("publish_id")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--md", default="article.md", help="正文 markdown 文件名(相对 --dir)")
    ap.add_argument("--title")
    ap.add_argument("--author", default="ModelDoctor")
    ap.add_argument("--digest", default=None)
    ap.add_argument("--cover", default="final-1.png")
    ap.add_argument("--source-url", default="")
    ap.add_argument("--publish", action="store_true")
    a = ap.parse_args()

    appid = os.environ.get("WECHAT_APPID"); secret = os.environ.get("WECHAT_APPSECRET")
    if not appid or not secret:
        die("缺少 WECHAT_APPID / WECHAT_APPSECRET (先 source ~/.secrets)")

    d = os.path.abspath(a.dir)
    md_path = os.path.join(d, a.md)
    if not os.path.exists(md_path):
        die(f"找不到 {md_path}")
    md = open(md_path, encoding="utf-8").read()

    # 按正文实际引用的图片(出现顺序、去重)来上传,而不是固定 glob
    imgs = []
    for r in re.findall(r"!\[[^\]]*\]\(\.?/?([^)]+)\)", md):
        b = os.path.basename(r)
        if b not in imgs:
            imgs.append(b)
    missing = [f for f in imgs if not os.path.exists(os.path.join(d, f))]
    if missing:
        die(f"正文引用的图不存在: {missing}")
    if not imgs:
        die("正文里没有图片引用")

    print(f"→ 获取 access_token …")
    token = get_token(appid, secret)

    print(f"→ 上传封面 {a.cover} …")
    thumb_id = upload_thumb(token, os.path.join(d, a.cover))

    url_map = {}
    for f in imgs:
        print(f"→ 上传正文图 {f} …")
        url_map[f] = upload_content_img(token, os.path.join(d, f))

    title, digest, html = md_to_html(md, url_map)
    title = a.title or title or "ModelDoctor 实测报告"
    digest = a.digest or digest

    article = {
        "title": title[:64],
        "author": a.author,
        "digest": digest[:120],
        "content": html,
        "content_source_url": a.source_url,
        "thumb_media_id": thumb_id,
        "need_open_comment": 1,
        "only_fans_can_comment": 0,
    }
    print(f"→ 创建草稿:《{title}》")
    media_id = add_draft(token, article)
    print(f"✅ 草稿已建,media_id = {media_id}")

    if a.publish:
        print("→ 正式发布 freepublish …")
        pid = freepublish(token, media_id)
        print(f"✅ 已提交发布,publish_id = {pid}(公众号会做一次内容审核,通过后出现在文章列表)")
    else:
        print("ℹ️  仅建草稿。去公众号后台「草稿箱」预览确认后手动群发/发布,或加 --publish 自动发布。")


if __name__ == "__main__":
    main()
