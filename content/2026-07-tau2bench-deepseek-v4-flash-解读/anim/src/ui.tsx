import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

export const MONO = '"SF Mono","JetBrains Mono",ui-monospace,Menlo,Consolas,monospace';
const eo = Easing.out(Easing.cubic);

// 竖屏内容区外壳：顶 200 / 底 430(字幕+UI 安全区),内容填满
export const Scene: React.FC<{children: React.ReactNode; pad?: string}> = ({children, pad}) => {
  const {width, height} = useVideoConfig();
  const land = width > height;
  return (
    <Bg>
      <AbsoluteFill style={{padding: land ? '70px 110px' : (pad || '196px 56px 600px'),
        display: 'flex', flexDirection: 'column'}}>
        {children}
      </AbsoluteFill>
    </Bg>
  );
};

// mono 抬头 + 大标题(科技感:发光小点 + 等宽 eyebrow)
export const Head: React.FC<{eyebrow: string; title: React.ReactNode; sub?: React.ReactNode}> = ({eyebrow, title, sub}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [3, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  return (
    <div style={{opacity: t, transform: `translateY(${(1 - t) * 14}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.cyan, letterSpacing: 1}}>
        <span style={{width: 10, height: 10, borderRadius: 2, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}`}} />
        {eyebrow}
      </div>
      <div style={{fontSize: 64, fontWeight: 850, lineHeight: 1.12, letterSpacing: -1.5, marginTop: 26}}>{title}</div>
      {sub && <div style={{fontSize: 26, color: C.ink2, marginTop: 18, fontWeight: 500, lineHeight: 1.5}}>{sub}</div>}
    </div>
  );
};

// 发光大数字
export const Glow: React.FC<{v: string; color: string; size?: number}> = ({v, color, size = 130}) => (
  <span style={{fontFamily: MONO, fontSize: size, fontWeight: 800, color, letterSpacing: -4,
    textShadow: `0 0 34px ${color}88, 0 0 8px ${color}66`}}>{v}</span>
);

// HUD 面板(半透明 + cyan 边 + 角光)
export const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: `${C.panel}cc`, border: `1px solid ${C.line2}`, borderRadius: 16,
    boxShadow: `0 0 0 1px #00000022, 0 12px 40px #00000066, inset 0 0 40px ${C.cyan}08`, ...style}}>
    {children}
  </div>
);
