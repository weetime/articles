import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const s1 = spring({frame, fps, config: {damping: 200, stiffness: 150}});
  const s2 = spring({frame: frame - 16, fps, config: {damping: 160, stiffness: 160}});
  const sub = interpolate(frame, [46, 62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const qpulse = frame > 30 ? 1 + 0.035 * Math.sin((frame - 30) / 6) : 1;
  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 80px' : '220px 70px 510px'}}>
        <div style={{fontSize: 27, fontWeight: 800, color: C.violet, letterSpacing: 3, opacity: s1, marginBottom: 26}}>
          HIGRESS · 实测 80 次
        </div>
        <div style={{fontSize: land ? 78 : 90, fontWeight: 900, lineHeight: 1.12, textAlign: 'center', letterSpacing: -2, opacity: s1, transform: `translateY(${(1 - s1) * 30}px)`}}>
          一个网关，两种协议<br /><span style={{color: C.cyan}}>并行接入</span>
        </div>
        <div style={{marginTop: 44, fontSize: land ? 60 : 74, fontWeight: 900, textAlign: 'center', letterSpacing: -1, opacity: s2, transform: `scale(${qpulse}) translateY(${(1 - s2) * 26}px)`, background: 'linear-gradient(100deg,#7d68ff,#2bc4e6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
          转换有没有损耗？
        </div>
        <div style={{marginTop: 50, fontSize: 30, color: C.ink2, fontWeight: 600, opacity: sub}}>
          ↓ 用数据回答
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
