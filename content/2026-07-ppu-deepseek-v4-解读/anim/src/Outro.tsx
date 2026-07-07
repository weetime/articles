import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = spring({frame: frame - 10, fps, config: {damping: 200, stiffness: 120}});
  const s2 = interpolate(frame, [34, 56], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const note = interpolate(frame, [70, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '212px 70px 512px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{width: 60, height: 5, borderRadius: 3, background: C.violet, opacity: s1}} />
        <div style={{fontSize: 64, fontWeight: 850, letterSpacing: -2, color: C.ink, marginTop: 40, opacity: s1, transform: `translateY(${(1 - s1) * 20}px)`}}>
          默认参数,<span style={{color: C.violet}}>值得测一测</span>。
        </div>
        <div style={{fontSize: 34, fontWeight: 600, color: C.ink3, marginTop: 28, lineHeight: 1.5, opacity: s2}}>
          以及——学会判断<br />你的部署,卡在了哪里。
        </div>
        <div style={{fontSize: 21, fontWeight: 500, color: C.ink4, marginTop: 60, lineHeight: 1.5, opacity: note}}>
          数据来自一次具体环境实测,换环境结论可能变。
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
