import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

// 竖屏安全区包裹:内容落在 y∈[168,1480];底部 ~440px 留给字幕带 + 平台 UI。
export const Frame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
  const life = Math.sin(frame / 42) * 1.5;
  return (
    <Bg>
      <AbsoluteFill
        style={{
          padding: '168px 56px 440px',
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
  <div style={{display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 800, color: C.violet2, letterSpacing: 0.6,
    background: `linear-gradient(90deg, ${C.violet}22, ${C.violet}08)`, border: `1px solid ${C.violet}44`, borderRadius: 999, padding: '8px 18px 8px 12px', boxShadow: `0 0 28px ${C.violet}33`}}>
    {n ? (
      <span style={{fontSize: 21, fontWeight: 900, color: '#0b0f1a', background: C.violet2, borderRadius: 7, padding: '2px 10px'}}>{n}</span>
    ) : (
      <span style={{width: 11, height: 11, borderRadius: 3, background: C.violet2, boxShadow: `0 0 16px ${C.violet2}`}} />
    )}
    {children}
  </div>
);

export const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 56}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [6, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{fontSize: size, fontWeight: 850, lineHeight: 1.12, letterSpacing: -1.2, marginTop: 22, color: C.ink, opacity: t, transform: `translateY(${(1 - t) * 16}px)`, textShadow: '0 2px 30px #00000060'}}>
      {children}
    </div>
  );
};
