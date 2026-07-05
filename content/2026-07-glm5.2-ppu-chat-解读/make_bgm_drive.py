#!/usr/bin/env python3
# 零版权程序合成 BGM —— 节奏推进型变体(驱动贝斯 / 背拍拍手 / 16分踩镲 / 渐进 build)。
# 用法: python make_bgm_drive.py preview            → previews/bgm-<style>.wav (各 16s)
#       python make_bgm_drive.py <style> <sec> <out> → 完整成片 BGM
import sys, os, wave
import numpy as np
from scipy.signal import fftconvolve

SR = 44100

# 节奏推进型:kick 四踩 / clap 背拍(2&4) / bass 模式 / hats 8或16分 / arp 密度 / build 渐进
STYLES = {
    # 驱动科技:四踩 + 背拍拍手 + 八分驱动贝斯 + 16分踩镲,能量渐进
    "drive":     dict(bpm=120, clap=1, hats=16, bass="eighth", arp=4, pad=0.7, bright=1.12, build=1,
                      chords=[[146.83,220.00,293.66,369.99],[196.00,293.66,392.00,493.88],
                              [164.81,246.94,329.63,440.00],[130.81,196.00,261.63,392.00]],
                      root=[73.42,98.00,82.41,65.41]),
    # 律动脉冲:四踩 + offbeat 贝斯(house 感)+ 八分和弦 stab,推进强
    "pulse":     dict(bpm=116, clap=1, hats=8,  bass="offbeat", arp=3, pad=0.6, bright=1.15, build=1,
                      chords=[[130.81,196.00,261.63,329.63],[174.61,261.63,349.23,440.00],
                              [146.83,220.00,293.66,369.99],[196.00,246.94,329.63,493.88]],
                      root=[65.41,87.31,73.42,98.00]),
    # 深浩室:四踩 + offbeat 开镲 + offbeat 贝斯,groovy 持续推进
    "house":     dict(bpm=123, clap=1, hats=8,  bass="offbeat", arp=2, pad=0.8, bright=1.05, build=0,
                      chords=[[130.81,196.00,246.94,329.63],[110.00,164.81,220.00,311.13],
                              [146.83,220.00,277.18,349.23],[164.81,246.94,329.63,415.30]],
                      root=[65.41,55.00,73.42,82.41]),
    # 科技预告片:每拍重 kick + 八分 staccato 和弦脉冲(弦乐感)+ 背拍,史诗渐进
    "trailer":   dict(bpm=100, clap=1, hats=0,  bass="root",   arp=0, pad=1.1, bright=0.95, build=1, stab=1,
                      chords=[[130.81,196.00,261.63,392.00],[110.00,164.81,220.00,329.63],
                              [146.83,220.00,293.66,440.00],[123.47,185.00,246.94,370.00]],
                      root=[65.41,55.00,73.42,61.74]),
    # 合成波:四踩 + 驱动八分贝斯 + 亮锯齿琶音,复古推进
    "synthwave": dict(bpm=110, clap=1, hats=16, bass="eighth", arp=4, pad=0.85, bright=1.25, build=0,
                      chords=[[130.81,196.00,261.63,329.63],[146.83,220.00,293.66,369.99],
                              [174.61,261.63,349.23,440.00],[196.00,293.66,392.00,493.88]],
                      root=[65.41,73.42,87.31,98.00]),
}


