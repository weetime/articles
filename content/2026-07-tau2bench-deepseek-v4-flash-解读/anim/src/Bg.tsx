import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {C, FONT} from './theme';

// 科技感背景：漂移网格 + 扫描线 + HUD 角标 + 光晕 vignette
export const Bg: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const drift = (frame % 108) / 108 * 54;              // 网格缓慢漂移
  const scanY = interpolate(frame % 150, [0, 150], [-0.15, 1.15]) * height;
  const bracket = (pos: React.CSSProperties, rot: number) => (
    <div style={{position: 'absolute', width: 46, height: 46, ...pos,
      borderTop: `2px solid ${C.cyan}`, borderLeft: `2px solid ${C.cyan}`,
      transform: `rotate(${rot}deg)`, opacity: 0.5, filter: `drop-shadow(0 0 6px ${C.cyan}88)`}} />
  );
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.ink, background: C.pageGrad}}>
      {/* 漂移网格 */}
      <AbsoluteFill style={{
        backgroundImage:
          `linear-gradient(${C.gridLine} 1px,transparent 1px),` +
          `linear-gradient(90deg,${C.gridLine} 1px,transparent 1px)`,
        backgroundSize: '54px 54px',
        backgroundPosition: `0 ${drift}px, ${drift}px 0`,
      }} />
      {/* 扫描线光带 */}
      <div style={{position: 'absolute', left: 0, right: 0, height: 260,
        background: `linear-gradient(180deg, transparent, ${C.cyan}0d 46%, ${C.cyan}20 50%, ${C.cyan}0d 54%, transparent)`,
        transform: `translateY(${scanY}px)`, opacity: 0.55, pointerEvents: 'none'}} />
      {/* HUD 角标 */}
      {bracket({top: 60, left: 44}, 0)}
      {bracket({top: 60, right: 44}, 90)}
      {bracket({bottom: 60, left: 44}, 270)}
      {bracket({bottom: 60, right: 44}, 180)}
      {/* vignette */}
      <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 44%, transparent 58%, #05070caa 100%)`, pointerEvents: 'none'}} />
      {children}
    </AbsoluteFill>
  );
};
