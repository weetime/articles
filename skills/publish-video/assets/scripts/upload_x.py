#!/usr/bin/env python3
"""发视频到 X(Twitter)。视频走 v1.1 分块上传(异步转码),发帖走 v2。

密钥从 $VIDEO_PUBLISH_HOME/x.env(KEY=VALUE 每行一个)或环境变量读,需四个:
  X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET
(developer.x.com 建 App,User auth 设 Read and Write,改权限后重新生成 Access Token)

文案默认读当前工作目录 publish_meta.json 的 x_text,可用 --text / --text-file 覆盖。

⚠️ X 免费层未必含视频上传。media_upload 报 403/453/"not permitted" 基本是要升 Basic 档。

用法:
  python upload_x.py video-portrait.mp4
"""
import os, sys, time, json, argparse
import tweepy

HOME = os.environ.get("VIDEO_PUBLISH_HOME", os.path.expanduser("~/.config/video-publish"))


def load_keys():
    env = {}
    p = os.path.join(HOME, "x.env")
    if os.path.exists(p):
        for line in open(p):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    g = lambda k: os.environ.get(k) or env.get(k)
    return g("X_API_KEY"), g("X_API_SECRET"), g("X_ACCESS_TOKEN"), g("X_ACCESS_SECRET")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--meta", default="publish_meta.json")
    ap.add_argument("--text")
    ap.add_argument("--text-file")
    a = ap.parse_args()
    if not os.path.exists(a.video):
        sys.exit(f"找不到视频:{a.video}")

    meta = json.load(open(a.meta)) if os.path.exists(a.meta) else {}
    text = a.text or (open(a.text_file).read() if a.text_file else None) or meta.get("x_text", "")
    if not text:
        sys.exit("没有文案:给 --text / --text-file,或在 publish_meta.json 里写 x_text")

    CK, CS, AT, AS = load_keys()
    if not all([CK, CS, AT, AS]):
        sys.exit(f"缺少 X 密钥(放 {HOME}/x.env 或导出环境变量)")

    api = tweepy.API(tweepy.OAuth1UserHandler(CK, CS, AT, AS))
    print("上传视频(分块)…")
    media = api.media_upload(a.video, chunked=True, media_category="tweet_video")
    mid = media.media_id_string
    info = getattr(media, "processing_info", None)
    while info and info.get("state") in ("pending", "in_progress"):
        w = info.get("check_after_secs", 5)
        print(f"  转码中…{w}s")
        time.sleep(w)
        info = getattr(api.get_media_upload_status(mid), "processing_info", None)
    if info and info.get("state") == "failed":
        sys.exit(f"视频转码失败:{info}")

    client = tweepy.Client(consumer_key=CK, consumer_secret=CS,
                           access_token=AT, access_token_secret=AS)
    resp = client.create_tweet(text=text, media_ids=[mid])
    print(f"DONE -> https://x.com/i/web/status/{resp.data['id']}")


if __name__ == "__main__":
    main()
