import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT} from './theme';

// 电影级品牌背景:深底 + 多层辉光光斑(缓慢呼吸)+ 细网格 + 暗角
export const Bg: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const b = 0.5 + Math.sin(f / 60) * 0.5; // 0..1 呼吸
  const drift = Math.sin(f / 90) * 26;
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.ink, background: C.pageGrad, overflow: 'hidden'}}>
      {/* 辉光光斑 */}
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(1100px 760px at ${78 + drift * 0.02}% -6%, rgba(124,92,255,${0.20 + b * 0.10}), transparent 58%),` +
            `radial-gradient(980px 720px at 2% 108%, rgba(52,211,236,${0.12 + b * 0.06}), transparent 56%),` +
            `radial-gradient(720px 560px at 96% 96%, rgba(247,183,60,${0.06 + b * 0.04}), transparent 60%)`,
        }}
      />
      {/* 细网格(中心亮、四周淡) */}
      <AbsoluteFill
        style={{
          backgroundImage:
            `linear-gradient(${C.gridLine} 1px,transparent 1px),` +
            `linear-gradient(90deg,${C.gridLine} 1px,transparent 1px)`,
          backgroundSize: '58px 58px',
          maskImage: 'radial-gradient(1200px 1400px at 50% 40%, #000 55%, transparent 92%)',
          WebkitMaskImage: 'radial-gradient(1200px 1400px at 50% 40%, #000 55%, transparent 92%)',
        }}
      />
      {/* 暗角 */}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 340px 90px #00000088', pointerEvents: 'none'}} />
      {children}
    </AbsoluteFill>
  );
};
