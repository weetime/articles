#!/usr/bin/env python3
# 更燃版程序合成 BGM —— 高 BPM + 重踩 + 每 8 拍 riser 拉升冲下拍 + 密踩镲 + 亮琶音。零版权。
# 用法: python make_bgm_hype.py preview           → previews/bgm-<style>.wav (各 16s)
#       python make_bgm_hype.py <style> <sec> <out> → 完整成片 BGM
import sys, os, wave
import numpy as np
from scipy.signal import fftconvolve

SR = 44100

STYLES = {
    # 燃·驱动:128 BPM 四踩 + 背拍拍手 + 16 分踩镲 + 八分驱动贝斯 + riser,能量强推进
    "hype":   dict(bpm=128, kick=0.92, clap=0.5, hats=16, bass="eighth", arp=4, pad=0.55, bright=1.22, build=1, riser=1,
                   chords=[[146.83,220.00,293.66,369.99],[196.00,293.66,392.00,493.88],
                           [164.81,246.94,329.63,440.00],[130.81,196.00,261.63,392.00]],
                   root=[73.42,98.00,82.41,65.41]),
    # 燃·重砸:130 BPM,更重 kick + offbeat 低贝斯 + 双 riser,banger 感
    "banger": dict(bpm=130, kick=1.0, clap=0.55, hats=16, bass="eighth", arp=3, pad=0.5, bright=1.18, build=1, riser=1,
                   chords=[[130.81,196.00,261.63,329.63],[110.00,164.81,220.00,311.13],
                           [146.83,220.00,293.66,369.99],[164.81,246.94,329.63,415.30]],
                   root=[65.41,55.00,73.42,82.41]),
    # 燃·史诗:122 BPM,每拍重 kick + 弦乐 stab 脉冲 + riser,预告片式冲击
    "epic":   dict(bpm=122, kick=0.98, clap=0.6, hats=8, bass="root", arp=0, pad=1.0, bright=1.0, build=1, riser=1, stab=1,
                   chords=[[130.81,196.00,261.63,392.00],[110.00,164.81,220.00,329.63],
                           [146.83,220.00,293.66,440.00],[123.47,185.00,246.94,370.00]],
                   root=[65.41,55.00,73.42,61.74]),
}


