import asyncio, edge_tts
TXT="同一台卡,只换个引擎,吞吐差两倍多,首字延迟差二十倍。"
async def main():
    c=edge_tts.Communicate(TXT,"zh-CN-YunyangNeural",rate="+6%")
    await c.save("hookvo.mp3")
asyncio.run(main())
print("hookvo ok")