def synth(style, total, seed=11):
    rng = np.random.default_rng(seed)
    P = STYLES[style]; bpm=P["bpm"]; beat=60.0/bpm; n=int(total*SR)
    L=np.zeros(n); R=np.zeros(n); arp_buf=np.zeros(n); pad_buf=np.zeros(n)
    def add(buf,start,sig):
        s=int(start*SR); e=min(s+len(sig),n)
        if s<n: buf[s:e]+=sig[:e-s]
    def env(dur,a=0.005,d=0.9):
        L2=int(dur*SR); t=np.linspace(0,1,L2); return np.minimum(t/max(a,1e-4),1)*np.exp(-d*t*3)
    def kick(amp=0.72):
        d=0.17; t=np.linspace(0,d,int(d*SR)); f=120*np.exp(-t*34)+48
        return amp*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)
    def clap(amp=0.4):
        d=0.14; nz=rng.standard_normal(int(d*SR)); e=np.exp(-np.linspace(0,1,len(nz))*16)
        return amp*nz*e
    def hat(amp,d=0.045):
        nz=rng.standard_normal(int(d*SR)); return amp*nz*np.exp(-np.linspace(0,1,len(nz))*44)
    def pluck(freq,dur,amp,bright):
        t=np.linspace(0,dur,int(dur*SR))
        saw=2*(t*freq-np.floor(0.5+t*freq))  # saw for synthwave brightness
        sig=((1-0.4*bright)*np.sin(2*np.pi*freq*t)+0.4*bright*saw)*env(dur,0.004,1.0)
        return amp*sig
    def bass(freq,dur,amp):
        t=np.linspace(0,dur,int(dur*SR))
        return amp*(np.sin(2*np.pi*freq*t)+0.22*np.sin(2*np.pi*2*freq*t))*env(dur,0.008,0.7)

    total_beats=int(total/beat)
    def energy(b):  # build: 前段渐入能量
        if not P.get("build"): return 1.0
        return 0.45+0.55*min(1.0, b/(total_beats*0.7))
    for b in range(total_beats):
        tb=b*beat; ci=(b//4)%4; ch=P["chords"][ci]; E=energy(b)
        add(L,tb,kick()); add(R,tb,kick())                       # 四踩
        if P.get("clap") and b%4 in (1,3):                       # 背拍 2&4
            add(L,tb,clap()*0.95); add(R,tb,clap())
        if P["hats"]:                                            # 8 或 16 分踩镲
            steps=P["hats"]//(4)  # per beat
            for k in range(steps):
                add(L,tb+k*beat/steps,hat(0.09*E)*0.9); add(R,tb+k*beat/steps,hat(0.10*E))
        # bass
        if P["bass"]=="root":
            add(L,tb,bass(P["root"][ci],beat*0.92,0.42)); add(R,tb,bass(P["root"][ci],beat*0.92,0.42))
        elif P["bass"]=="offbeat":
            add(L,tb+beat*0.5,bass(P["root"][ci],beat*0.45,0.38*E)); add(R,tb+beat*0.5,bass(P["root"][ci],beat*0.45,0.38*E))
        elif P["bass"]=="eighth":
            for k in range(2):
                add(L,tb+k*beat*0.5,bass(P["root"][ci],beat*0.46,0.34*E)); add(R,tb+k*beat*0.5,bass(P["root"][ci],beat*0.46,0.34*E))
        # arp
        if P["arp"]:
            for k in range(P["arp"]):
                note=ch[(b*P["arp"]+k)%len(ch)]
                add(arp_buf,tb+k*beat/P["arp"],pluck(note,beat/P["arp"]*1.02,0.10*P["bright"]*E,P["bright"]))
        # staccato 和弦 stab(trailer)
        if P.get("stab"):
            for k in range(2):
                t=np.linspace(0,beat*0.4,int(beat*0.4*SR)); seg=np.zeros(len(t))
                for f in ch: seg+=np.sin(2*np.pi*f*t)
                seg*=0.06*E*env(beat*0.4,0.006,2.2)
                add(pad_buf,tb+k*beat*0.5,seg)
    # pad(非 trailer 走持续 pad)
    if not P.get("stab"):
        for bar in range(int(total/(4*beat))+1):
            ci=bar%4; ch=P["chords"][ci]; dur=4*beat*1.02
            t=np.linspace(0,dur,int(dur*SR)); seg=np.zeros(len(t))
            for f in ch: seg+=np.sin(2*np.pi*f*t)
            seg*=0.045*P["pad"]*np.minimum(t/0.4,1)*np.minimum((dur-t)/0.5,1)
            add(pad_buf,bar*4*beat,seg)
    ir=np.exp(-np.linspace(0,1,int(0.45*SR))*5)*rng.standard_normal(int(0.45*SR))*0.28
    wet=fftconvolve(arp_buf+pad_buf,ir)[:n]
    mix=arp_buf+pad_buf+0.45*wet; L+=mix; R+=mix*0.98
    out=np.stack([L,R],1)
    fi=int(2.0*SR); fo=int(2.0*SR)
    out[:fi]*=np.linspace(0,1,fi)[:,None]; out[-fo:]*=np.linspace(1,0,fo)[:,None]
    out/=max(np.abs(out).max(),1e-6); out*=0.82
    return (out*32767).astype(np.int16)


def write(path,data):
    os.makedirs(os.path.dirname(path) or ".",exist_ok=True)
    with wave.open(path,"w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())

if __name__=="__main__":
    if sys.argv[1]=="preview":
        for st in STYLES:
            write(f"previews/bgm-{st}.wav", synth(st,16.0))
            print(f"previews/bgm-{st}.wav  ({STYLES[st]['bpm']} BPM)")
    else:
        write(sys.argv[3], synth(sys.argv[1], float(sys.argv[2]))); print(f"{sys.argv[3]} style={sys.argv[1]}")
