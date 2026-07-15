#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Act 2:guidellm 真实场景 RUNBOOK。数据源 = runs/summary_real.json(真跑:容量扫描 + 拐点 + 四种 rate-type)。
主线:① 实验设计 → ② 环境 → ③ 容量扫描(曲线图) → ④ 拐点+四施压落点(曲线图) → ⑤ constant vs poisson → ⑥ 四合一(柱图) → ⑦ 选型表 → ⑧ 结论。
术语保英文;SPEED=1.2;GuideLLM 读音 guide L L M。"""
import os, sys, subprocess, json, re

DIR = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(DIR)
S   = json.load(open(os.path.join(ART, "runs", "summary_real.json")))
RECORD_MJS = "/Users/fangyong/articles/content/2026-07-llm-sites-map/record_term_guidellm.mjs"
TERM = os.path.join(DIR, "term.mp4")
OUT  = os.path.join(ART, "video", "act2-runbook.mp4")
sys.path.insert(0, DIR)
from huoshan_tts import synth, DEFVOICE
SPEED = 1.2

def tts_adapt(s):
    return s.replace("guidellm", "guide L L M").replace("vLLM", "V L L M")

rt = S["rate_types"]; SY, CO, PO, TH = rt["synchronous"], rt["constant"], rt["poisson"], rt["throughput"]
MODEL = S["model"]; KNEE_RPS = S["knee_rps"]; KNEE_CONC = S["knee_conc"]; OP_RATE = S.get("op_rate", KNEE_RPS)
HW = S.get("hardware",""); HW_SHORT = S.get("hardware_short","")
PEAK = max(S["curve"], key=lambda p: p["rps"]); MAX_RPS = PEAK["rps"]; PEAK_CONC = PEAK["conc_set"]
LAST = S["curve"][-1]   # highest concurrency point (over-saturated)
def secs(x): return f"{x:.2f}s" if x < 10 else f"{x:.1f}s"
def ms(x):   return f"{x/1000:.1f}s" if x >= 1000 else f"{x:.0f}ms"
FIG = "../figs"   # relative to graph/term.html

# ---------- narration ----------(口语化;术语英文)
LINES=[
 f"这次做一次完整实测:一个真实的 {MODEL} 端点,跑在 {HW_SHORT} 上。先用 guidellm 把容量曲线测出来,再看四种施压方式各自落在哪。",
 "guidellm 对准端点,负载还是合成的,输入 512、输出 128 个 token 锁死。第一步,先扫容量。",
 f"一条命令,把并发从 1 扫到 192。吞吐一路涨,到并发 {PEAK_CONC} 冲到峰值,大概每秒 {MAX_RPS:.0f} 个请求;再往上打反而掉下来,延迟一路冲到 {LAST['lat95']:.0f} 秒多。吞吐见顶、延迟起飞,拐点就在中间 —— 大概并发 {KNEE_CONC}、每秒 {KNEE_RPS} 个请求。",
 "把四种施压方式放到这条曲线上:synchronous 在最左下,是延迟地板;throughput 在最右上,是吞吐天花板;constant 和 poisson,落在拐点附近 —— 这才是真实运营该待的地方。",
 f"重点看这俩,都设成每秒 {OP_RATE} 个请求,留了余量的稳态点。constant 匀速,p95 延迟 {secs(CO['lat95'])}。poisson 一样的均值,但请求突发扎堆,p95 抬到 {secs(PO['lat95'])},首字延迟更是翻倍 —— 均值没变,尾巴长了四成多。真实流量就得用 poisson 验。",
 f"四种摆一块:吞吐从 {SY['rps']:.2f} 到 {TH['rps']:.2f},p95 延迟从 {secs(SY['lat95'])} 到 {secs(TH['lat95'])}。同一个端点,你怎么压,决定你报什么数。",
 "什么时候用哪个?synchronous 测延迟地板;constant 验稳态;poisson 压真实流量;throughput 测吞吐天花板;还有 sweep,一条命令扫全谱。",
 "所以先扫容量找拐点,再按 rate-type 各跑一遍。报数带上并发、到达模型、p95 三件套 —— 换你的端点,这套命令自己就能复现。",
]

# ---------- TTS ----------
PREVIEW = bool(os.environ.get("PREVIEW"))
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print("FAIL"," ".join(map(str,cmd[:6])),"\n",r.stderr[-1500:]); raise SystemExit(1)
    return r
def dur(p): return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p]).stdout.strip())
print("voice:",DEFVOICE); durs=[]; mp3=[]
if PREVIEW:
    durs=[7.0]*len(LINES)
else:
    for i,t in enumerate(LINES):
        m=os.path.join(DIR,f"t{i}.mp3")
        if not (os.path.exists(m) and os.path.getsize(m)>2000):
            ok,info=synth(tts_adapt(t),m,speed=SPEED)
            if not ok: raise SystemExit(f"TTS fail t{i}: {info}")
        mp3.append(m); durs.append(dur(m))
    print("durs:",[round(d,1) for d in durs])

# ---------- widgets ----------
def matrix_obj():
    return {"title":"实验设计 · 真实端点 · 先测容量再看施压","rows":[
        {"k":"被测",   "v":f"<b>{MODEL}</b> · Higress 网关 · OpenAI 兼容端点"},
        {"k":"硬件",   "v":f"<b>{HW}</b>"},
        {"k":"压测器", "v":"<b>guidellm</b> · <code>benchmark run</code>"},
        {"k":"负载",   "v":"<b>合成</b> · 输入 512 / 输出 128 token · 全程锁死"},
        {"k":"步骤①", "v":"<b>容量扫描</b> concurrent 1→128 · 画曲线、找拐点"},
        {"k":"步骤②", "v":"拐点附近按 <b>rate-type</b> 各跑一遍"},
        {"k":"关键问题","v":"容量多少?换施压方式,<b>数字差多少</b>?",
                        "hi":True, "note":"← 先扫容量,再谈施压"},
    ]}
def full_obj():
    return {"cols":["rate-type","并发","req/s","tok/s","延迟 p95","TTFT p95"],"rows":[
        {"c":"synchronous","cells":[f"{SY['conc']:.0f}",f"{SY['rps']:.2f}",f"{SY['tps']:.0f}",secs(SY['lat95']),ms(SY['ttft95'])]},
        {"c":f"constant {OP_RATE}/s","knee":True,"cells":[f"{CO['conc']:.0f}",f"{CO['rps']:.2f}",f"{CO['tps']:.0f}",secs(CO['lat95']),ms(CO['ttft95'])]},
        {"c":f"poisson {OP_RATE}/s","cells":[f"{PO['conc']:.0f}",f"{PO['rps']:.2f}",f"{PO['tps']:.0f}",secs(PO['lat95']),ms(PO['ttft95'])]},
        {"c":"throughput","cells":[f"{TH['conc']:.0f}",f"{TH['rps']:.2f}",f"{TH['tps']:.0f}",secs(TH['lat95']),ms(TH['ttft95'])]},
    ]}
def scenario_obj():
    return {"title":"什么时候用哪个 rate-type","rows":[
        {"k":"synchronous","v":"一次一条 → 测<b>延迟地板</b> · 单请求基线 / SLA 最优值"},
        {"k":"constant",   "v":"固定 QPS 匀速 → <b>稳态运营</b> · 目标 QPS 下稳不稳"},
        {"k":"poisson",    "v":"均值 + 突发到达 → 贴近<b>真实流量</b> · 压尾延迟 / 看余量"},
        {"k":"throughput", "v":"并发拉满 → 测<b>吞吐天花板</b> · 算副本数、做容量规划"},
        {"k":"sweep",      "v":"自动扫全谱 → 一条命令画曲线、找 <b>拐点</b>"},
    ]}

# ---------- chapters ----------
CHAP=[  # (li, step, dot, acts)
 (1,"② 压测器就位 · 合成负载锁死","var(--cyan)",[
    {"clear":True},
    {"cmd":"export URL=http://…:30888   MODEL=Qwen2.5-0.5B  # 端点已脱敏","cps":48,"after":150},
    {"out":"<span class='ok'>✓</span> guidellm 0.4  ·  processor Qwen2.5  ·  链路通 →","after":150},
    {"cmd":"guidellm benchmark run --target $URL --model $MODEL \\","cps":54,"after":80},
    {"cmd":"  --data 'prompt_tokens=512,output_tokens=128'  # 先扫容量","cps":56,"after":200},
 ]),
 (2,"③ 容量扫描 · 并发 1→192","var(--cyan)",[
    {"clear":True},
    {"cmd":"guidellm … --rate-type concurrent --rate 1,2,4,…,192","cps":52,"after":200},
    {"img":f"{FIG}/fig-sweep.png","cap":f"吞吐见顶 <b>~{MAX_RPS:.0f} req/s</b>(打满过头反而掉)· 拐点 <b>并发 {KNEE_CONC} · {KNEE_RPS} req/s</b>","after":200},
 ]),
 (3,"④ 拐点 · 四种施压的落点","var(--amber)",[
    {"clear":True},
    {"img":f"{FIG}/fig-curve.png","cap":"synchronous 延迟地板 · throughput 吞吐天花板 · <b>constant / poisson 落在拐点</b>","after":220},
 ]),
 (4,"⑤ constant vs poisson · 同均值,不同尾巴","var(--rose)",[
    {"clear":True},
    {"cmd":f"guidellm … --rate-type constant --rate {OP_RATE}   # 匀速","cps":52,"after":200},
    {"out":f"并发 <b>{CO['conc']:.1f}</b>  ·  吞吐 <b>{CO['rps']:.2f}</b> req/s  ·  p95 延迟 <b class='ok'>{secs(CO['lat95'])}</b>","after":170},
    {"cmd":f"guidellm … --rate-type poisson  --rate {OP_RATE}   # 同均值,突发到达","cps":52,"after":200},
    {"out":f"并发 <b class='am'>{PO['conc']:.1f}</b>  ·  吞吐 <b>{PO['rps']:.2f}</b> req/s  ·  p95 延迟 <b class='am'>{secs(PO['lat95'])}</b>","after":170},
    {"out":f"<span class='muted'>均值没变,只是到达抖了 → 并发 {CO['conc']:.1f}→{PO['conc']:.1f},p95 {secs(CO['lat95'])}→{secs(PO['lat95'])}。真实流量的样子</span>","after":140},
 ]),
 (5,"⑥ 四合一 · 同端点 × 四施压","var(--cyan)",[
    {"clear":True},
    {"img":f"{FIG}/fig-ratetype.png","cap":f"吞吐 <b>{SY['rps']:.2f} → {TH['rps']:.2f}</b> req/s · p95 <b>{secs(SY['lat95'])} → {secs(TH['lat95'])}</b> —— 同一个端点","after":220},
 ]),
 (6,"⑦ 选型 · 什么时候用哪个","var(--amber)",[
    {"clear":True},
    {"cmd":"guidellm rate-type · 场景选型速查","cps":56,"after":240},
    {"matrix":scenario_obj(),"after":200},
 ]),
 (7,"⑧ 自己测一遍","var(--violet)",[
    {"clear":True},
    {"out":"<span class='muted'>先扫容量找拐点,再按 rate-type 各跑一遍:</span>","after":140},
    {"out":f"吞吐 <b class='cy'>{SY['rps']:.2f} → {TH['rps']:.2f}</b> req/s  ·  p95 延迟 <b class='ro'>{secs(SY['lat95'])} → {secs(TH['lat95'])}</b>","after":150},
    {"out":"<span class='am'>⚠ 报数带三件套:并发 / 到达模型 / p95 —— 别只报一个数</span>","after":160},
    {"out":"<span class='cy'>$ guidellm benchmark run --rate-type concurrent --rate 1,2,4,…,192   # 换成你的端点</span>","after":160},
 ]),
]

# ---------- schedule ----------
settle = int(durs[0]*1000)+200
chapters=[]; offsets={0:250}; cur=settle
for li,step,dot,acts in CHAP:
    ms_=int(durs[li]*1000)+150
    chapters.append({"step":step,"dot":dot,"ms":ms_,"acts":acts})
    offsets[li]=cur+120; cur+=ms_
play={"settle":settle,"introStep":"① 实验设计 · 真实端点 · 先测容量再看施压","intro":[{"matrix":matrix_obj()}],"chapters":chapters}
json.dump(play, open(os.path.join(DIR,"play.json"),"w"), ensure_ascii=False)
print(f"play ≈ {cur/1000:.1f}s")
if PREVIEW:
    print("PREVIEW: wrote play.json only"); raise SystemExit(0)

# ---------- record ----------
print("recording terminal…"); run(["node",RECORD_MJS]); print("recorded",dur(TERM),"s")

# ---------- narration track ----------
inp=[]; parts=[]
for i,m in enumerate(mp3):
    off=offsets[i]; inp+=["-i",m]; parts.append(f"[{i}:a]adelay={off}|{off}[a{i}]")
mix="".join(f"[a{i}]" for i in range(len(mp3)))+f"amix=inputs={len(mp3)}:normalize=0[narr]"
narr=os.path.join(DIR,"narration_term.wav")
run(["ffmpeg","-y",*inp,"-filter_complex",";".join(parts)+";"+mix,"-map","[narr]",narr])
narr_end=max(offsets[i]/1000+durs[i] for i in range(len(mp3)))

# ---------- subtitles ----------
def _chunks(text,maxlen=17):
    ps=re.split(r"([,,。!?!?、;;:—])",text); segs=[]; cur=""
    for i in range(0,len(ps),2):
        seg=ps[i]+(ps[i+1] if i+1<len(ps) else "")
        if not seg: continue
        if len(cur)+len(seg)<=maxlen: cur+=seg
        else:
            if cur: segs.append(cur)
            cur=seg
    if cur: segs.append(cur)
    P="，。！？、；：— ,.!?;: "
    return [c.strip(P) for c in segs if c.strip(P)]
def _ts(t): h=int(t//3600);m=int(t%3600//60);s=t%60;return f"{h:d}:{m:02d}:{s:05.2f}"
ASS="/tmp/gd_term_subs.ass"
head=("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n"
      "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
      "Style: Cap,PingFang SC,52,&H00FFFFFF,&H00FFFFFF,&H00101014,&H00000000,1,0,0,0,100,100,0,0,1,5,2,2,80,80,430,1\n\n"
      "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
ev=[]
for i,text in enumerate(LINES):
    st=offsets[i]/1000.0; d=durs[i]; cks=_chunks(text); tot=sum(len(c) for c in cks) or 1; t=st
    for c in cks:
        seg=d*len(c)/tot; ev.append(f"Dialogue: 0,{_ts(t)},{_ts(t+seg)},Cap,,0,0,0,,{c}"); t+=seg
open(ASS,"w",encoding="utf-8").write(head+"\n".join(ev)+"\n")

# ---------- freeze-pad + burn subs + mux ----------
vd=dur(TERM); target=max(vd,narr_end)+0.6; pad=max(0.0,target-vd)
vpad=os.path.join(DIR,"_tpad.mp4")
run(["ffmpeg","-y","-i",TERM,"-vf",f"tpad=stop_mode=clone:stop_duration={pad:.2f},subtitles={ASS}",
     "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p","-r","30","-t",f"{target:.2f}",vpad])
os.makedirs(os.path.dirname(OUT),exist_ok=True)
run(["ffmpeg","-y","-i",vpad,"-i",narr,"-map","0:v","-map","1:a","-shortest",
     "-c:v","copy","-c:a","aac","-b:a","192k",OUT])
os.remove(vpad)
print(f"DONE Act2 -> {OUT}  {dur(OUT):.1f}s")
