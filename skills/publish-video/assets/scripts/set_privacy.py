#!/usr/bin/env python3
"""改已上传视频的公开范围,或删除它。需 youtube.force-ssl 权限(比 upload 高,首次单独授权一次)。

凭证目录同 upload_youtube.py(默认 ~/.config/video-publish),token 存 token_youtube_manage.json。

用法:
  python set_privacy.py <videoId> public      # 或 unlisted / private
  python set_privacy.py <videoId> delete       # 删除
"""
import os, sys
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]
HOME = os.environ.get("VIDEO_PUBLISH_HOME", os.path.expanduser("~/.config/video-publish"))
CLIENT = os.path.join(HOME, "client_secret.json")
TOKEN = os.path.join(HOME, "token_youtube_manage.json")


def creds():
    c = None
    if os.path.exists(TOKEN):
        c = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if not c or not c.valid:
        if c and c.expired and c.refresh_token:
            c.refresh(Request())
        else:
            if not os.path.exists(CLIENT):
                sys.exit(f"缺少 {CLIENT}")
            c = InstalledAppFlow.from_client_secrets_file(CLIENT, SCOPES).run_local_server(port=0)
        os.makedirs(HOME, exist_ok=True)
        with open(TOKEN, "w") as f:
            f.write(c.to_json())
    return c


vid, action = sys.argv[1], sys.argv[2]
yt = build("youtube", "v3", credentials=creds())
if action == "delete":
    yt.videos().delete(id=vid).execute()
    print(f"DONE -> {vid} 已删除")
else:
    yt.videos().update(part="status", body={
        "id": vid,
        "status": {"privacyStatus": action, "selfDeclaredMadeForKids": False},
    }).execute()
    print(f"DONE -> https://youtu.be/{vid} 现在是 {action}")
