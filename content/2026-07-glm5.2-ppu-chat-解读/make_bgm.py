#!/usr/bin/env python3
# 技术分享风 BGM：柔和 four-on-floor kick + 反拍 hat + arpeggio + pad（程序合成，零版权）
# 用法: python make_bgm.py [out-dir]   → 写出 <out-dir>/bgm.wav（默认当前目录）
import os, sys
import numpy as np
from scipy.signal import fftconvolve, butter, lfilter
from scipy.io import wavfile

SR = 44100
TOTAL = 120.0
BPM = 92.0
beat = 60.0 / BPM
n_total = int(TOTAL * SR)

# I–V–vi–IV in C，每和弦 1 小节（4 拍）
CHORDS = [
    [130.81, 196.00, 261.63, 329.63],   # C  (C G C E)
    [196.00, 246.94, 392.00, 493.88],   # G
    [220.00, 261.63, 329.63, 440.00],   # Am
    [174.61, 261.63, 349.23, 440.00],   # F
]
ROOT = [65.41, 98.00, 110.00, 87.31]     # 低音根

L = np.zeros(n_total)
R = np.zeros(n_total)

def add(buf, start, sig):
    e = min(start + len(sig), len(buf))
    if start < 0 or start >= len(buf): return
    buf[start:e] += sig[:e - start]

def kick(amp=0.6):
    n = int(0.16 * SR); t = np.arange(n) / SR
    f = 110 * np.exp(-t / 0.03) + 45
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.10)
    return amp * s

def hat(amp=0.12):
    n = int(0.045 * SR)
    rng = np.random.default_rng(99)
    s = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.012)
    b, a = butter(4, 7000 / (SR / 2), btype='high')
    return amp * lfilter(b, a, s)

def pluck(freq, dur=0.20, amp=0.16):
    n = int(dur * SR); t = np.arange(n) / SR
    s = (np.sin(2*np.pi*freq*t) + 0.4*np.sin(2*np.pi*2*freq*t)
         + 0.2*np.sin(2*np.pi*3*freq*t))
    return amp * s * np.exp(-t / (dur*0.5))

def bass(freq, dur, amp=0.4):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2*np.pi*freq*t) + 0.25*np.sin(2*np.pi*2*freq*t)
    env = np.minimum(1, t/0.01) * np.exp(-t / (dur*0.7))
    return amp * s * env

# 整体拍点
total_beats = int(TOTAL / beat)
arp_buf = np.zeros(n_total)  # arp+pad 走混响
pad_buf = np.zeros(n_total)
hatv = hat()
for b in range(total_beats):
    tb = b * beat
    s = int(tb * SR)
    ci = (b // 4) % 4
    chord = CHORDS[ci]
    # kick 每拍（前 24s 渐入由全局淡入处理）
    add(L, s, kick()); add(R, s, kick())
    # 反拍 hat
    sh = int((tb + beat/2) * SR)
    add(L, sh, hatv*0.9); add(R, sh, hatv)
    # bass：每拍根音（第1、3拍重）
    bamp = 0.42 if b % 2 == 0 else 0.28
    add(L, s, bass(ROOT[ci], beat*0.9, bamp))
    add(R, s, bass(ROOT[ci], beat*0.9, bamp))
    # arpeggio：每拍 2 个 8 分音
    for k in range(2):
        sa = int((tb + k*beat/2) * SR)
        note = chord[(b*2 + k) % len(chord)] * 2.0
        p = pluck(note, 0.22, 0.13)
        add(arp_buf, sa, p*0.92); add(arp_buf, sa, p*0.0)  # 占位
    # 上面写错：分别写 L/R 在混响后处理；这里统一进 arp_buf（单声道源）

# 重新生成 arp（上面循环里 R 没写，简化为单源后面分立体）
arp_buf[:] = 0
for b in range(total_beats):
    tb = b * beat; ci = (b // 4) % 4; chord = CHORDS[ci]
    for k in range(2):
        sa = int((tb + k*beat/2) * SR)
        note = chord[(b*2 + k) % len(chord)] * 2.0
        add(arp_buf, sa, pluck(note, 0.22, 0.12))

# pad：每和弦持续（2 拍交叉），柔和
seg = int(4 * beat * SR); fade = int(0.5 * SR)
win = np.ones(seg + fade)
win[:fade] = np.hanning(2*fade)[:fade]; win[-fade:] = np.hanning(2*fade)[fade:]
for bar in range(int(TOTAL / (4*beat)) + 1):
    ci = bar % 4; chord = CHORDS[ci]
    s = int(bar * 4 * beat * SR)
    t = np.arange(seg + fade) / SR
    seg_sig = np.zeros(seg + fade)
    for fr in chord:
        seg_sig += (np.sin(2*np.pi*fr*t) + 0.3*np.sin(2*np.pi*2*fr*t))
    seg_sig *= 0.06 * win
    add(pad_buf, s, seg_sig)

# 混响（arp + pad）
ir_len = int(0.7 * SR); ti = np.arange(ir_len)/SR
rng = np.random.default_rng(5)
ir = rng.standard_normal(ir_len) * np.exp(-ti/0.22); ir /= np.abs(ir).sum()/5
wet = fftconvolve(arp_buf + pad_buf, ir)[:n_total]
melodic = 0.8*(arp_buf + pad_buf) + 0.3*wet

# 立体声：鼓居中，arp 轻微展宽
L += melodic; R += melodic
# 给 arp 一点立体声差（轻微延迟）
d = int(0.008*SR)
L[d:] += 0.12*arp_buf[:-d]; R[:-d] += 0.12*arp_buf[d:]

def fade_io(x, fi=1.5, fo=3.0):
    fin=int(fi*SR); fon=int(fo*SR)
    x[:fin]*=np.linspace(0,1,fin); x[-fon:]*=np.linspace(1,0,fon); return x
L=fade_io(L); R=fade_io(R)
peak=max(np.abs(L).max(), np.abs(R).max()); g=0.62/peak
out=np.stack([L*g, R*g],axis=1)
_outdir = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.getcwd()
wavfile.write(os.path.join(_outdir, "bgm.wav"), SR, (out*32767).astype(np.int16))
print("bgm.wav (tech groove)", round(TOTAL,1),"s  @",BPM,"BPM")
