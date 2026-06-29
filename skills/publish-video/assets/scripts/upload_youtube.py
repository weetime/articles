#!/usr/bin/env python3
"""上传视频到 YouTube。凭证集中存放,跨目录复用。

凭证目录(默认 ~/.config/video-publish,可用环境变量 VIDEO_PUBLISH_HOME 覆盖)需放:
  client_secret.json   ← GCP「桌面应用」OAuth 客户端 JSON(一次性下载)
首次运行弹浏览器授权,token 缓存到该目录,之后无感(换任何工作目录都不用重配)。

元数据:默认读当前工作目录的 publish_meta.json(youtube_title / youtube_desc / youtube_tags),
也可用 --title / --desc-file / --tags 覆盖。

用法:
  python upload_youtube.py video-portrait.mp4 --privacy unlisted
  python upload_youtube.py v.mp4 --title "..." --tags "vLLM,Higress" --privacy public
"""
import os, sys, json, argparse
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
HOME = os.environ.get("VIDEO_PUBLISH_HOME", os.path.expanduser("~/.config/video-publish"))
CLIENT = os.path.join(HOME, "client_secret.json")
TOKEN = os.path.join(HOME, "token_youtube.json")


def creds():
    c = None
    if os.path.exists(TOKEN):
        c = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not c or not c.valid:
        if c and c.expired and c.refresh_token:
            c.refresh(Request())
        else:
            if not os.path.exists(CLIENT):
                sys.exit(f"缺少 {CLIENT}(放 GCP「桌面应用」OAuth 客户端 JSON)")
            c = InstalledAppFlow.from_client_secrets_file(CLIENT, SCOPES).run_local_server(port=0)
        os.makedirs(HOME, exist_ok=True)
        with open(TOKEN, "w") as f:
            f.write(c.to_json())
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--privacy", default="private", choices=["private", "unlisted", "public"])
    ap.add_argument("--meta", default="publish_meta.json")
    ap.add_argument("--title")
    ap.add_argument("--desc-file")
    ap.add_argument("--tags", help="逗号分隔")
    ap.add_argument("--category", default="28")  # 28 = Science & Technology
    a = ap.parse_args()
    if not os.path.exists(a.video):
        sys.exit(f"找不到视频:{a.video}")

    meta = json.load(open(a.meta)) if os.path.exists(a.meta) else {}
    title = a.title or meta.get("youtube_title") or os.path.splitext(os.path.basename(a.video))[0]
    desc = open(a.desc_file).read() if a.desc_file else meta.get("youtube_desc", "")
    tags = a.tags.split(",") if a.tags else meta.get("youtube_tags", [])

    yt = build("youtube", "v3", credentials=creds())
    body = {
        "snippet": {"title": title, "description": desc, "tags": tags, "categoryId": a.category},
        "status": {"privacyStatus": a.privacy, "selfDeclaredMadeForKids": False},
    }
    media = MediaFileUpload(a.video, chunksize=-1, resumable=True, mimetype="video/mp4")
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        st, resp = req.next_chunk()
        if st:
            print(f"  上传 {int(st.progress() * 100)}%")
    print(f"DONE -> https://youtu.be/{resp['id']}  (privacy={a.privacy})")


if __name__ == "__main__":
    main()
