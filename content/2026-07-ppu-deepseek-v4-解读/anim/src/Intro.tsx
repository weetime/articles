import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Frame, Eyebrow} from './Frame';
import {C} from './theme';

const Chip: React.FC<{children: React.ReactNode; delay: number}> = ({children, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 11, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '16px 22px', fontSize: 25, fontWeight: 650, color: C.ink2, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, boxShadow: C.shadow}}>
      <span style={{width: 8, height: 8, borderRadius: 2, background: C.violet, flexShrink: 0}} />
      {children}
    </div>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 8, fps, config: {damping: 200, stiffness: 130}});
  const sub = interpolate(frame, [26, 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow>测试报告解读</Eyebrow>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontSize: 96, fontWeight: 850, letterSpacing: -3, color: C.ink, opacity: s, transform: `translateY(${(1 - s) * 22}px)`}}>
          一次<span style={{color: C.violet}}>参数寻优</span>实测
        </div>
        <div style={{fontSize: 38, fontWeight: 600, color: C.ink2, lineHeight: 1.5, marginTop: 30, opacity: sub, transform: `translateY(${(1 - sub) * 14}px)`}}>
          同一批 8 张卡,只调一个并发参数,<br />吞吐能差出多少?
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 54}}>
          <Chip delay={52}>8 卡 PPU-ZW810E</Chip>
          <Chip delay={62}>SGLang 0.5.12</Chip>
          <Chip delay={72}>DeepSeek-V4-Flash-INT8</Chip>
        </div>
      </div>
    </Frame>
  );
};
