import asyncio, edge_tts
TXT="同一张国产卡,只换一套部署配方——峰值吞吐从三百九十四涨到五百六十八,首字延迟从一秒半压到半秒。配方没调对,性能就白扔一半。"
async def main():
    c=edge_tts.Communicate(TXT,"zh-CN-YunyangNeural",rate="+6%")
    await c.save("cmpvo.mp3")
asyncio.run(main())
print("cmpvo ok")
