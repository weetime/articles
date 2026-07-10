#!/usr/bin/env python3
"""Mux composited frames + 8 timed narration segs + BGM into the final portrait cut."""
import os, subprocess

SP    = "/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour"
OFR   = f"{SP}/oframes"
FPS   = 30
VIEW  = 6.6
NSEG  = 8
HERE  = os.path.dirname(os.path.abspath(__file__))
BGM   = os.path.join(HERE, "..", "2026-07-mcp-chronicle", "bgm-clean.wav")
OUT   = os.path.join(HERE, "video-portrait.mp4")

nframes = len([f for f in os.listdir(OFR) if f.endswith(".png")])
dur = nframes / FPS

inputs = ["-framerate", str(FPS), "-i", f"{OFR}/%05d.png"]
for i in range(NSEG):
    inputs += ["-i", os.path.join(HERE, f"seg{i}.mp3")]
inputs += ["-i", BGM]
BGI = 1 + NSEG  # bgm input index

fc = []
for i in range(NSEG):
    ms = round(i * VIEW * 1000)
    fc.append(f"[{i+1}:a]adelay={ms}|{ms}[v{i}]")
fc.append("".join(f"[v{i}]" for i in range(NSEG)) +
          f"amix=inputs={NSEG}:normalize=0:dropout_transition=0[voice]")
fc.append(f"[{BGI}:a]atrim=0:{dur:.2f},volume=0.10,afade=t=out:st={dur-2:.2f}:d=2[bg]")
fc.append("[voice][bg]amix=inputs=2:normalize=0:dropout_transition=0[mx];[mx]alimiter=limit=0.95[a]")

cmd = ["ffmpeg", "-y", *inputs,
       "-filter_complex", ";".join(fc),
       "-map", "0:v", "-map", "[a]",
       "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "20",
       "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
       "-t", f"{dur:.2f}", OUT]
print("frames", nframes, "dur", round(dur, 2))
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.stderr[-800:] if r.returncode else "OK -> " + OUT)