def synth(style, total, seed=17):
    rng = np.random.default_rng(seed)
    P = STYLES[style]; bpm=P["bpm"]; beat=60.0/bpm; n=int(total*SR)
    L=np.zeros(n); R=np.zeros(n); arp_buf=np.zeros(n); pad_buf=np.zeros(n); fx=np.zeros(n)
    def add(buf,start,sig):
        s=int(start*SR); e=min(s+len(sig),n)
        if s<n: buf[s:e]+=sig[:e-s]
    def env(dur,a=0.005,d=0.9):
        L2=int(dur*SR); t=np.linspace(0,1,L2); return np.minimum(t/max(a,1e-4),1)*np.exp(-d*t*3)
    def kick(amp):
        d=0.19; t=np.linspace(0,d,int(d*SR)); f=135*np.exp(-t*32)+50
        body=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8.5)
        click=rng.standard_normal(int(0.006*SR))*np.exp(-np.linspace(0,1,int(0.006*SR))*30)
        out=amp*body; out[:len(click)]+=amp*0.5*click; return out
    def clap(amp):
        d=0.15; nz=rng.standard_normal(int(d*SR)); e=np.exp(-np.linspace(0,1,len(nz))*15)
        return amp*nz*e
    def hat(amp,d=0.04):
        nz=rng.standard_normal(int(d*SR)); return amp*nz*np.exp(-np.linspace(0,1,len(nz))*46)
    def pluck(freq,dur,amp,bright):
        t=np.linspace(0,dur,int(dur*SR)); saw=2*(t*freq-np.floor(0.5+t*freq))
        sig=((1-0.4*bright)*np.sin(2*np.pi*freq*t)+0.4*bright*saw)*env(dur,0.004,1.0); return amp*sig
    def bassv(freq,dur,amp):
        t=np.linspace(0,dur,int(dur*SR)); return amp*(np.sin(2*np.pi*freq*t)+0.25*np.sin(2*np.pi*2*freq*t))*env(dur,0.008,0.7)
    def riser(dur):
        L2=int(dur*SR); t=np.linspace(0,1,L2); nz=rng.standard_normal(L2)
        # 上升白噪 + 频率上扫,末尾拉满
        sweep=np.sin(2*np.pi*np.cumsum(200+2600*t**2)/SR)
        e=t**2.2
        return (0.5*nz*e + 0.5*sweep*e)*0.5

    total_beats=int(total/beat)
    def energy(b):
        if not P.get("build"): return 1.0
        return 0.5+0.5*min(1.0, b/(total_beats*0.65))
    for b in range(total_beats):
        tb=b*beat; ci=(b//4)%4; ch=P["chords"][ci]; E=energy(b)
        add(L,tb,kick(P["kick"])); add(R,tb,kick(P["kick"]))
        # epic:每拍重 kick 已在上;其余四踩已含
        if P.get("clap") and b%4 in (1,3):
            add(L,tb,clap(P["clap"])*0.95); add(R,tb,clap(P["clap"]))
        if P["hats"]:
            steps=P["hats"]//4
            for k in range(steps):
                acc=1.35 if k==0 else 1.0
                add(L,tb+k*beat/steps,hat(0.085*E*acc)*0.9); add(R,tb+k*beat/steps,hat(0.095*E*acc))
        if P["bass"]=="root":
            add(L,tb,bassv(P["root"][ci],beat*0.92,0.44)); add(R,tb,bassv(P["root"][ci],beat*0.92,0.44))
        elif P["bass"]=="offbeat":
            add(L,tb+beat*0.5,bassv(P["root"][ci],beat*0.45,0.4*E)); add(R,tb+beat*0.5,bassv(P["root"][ci],beat*0.45,0.4*E))
        elif P["bass"]=="eighth":
            for k in range(2):
                add(L,tb+k*beat*0.5,bassv(P["root"][ci],beat*0.46,0.36*E)); add(R,tb+k*beat*0.5,bassv(P["root"][ci],beat*0.46,0.36*E))
        if P["arp"]:
            for k in range(P["arp"]):
                note=ch[(b*P["arp"]+k)%len(ch)]
                add(arp_buf,tb+k*beat/P["arp"],pluck(note,beat/P["arp"]*1.02,0.11*P["bright"]*E,P["bright"]))
        if P.get("stab"):
            for k in range(2):
                t=np.linspace(0,beat*0.4,int(beat*0.4*SR)); seg=np.zeros(len(t))
                for f in ch: seg+=np.sin(2*np.pi*f*t)
                seg*=0.07*E*env(beat*0.4,0.006,2.2); add(pad_buf,tb+k*beat*0.5,seg)
        # riser:每 8 拍的最后 2 拍拉升,冲向下一个 8 拍下拍
        if P.get("riser") and b%8==6:
            add(fx,tb,riser(beat*2*0.98)*E)
    if not P.get("stab"):
        for bar in range(int(total/(4*beat))+1):
            ci=bar%4; ch=P["chords"][ci]; dur=4*beat*1.02
            t=np.linspace(0,dur,int(dur*SR)); seg=np.zeros(len(t))
            for f in ch: seg+=np.sin(2*np.pi*f*t)
            seg*=0.042*P["pad"]*np.minimum(t/0.4,1)*np.minimum((dur-t)/0.5,1)
            add(pad_buf,bar*4*beat,seg)
    ir=np.exp(-np.linspace(0,1,int(0.4*SR))*5)*rng.standard_normal(int(0.4*SR))*0.28
    wet=fftconvolve(arp_buf+pad_buf,ir)[:n]
    mix=arp_buf+pad_buf+0.45*wet+0.6*fx; L+=mix; R+=mix*0.98
    out=np.stack([L,R],1)
    fi=int(1.5*SR); fo=int(2.0*SR)
    out[:fi]*=np.linspace(0,1,fi)[:,None]; out[-fo:]*=np.linspace(1,0,fo)[:,None]
    out/=max(np.abs(out).max(),1e-6); out*=0.86
    return (out*32767).astype(np.int16)


def write(path,data):
    os.makedirs(os.path.dirname(path) or ".",exist_ok=True)
    with wave.open(path,"w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())

if __name__=="__main__":
    if sys.argv[1]=="preview":
        for st in STYLES:
            write(f"previews/bgm-{st}.wav", synth(st,16.0)); print(f"previews/bgm-{st}.wav  ({STYLES[st]['bpm']} BPM)")
    else:
        write(sys.argv[3], synth(sys.argv[1], float(sys.argv[2]))); print(f"{sys.argv[3]} style={sys.argv[1]}")
