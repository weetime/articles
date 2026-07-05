#!/usr/bin/env python3
# 高亮走查片组装:ReportWalk2.mp4 + 10 段旁白(按每段 beat 起点落位)+ drive BGM。
import subprocess, os, asyncio
import edge_tts

DIR = os.path.dirname(os.path.abspath(__file__))
VOICE = "zh-CN-YunyangNeural"; RATE = "+26%"
VID = os.path.join(DIR, "anim", "out", "ReportWalk2.mp4")
BGM = os.path.join(DIR, "bgm.wav")
OUT = os.path.join(DIR, "video-walkthrough-portrait.mp4")

# beat 起始帧 0,360,720,1020,1320,1650,2040,2400,2730,3090 @30fps → 秒 + 0.3 起白
BEATS = [
 (0.3,   "大家好。昨天我在八张 PPU 上,给 DeepSeek V4 Flash 跑了一轮 SGLang 测试。厂商推荐的基线参数本身稳妥;我想弄清:给定一个 S L O,还有没有定向优化的空间。"),
 (12.0,  "方法是控制变量:硬件、显存比例、并行度全部固定,只调并发上限 max running requests,从三十二扫到一百二十八;短对话和长输入两类负载各测一遍。"),
 (23.8,  "先看短对话。把并发上限往上调,峰值吞吐持续上升,到并发九十六是一个平衡点,比默认高百分之四十五。"),
 (32.8,  "但继续调到一百二十八,K V cache 使用率达到百分之百,吞吐只再多百分之二。这就是 K V cache 决定的吞吐上界。"),
 (41.9,  "这里有个取舍:同样是并发三十二,高并发档的配置反而更慢,来自 cuda graph 的固定开销。所以参数要按真实并发来选,不是越高越好。"),
 (52.1,  "换成长输入的 Agent 负载,情况完全不同:首字延迟升到上百秒。瓶颈在 prefill 算力,单实例调参无法解决。这时要决策的是:上 P D 分离,还是增加卡数。"),
 (64.4,  "上下文同理:模型支持到一百万 token,但八千的设置会拒掉四分之一的真实 Agent 请求。放开到六万四并不额外占用 K V,取舍很清楚。"),
 (74.9,  "所以结论是分场景的:高吞吐用九十六,延迟敏感用默认三十二,长输入 Agent 走 P D 分离加多机。给定 S L O,每个场景都有对应的一套参数。"),
 (86.0,  "也要说清边界:部分数据是单次测量,跑在共享环境上。方向是可靠的,精确数值还需要多次复现,这是中立的前提。"),
 (95.4, "要不要上十六卡、要不要 P D 分离、换哪种 speculative decoding,用实测数据来决策。完整报告见下方图文。"),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0: print("FAIL:", " ".join(map(str,cmd[:6])), "\n", r.stderr[-1400:]); raise SystemExit(1)
    return r
def dur(p): return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())
async def tts(t,m):
    with open(m,"wb") as f:
        async for ch in edge_tts.Communicate(t,VOICE,rate=RATE).stream():
            if ch["type"]=="audio": f.write(ch["data"])

os.chdir(DIR)
mp3s=[]
for i,(off,txt) in enumerate(BEATS,1):
    m=f"w{i}.mp3"; asyncio.run(tts(txt,m)); d=dur(m)
    nxt = BEATS[i][0] if i < len(BEATS) else off+d+1
    print(f"  beat {i:2d} @{off:6.1f}s narr {d:5.2f}s {'OK' if off+d<=nxt+0.6 else '⚠超窗 %.1f'%(off+d-nxt)}")
    mp3s.append((m,off))
VD=dur(VID)
inputs=["-i",VID]
for m,_ in mp3s: inputs+=["-i",m]
inputs+=["-i",BGM]
n=len(mp3s); fc=[]
for i,(m,off) in enumerate(mp3s):
    ms=int(off*1000); fc.append(f"[{i+1}:a]adelay={ms}|{ms}[v{i}]")
# 人声:各段落位 → 混合 → 提增益;asplit 一路做 sidechain、一路进最终混音
fc.append("".join(f"[v{i}]" for i in range(n))+f"amix=inputs={n}:normalize=0,volume=2.4[voice]")
fc.append("[voice]asplit=2[vsc][vfin]")
fc.append(f"[{n+1}:a]volume=0.26[bg]")
fc.append("[bg][vsc]sidechaincompress=threshold=0.02:ratio=12:attack=10:release=300[bgd]")
fc.append("[vfin][bgd]amix=inputs=2:normalize=0[mx];[mx]alimiter=limit=0.95[a]")
run(["ffmpeg","-y",*inputs,"-filter_complex",";".join(fc),"-map","0:v","-map","[a]","-t",f"{VD:.2f}",
     "-c:v","copy","-c:a","aac","-b:a","192k","-shortest",OUT])
print(f"DONE -> {OUT}  {dur(OUT):.1f}s")
