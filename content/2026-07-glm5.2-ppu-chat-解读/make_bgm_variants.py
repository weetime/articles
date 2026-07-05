#!/usr/bin/env python3
# 零版权程序合成 BGM —— 4 种情绪变体,生成短预览供试听。
# 用法: python make_bgm_variants.py preview   → previews/bgm-<style>.wav (各 15s)
#       python make_bgm_variants.py <style> <seconds> <outfile>  → 出完整成片 BGM
import sys, os
import numpy as np
from scipy.signal import fftconvolve

SR = 44100

# ---- 4 种风格(BPM / 和弦进行 / 是否有鼓 / 琶音密度 / 明暗) ----
STYLES = {
    # 极简科技:柔和四踩 + 琶音,中性不抢戏(当前默认)
    "minimal":  dict(bpm=92,  drums="soft", arp=2, pad=0.9, bright=1.0,
                     chords=[[130.81,196.00,261.63,329.63],[196.00,246.94,392.00,493.88],
                             [220.00,261.63,329.63,440.00],[174.61,261.63,349.23,440.00]],
                     root=[65.41,98.00,110.00,87.31]),
    # 纪录片氛围:无鼓,pad 为主,舒缓庄重,适合"中立讲解"
    "ambient":  dict(bpm=70,  drums="none", arp=1, pad=1.4, bright=0.82,
                     chords=[[130.81,196.00,261.63,392.00],[146.83,220.00,293.66,440.00],
                             [110.00,164.81,261.63,329.63],[174.61,261.63,349.23,523.25]],
                     root=[65.41,73.42,55.00,87.31]),
    # 明快科技:更快更亮,琶音密,配合快语速,有推进感
    "upbeat":   dict(bpm=112, drums="punchy", arp=3, pad=0.7, bright=1.18,
                     chords=[[146.83,220.00,293.66,369.99],[196.00,293.66,392.00,493.88],
                             [164.81,246.94,329.63,440.00],[130.81,196.00,261.63,392.00]],
                     root=[73.42,98.00,82.41,65.41]),
    # Lo-fi 专注:暖、慵懒摇摆,七和弦,现代 chill
    "lofi":     dict(bpm=82,  drums="swing", arp=2, pad=1.0, bright=0.9,
                     chords=[[130.81,196.00,246.94,329.63],[110.00,164.81,220.00,311.13],
                             [146.83,220.00,277.18,349.23],[196.00,246.94,329.63,440.00]],
                     root=[65.41,55.00,73.42,98.00]),
}


def synth(style, total, seed=7):
    rng = np.random.default_rng(seed)
    P = STYLES[style]
    bpm = P["bpm"]; beat = 60.0/bpm; n = int(total*SR)
    L = np.zeros(n); R = np.zeros(n)
    arp_buf = np.zeros(n); pad_buf = np.zeros(n)
    def add(buf, start, sig):
        s = int(start*SR); e = min(s+len(sig), n)
        if s < n: buf[s:e] += sig[:e-s]
    def env(dur, a=0.005, d=0.9):
        L2 = int(dur*SR); t = np.linspace(0,1,L2)
        return np.minimum(t/max(a,1e-4), 1) * np.exp(-d*t*3)
    def kick(amp):
        d=0.16; t=np.linspace(0,d,int(d*SR)); f=110*np.exp(-t*32)+45
        return amp*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*10)
    def hat(amp):
        d=0.05; nz=rng.standard_normal(int(d*SR)); return amp*nz*np.exp(-np.linspace(0,1,len(nz))*40)
    def pluck(freq,dur,amp,bright):
        t=np.linspace(0,dur,int(dur*SR))
        sig=(np.sin(2*np.pi*freq*t)+0.35*bright*np.sin(2*np.pi*2*freq*t))*env(dur,0.004,1.1)
        return amp*sig
    def bass(freq,dur,amp):
        t=np.linspace(0,dur,int(dur*SR))
        return amp*(np.sin(2*np.pi*freq*t)+0.2*np.sin(2*np.pi*2*freq*t))*env(dur,0.01,0.7)

    total_beats=int(total/beat)
    for b in range(total_beats):
        tb=b*beat; ci=(b//4)%4; ch=P["chords"][ci]
        if P["drums"]!="none":
            ka={"soft":0.5,"punchy":0.66,"swing":0.44}[P["drums"]]
            add(L,tb,kick(ka)); add(R,tb,kick(ka))
            hoff = beat*(0.66 if P["drums"]=="swing" else 0.5)
            add(L,tb+hoff,hat(0.10)*0.9); add(R,tb+hoff,hat(0.11))
        # bass 根音
        bamp=0.4 if b%2==0 else 0.28
        add(L,tb,bass(P["root"][ci],beat*0.92,bamp)); add(R,tb,bass(P["root"][ci],beat*0.92,bamp))
        # arp
        for k in range(P["arp"]):
            note=ch[(b*P["arp"]+k)%len(ch)]
            add(arp_buf, tb+k*beat/P["arp"], pluck(note,beat/P["arp"]*1.05,0.11*P["bright"],P["bright"]))
    # pad(每和弦持续)
    for bar in range(int(total/(4*beat))+1):
        ci=bar%4; ch=P["chords"][ci]; dur=4*beat*1.02
        t=np.linspace(0,dur,int(dur*SR)); seg=np.zeros(len(t))
        for f in ch: seg+=np.sin(2*np.pi*f*t)
        seg*=0.05*P["pad"]*np.minimum(t/0.4,1)*np.minimum((dur-t)/0.5,1)
        add(pad_buf, bar*4*beat, seg)
    # reverb on arp+pad
    ir=np.exp(-np.linspace(0,1,int(0.5*SR))*5)*rng.standard_normal(int(0.5*SR))*0.3
    wet=fftconvolve(arp_buf+pad_buf, ir)[:n]
    mix=arp_buf+pad_buf+0.5*wet
    L+=mix; R+=mix*0.98
    out=np.stack([L,R],1)
    # 全局淡入淡出 + 归一
    fi=int(2.5*SR); fo=int(2.0*SR)
    out[:fi]*=np.linspace(0,1,fi)[:,None]; out[-fo:]*=np.linspace(1,0,fo)[:,None]
    out/=max(np.abs(out).max(),1e-6); out*=0.82
    return (out*32767).astype(np.int16)


def write(path, data):
    import wave
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with wave.open(path,"w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())


if __name__=="__main__":
    if sys.argv[1]=="preview":
        for st in STYLES:
            write(f"previews/bgm-{st}.wav", synth(st, 15.0))
            print(f"previews/bgm-{st}.wav  ({STYLES[st]['bpm']} BPM, drums={STYLES[st]['drums']})")
    else:
        st=sys.argv[1]; sec=float(sys.argv[2]); out=sys.argv[3]
        write(out, synth(st, sec)); print(f"{out}  style={st}")
