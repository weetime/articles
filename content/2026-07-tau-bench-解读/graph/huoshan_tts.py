#!/usr/bin/env python3
# 火山引擎(豆包)语音合成客户端。凭证从 ~/.config/huoshan-tts.env 读(不进库)。
# 用法:python huoshan_tts.py "文本" out.mp3 [voice] [emotion] [speed]
import os, sys, uuid, base64, json, requests

ENV = os.path.expanduser("~/.config/huoshan-tts.env")
def load_env():
    d = {}
    for line in open(ENV):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1); d[k] = v
    return d
CFG = load_env()
APPID = CFG["VOLC_TTS_APPID"]; TOKEN = CFG["VOLC_TTS_TOKEN"]
CLUSTER = CFG.get("VOLC_TTS_CLUSTER", "volcano_tts")
DEFVOICE = CFG.get("VOLC_TTS_VOICE", "zh_male_yuanboxiaoshu_moon_bigtts")
URL = "https://openspeech.bytedance.com/api/v1/tts"

def synth(text, out, voice=None, emotion=None, speed=1.0):
    voice = voice or DEFVOICE
    audio = {"voice_type": voice, "encoding": "mp3", "speed_ratio": float(speed), "loudness_ratio": 1.0}
    if emotion:
        audio["emotion"] = emotion; audio["enable_emotion"] = True
    payload = {
        "app": {"appid": APPID, "token": TOKEN, "cluster": CLUSTER},
        "user": {"uid": "mcp-video"},
        "audio": audio,
        "request": {"reqid": str(uuid.uuid4()), "text": text, "operation": "query", "text_type": "plain"},
    }
    r = requests.post(URL, headers={"Authorization": f"Bearer;{TOKEN}"}, json=payload, timeout=30)
    try:
        j = r.json()
    except Exception:
        return False, f"HTTP {r.status_code}: {r.text[:200]}"
    if j.get("code") == 3000 and j.get("data"):
        open(out, "wb").write(base64.b64decode(j["data"]))
        return True, j.get("addition", {})
    return False, f"code={j.get('code')} msg={j.get('message') or j.get('Message')}"

if __name__ == "__main__":
    text = sys.argv[1]; out = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else None
    emotion = sys.argv[4] if len(sys.argv) > 4 else None
    speed = sys.argv[5] if len(sys.argv) > 5 else 1.0
    ok, info = synth(text, out, voice, emotion, speed)
    print("OK" if ok else "FAIL", "->", out, info)
