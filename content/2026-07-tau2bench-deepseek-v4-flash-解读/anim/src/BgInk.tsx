import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {K} from './inkTheme';

// 宣纸底 + 纸纤维纹 + 缓慢呼吸的墨晕 + 四角淡墨
export const BgInk: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / 30;
  const breathe = 0.5 + 0.5 * Math.sin(t / 3.2);
  const drift = Math.sin(t / 5) * 14;

  return (
    <AbsoluteFill style={{background: K.paper, overflow: 'hidden'}}>
      {/* 墨晕:两团缓慢呼吸的淡墨 */}
      <div style={{position: 'absolute', top: `${-8 + drift * 0.4}%`, left: '-14%', width: '70%', height: '48%',
        background: `radial-gradient(ellipse at center, ${K.ink2}22, transparent 68%)`, opacity: 0.5 + breathe * 0.3, filter: 'blur(20px)'}} />
      <div style={{position: 'absolute', bottom: `${-6 - drift * 0.3}%`, right: '-16%', width: '76%', height: '52%',
        background: `radial-gradient(ellipse at center, ${K.ink2}1e, transparent 66%)`, opacity: 0.45 + (1 - breathe) * 0.3, filter: 'blur(22px)'}} />
      {/* 纸纤维纹理 */}
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'multiply'}}>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper)" />
        <filter id="fiber">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.4" numOctaves="2" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.03 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#fiber)" />
      </svg>
      {/* 四角淡墨压角 */}
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 220px ${K.paper2}, inset 0 0 90px ${K.ink2}14`, pointerEvents: 'none'}} />
      {children}
    </AbsoluteFill>
  );
};
