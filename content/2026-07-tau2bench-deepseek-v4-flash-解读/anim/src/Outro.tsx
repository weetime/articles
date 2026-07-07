import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {MONO} from './ui';

const eo = Easing.out(Easing.cubic);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const l1 = interpolate(frame, [8, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [26, 52], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const line = interpolate(frame, [48, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const pts = interpolate(frame, [64, 96], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 96, fps, config: {damping: 200}});
  const brand = interpolate(frame, [112, 136], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Bg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: land ? '0 90px' : '0 80px 300px'}}>
        <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 600, color: C.cyan, opacity: l1, marginBottom: 30, letterSpacing: 1}}>一句话总结</div>
        <div style={{fontSize: 58, fontWeight: 850, lineHeight: 1.28, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 22}px)`}}>
          国产 PPU 已能承载
        </div>
        <div style={{fontSize: 58, fontWeight: 850, lineHeight: 1.28, textAlign: 'center', letterSpacing: -1, marginTop: 6, opacity: l2, transform: `translateY(${(1 - l2) * 22}px)`,
          background: `linear-gradient(100deg,${C.violet2},${C.cyan})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 24px ${C.violet}44)`}}>
          强大的 agent 模型
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 460]), height: 3, borderRadius: 2, margin: '44px 0',
          background: `linear-gradient(90deg,${C.violet},${C.cyan})`, boxShadow: `0 0 16px ${C.cyan}66`}} />

        <div style={{display: 'flex', gap: 20, opacity: pts, flexWrap: 'wrap', justifyContent: 'center'}}>
          <span style={{fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.green, border: `1px solid ${C.green}55`, borderRadius: 12, padding: '12px 24px', boxShadow: `0 0 18px ${C.green}22`}}>能力达标 · 工具/数据库 83–88%</span>
          <span style={{fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.rose, border: `1px solid ${C.rose}55`, borderRadius: 12, padding: '12px 24px', boxShadow: `0 0 18px ${C.rose}22`}}>稳定性待打磨 · 次次全过 67%</span>
        </div>

        <div style={{marginTop: 66, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 24, border: `2px solid ${C.cyan}66`, boxShadow: `0 0 40px ${C.cyan}33`}}>
            <Img src={staticFile('qrcode.png')} style={{width: 230, height: 230, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 22, fontSize: 27, fontWeight: 700, color: C.ink, opacity: brand, textAlign: 'center'}}>
            扫码关注 · <span style={{color: C.cyan}}>vLLM 生产工程</span>
          </div>
          <div style={{marginTop: 10, fontSize: 23, fontWeight: 600, color: C.ink3, opacity: brand, textAlign: 'center'}}>
            下载完整报告 &amp; 复现步骤
          </div>
        </div>
      </div>
    </Bg>
  );
};
