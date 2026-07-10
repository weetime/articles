#!/usr/bin/env python3
"""Assemble the tour with PPT-style transitions + whoosh SFX (no BGM):
   intro(constellation zoom) -> 7 site clips -> outro, xfade(slide) between all,
   whoosh at each transition, 7 timed narration segs."""
import os, json, subprocess

SP    = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
OFR   = f"{SP}/oframes"
FPS   = 30
NSEG  = 7
COUNTS = json.load(open(f"{SP}/sites.json"))        # actual frames per site
BOUND  = [sum(COUNTS[:k]) for k in range(NSEG+1)]   # cumulative frame boundaries
HERE  = os.path.dirname(os.path.abspath(__file__))
INTRO = os.path.join(HERE, "cards", "card-00.png")
OUTRO = os.path.join(HERE, "cards", "outro.png")
WHOOSH= os.path.join(HERE, "whoosh.wav")
OUT   = os.path.join(HERE, "video-portrait.mp4")

INTRO_DUR, OUTRO_DUR, XF = 3.0, 3.2, 0.5
TRANS = "slideleft"                       # PPT「推入」感

# clip durations: intro, 7 sites (actual), outro
D = [INTRO_DUR] + [COUNTS[k]/FPS for k in range(NSEG)] + [OUTRO_DUR]
# chained-xfade offsets + running total
offsets, running = [], D[0]
for i in range(1, len(D)):
    offsets.append(round(running - XF, 3)); running = round(running + D[i] - XF, 3)
TOTAL = running

inputs  = ["-loop","1","-t",f"{INTRO_DUR}","-i",INTRO,
           "-framerate",str(FPS),"-i",f"{OFR}/%05d.png",
           "-loop","1","-t",f"{OUTRO_DUR}","-i",OUTRO]
for i in range(NSEG):
    inputs += ["-i", os.path.join(HERE, f"seg{i}.mp3")]
inputs += ["-i", WHOOSH]                  # last input = whoosh
WHI = 3 + NSEG

fc = []
fc.append(f"[0:v]scale=8000:-1,zoompan=z='min(zoom+0.0009,1.12)':d={round(INTRO_DUR*FPS)}:"
          f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},settb=1/{FPS},setsar=1,format=yuv420p[iv]")
fc.append(f"[2:v]fps={FPS},scale=1080:1920,settb=1/{FPS},setsar=1,format=yuv420p[ov]")
# slice body into 7 site clips (actual frame boundaries)
for k in range(NSEG):
    fc.append(f"[1:v]trim=start_frame={BOUND[k]}:end_frame={BOUND[k+1]},setpts=PTS-STARTPTS,"
              f"fps={FPS},scale=1080:1920,settb=1/{FPS},setsar=1,format=yuv420p[b{k}]")
# xfade chain: iv + b0..b6 + ov
prev = "iv"
for k in range(NSEG):
    fc.append(f"[{prev}][b{k}]xfade=transition={TRANS}:duration={XF}:offset={offsets[k]}[c{k}]")
    prev = f"c{k}"
fc.append(f"[{prev}][ov]xfade=transition=fade:duration={XF}:offset={offsets[NSEG]}[vx]")
fc.append(f"[vx]fade=t=in:st=0:d=0.4,fade=t=out:st={TOTAL-0.6:.2f}:d=0.6[v]")

# audio: narration per site (aligned to when it fades in) + whoosh at each transition
for i in range(NSEG):
    t = offsets[i] + XF - 0.2                   # site i fully in ≈ offsets[i]+XF
    ms = max(0, round(t*1000))
    fc.append(f"[{3+i}:a]adelay={ms}|{ms}[n{i}]")
# whoosh at every transition (asplit the single sfx into len(offsets) copies)
nof = len(offsets)
fc.append(f"[{WHI}:a]asplit={nof}" + "".join(f"[w{j}]" for j in range(nof)))
for j in range(nof):
    ms = max(0, round(offsets[j]*1000))
    fc.append(f"[w{j}]adelay={ms}|{ms},volume=0.7[ws{j}]")
alla = "".join(f"[n{i}]" for i in range(NSEG)) + "".join(f"[ws{j}]" for j in range(nof))
fc.append(f"{alla}amix=inputs={NSEG+nof}:normalize=0:dropout_transition=0[mx];[mx]alimiter=limit=0.95[a]")

cmd = ["ffmpeg","-y",*inputs,"-filter_complex",";".join(fc),
       "-map","[v]","-map","[a]","-r",str(FPS),
       "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
       "-c:a","aac","-b:a","192k","-t",f"{TOTAL:.2f}",OUT]
print(f"sites {NSEG} | offsets {offsets} | total {TOTAL:.1f}s")
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.stderr[-1400:] if r.returncode else "OK -> " + OUT)
