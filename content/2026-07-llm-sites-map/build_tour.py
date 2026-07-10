#!/usr/bin/env python3
"""盘点排行榜 assembly (editorial): intro → [榜单动画 → 榜首实操] ×9 → outro,
   slide transitions + whoosh, intro hook + 9 per-category narrations, no BGM."""
import os, json, subprocess

SP    = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
OFR   = f"{SP}/oframes"
LB    = f"{SP}/lb"
FPS   = 30
NCAT  = 9
XF    = 0.5
TRANS = "slideleft"
HERE  = os.path.dirname(os.path.abspath(__file__))
INTRO_IMG=f"{HERE}/cards/intro.png"; OUTRO_IMG=f"{HERE}/cards/outro.png"; WHOOSH=f"{HERE}/whoosh.wav"
INTRO_MP3=f"{HERE}/intro.mp3"; OUT=f"{HERE}/video-portrait.mp4"

def probe(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p],capture_output=True,text=True).stdout.strip())
COUNTS=json.load(open(f"{SP}/sites.json")); BOUND=[sum(COUNTS[:k]) for k in range(NCAT+1)]
LB_FR=len(os.listdir(f"{LB}/0")); LB_DUR=LB_FR/FPS
INTRO_DUR=round(probe(INTRO_MP3)+0.9,2); OUTRO_DUR=3.4

# clip durations in order: intro, (lb_k, demo_k)*9, outro
D=[INTRO_DUR]
for k in range(NCAT): D += [LB_DUR, COUNTS[k]/FPS]
D += [OUTRO_DUR]
offsets, running = [], D[0]
for i in range(1,len(D)): offsets.append(round(running-XF,3)); running=round(running+D[i]-XF,3)
TOTAL=running

# inputs
inputs=["-loop","1","-t",f"{INTRO_DUR}","-i",INTRO_IMG,
        "-framerate",str(FPS),"-i",f"{OFR}/%05d.png",
        "-loop","1","-t",f"{OUTRO_DUR}","-i",OUTRO_IMG]
LB_BASE=3
for k in range(NCAT): inputs += ["-framerate",str(FPS),"-i",f"{LB}/{k}/%04d.png"]
SEG_BASE=LB_BASE+NCAT
inputs += ["-i",INTRO_MP3]
for k in range(NCAT): inputs += ["-i",f"{HERE}/seg{k}.mp3"]
WHI=SEG_BASE+1+NCAT
inputs += ["-i",WHOOSH]

def V(i): return f"fps={FPS},scale=1080:1920,settb=1/{FPS},setsar=1,format=yuv420p"
fc=[]
fc.append(f"[0:v]{V(0)}[civ]")
fc.append(f"[2:v]{V(0)}[cov]")
for k in range(NCAT):
    fc.append(f"[{LB_BASE+k}:v]{V(0)}[lb{k}]")
    fc.append(f"[1:v]trim=start_frame={BOUND[k]}:end_frame={BOUND[k+1]},setpts=PTS-STARTPTS,{V(0)}[dm{k}]")
labels=["civ"]
for k in range(NCAT): labels += [f"lb{k}", f"dm{k}"]
labels += ["cov"]
prev=labels[0]
for i in range(1,len(labels)):
    tr = "fade" if i==len(labels)-1 else TRANS
    fc.append(f"[{prev}][{labels[i]}]xfade=transition={tr}:duration={XF}:offset={offsets[i-1]}[x{i}]")
    prev=f"x{i}"
fc.append(f"[{prev}]fade=t=in:st=0:d=0.4,fade=t=out:st={TOTAL-0.6:.2f}:d=0.6[v]")

# audio
au=[]
au.append(f"[{SEG_BASE}:a]adelay=400|400[nintro]")
for k in range(NCAT):
    t=offsets[2*k]+XF-0.2; ms=max(0,round(t*1000))
    au.append(f"[{SEG_BASE+1+k}:a]adelay={ms}|{ms}[n{k}]")
nof=len(offsets)
au.append(f"[{WHI}:a]asplit={nof}"+"".join(f"[w{j}]" for j in range(nof)))
for j in range(nof):
    ms=max(0,round(offsets[j]*1000)); au.append(f"[w{j}]adelay={ms}|{ms},volume=0.6[ws{j}]")
mixn=1+NCAT+nof
alla="[nintro]"+"".join(f"[n{k}]" for k in range(NCAT))+"".join(f"[ws{j}]" for j in range(nof))
au.append(f"{alla}amix=inputs={mixn}:normalize=0:dropout_transition=0[mx];[mx]alimiter=limit=0.95[a]")

cmd=["ffmpeg","-y",*inputs,"-filter_complex",";".join(fc+au),
     "-map","[v]","-map","[a]","-r",str(FPS),
     "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
     "-c:a","aac","-b:a","192k","-t",f"{TOTAL:.2f}",OUT]
print(f"cats {NCAT} | clips {len(labels)} | total {TOTAL:.1f}s")
r=subprocess.run(cmd,capture_output=True,text=True)
print(r.stderr[-1500:] if r.returncode else "OK -> "+OUT)
