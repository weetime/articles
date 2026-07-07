import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './theme';

// 品牌背景：随主题切换的渐变 + 网格 + 角部光晕
export const Bg: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.ink, background: C.pageGrad}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            `linear-gradient(${C.gridLine} 1px,transparent 1px),` +
            `linear-gradient(90deg,${C.gridLine} 1px,transparent 1px)`,
          backgroundSize: '54px 54px',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
