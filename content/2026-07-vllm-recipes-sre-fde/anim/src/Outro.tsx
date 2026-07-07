import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t1 = interpolate(frame, [6, 28], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [22, 44], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 52, fps, config: {damping: 200, stiffness: 120}});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '250px 70px 500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 800, color: C.green, opacity: t1}}>五关闯完</div>
        <div style={{fontSize: 82, fontWeight: 850, letterSpacing: -2, marginTop: 20, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
          恭喜你,<span style={{color: C.green}}>你学会了</span>
        </div>
        <div style={{fontSize: 38, fontWeight: 700, color: C.ink2, marginTop: 30, lineHeight: 1.5, opacity: t2}}>
          把大模型从「能跑」<br />带到 <span style={{color: C.violet, fontWeight: 850}}>「持续稳定跑」</span>
        </div>
        <div style={{marginTop: 60, background: '#fff', borderRadius: 22, padding: 20, boxShadow: C.shadow, opacity: qr, transform: `scale(${0.8 + qr * 0.2})`}}>
          <Img src={staticFile('qr.png')} style={{width: 240, height: 240, display: 'block', borderRadius: 10}} />
        </div>
        <div style={{marginTop: 22, fontSize: 28, fontWeight: 800, color: C.ink, opacity: qr}}>关注 · vLLM 生产工程</div>
        <div style={{marginTop: 10, fontSize: 24, fontWeight: 700, color: C.violet, fontFamily: 'monospace', opacity: qr}}>recipes.mcpinfra.net</div>
      </AbsoluteFill>
    </Bg>
  );
};
