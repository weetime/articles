import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Frame} from './Frame';
import {C} from './theme';

const Chip: React.FC<{children: React.ReactNode; color: string; delay: number}> = ({children, color, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 11, background: C.panel, border: `1px solid ${color}55`, borderRadius: 999, padding: '13px 22px', fontSize: 27, fontWeight: 750, color: C.ink, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, boxShadow: `0 0 22px ${color}22, ${C.shadow}`}}>
      <span style={{width: 10, height: 10, borderRadius: 3, background: color, boxShadow: `0 0 12px ${color}`, flexShrink: 0}} />
      {children}
    </div>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 8, fps, config: {damping: 200, stiffness: 120}});
  const badge = interpolate(frame, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rule = interpolate(frame, [16, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sub = interpolate(frame, [34, 54], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = 0.6 + Math.sin(frame / 22) * 0.4;
  return (
    <Frame>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        {/* 徽标 */}
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 25, fontWeight: 850, letterSpacing: 2, color: C.violet2,
          background: `linear-gradient(90deg,${C.violet}26,${C.cyan}18)`, border: `1px solid ${C.violet}55`, borderRadius: 999, padding: '10px 22px',
          opacity: badge, boxShadow: `0 0 ${24 + glow * 24}px ${C.violet}44`}}>
          <span style={{width: 12, height: 12, borderRadius: 4, background: C.violet2, boxShadow: `0 0 16px ${C.violet2}`}} />
          测试报告解读 · 8 卡实测
        </div>
        {/* 发光分隔线 */}
        <div style={{width: interpolate(rule, [0, 1], [0, 300]), height: 3, marginTop: 34, borderRadius: 2, background: `linear-gradient(90deg,${C.violet},${C.cyan})`, boxShadow: `0 0 18px ${C.cyan}88`}} />
        {/* 巨号字 */}
        <div style={{fontSize: 178, fontWeight: 900, letterSpacing: -6, lineHeight: 1, marginTop: 30,
          background: `linear-gradient(180deg,#ffffff 0%,#cfe0ff 55%,${C.violet2} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          opacity: s, transform: `translateY(${(1 - s) * 26}px) scale(${0.94 + s * 0.06})`, filter: `drop-shadow(0 0 46px ${C.violet}55)`}}>
          GLM-5.2
        </div>
        <div style={{fontSize: 40, fontWeight: 750, color: C.ink2, marginTop: 22, opacity: sub, letterSpacing: -0.5}}>
          744B MoE · <span style={{color: C.cyan}}>DSA 稀疏注意力</span>
        </div>
        <div style={{fontSize: 30, fontWeight: 600, color: C.ink3, marginTop: 12, opacity: sub}}>
          运行于 8 卡 PPU-ZW810E / SGLang
        </div>
        {/* 参数芯片 */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 48, maxWidth: 900}}>
          <Chip color={C.violet} delay={58}>744B / 39B 激活</Chip>
          <Chip color={C.cyan} delay={66}>DSA + MTP</Chip>
          <Chip color={C.amber} delay={74}>W4A8 · sm80</Chip>
          <Chip color={C.green} delay={82}>SGLang · TP8</Chip>
        </div>
      </div>
    </Frame>
  );
};
