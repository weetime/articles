import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

// 竖屏安全区包裹:内容落在 y∈[210,1410]。所有场景用它。
export const Frame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
  const life = Math.sin(frame / 42) * 1.5; // 持续微呼吸,避免任何一帧死冻
  return (
    <Bg>
      <AbsoluteFill
        style={{
          padding: '212px 62px 512px',
          display: 'flex',
          flexDirection: 'column',
          opacity: intro,
          transform: `translateY(${life}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </Bg>
  );
};

export const Eyebrow: React.FC<{n?: string; children: React.ReactNode}> = ({n, children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, fontWeight: 700, color: C.violet, letterSpacing: 0.4}}>
    {n ? (
      <span style={{fontSize: 22, fontWeight: 850, color: C.violet, background: `${C.violet}1c`, border: `1px solid ${C.violet}55`, borderRadius: 8, padding: '3px 11px'}}>{n}</span>
    ) : (
      <span style={{width: 11, height: 11, borderRadius: 3, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
    )}
    {children}
  </div>
);

export const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 56}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [6, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{fontSize: size, fontWeight: 850, lineHeight: 1.14, letterSpacing: -1.2, marginTop: 20, color: C.ink, opacity: t, transform: `translateY(${(1 - t) * 16}px)`}}>
      {children}
    </div>
  );
};
