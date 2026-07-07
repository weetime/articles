import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const STEPS = ['能跑', '跑得好', '跑对', '稳定跑', '国产卡落地'];

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [16, 38], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t3 = interpolate(frame, [34, 54], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '250px 70px 500px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 700, color: C.violet, opacity: t1}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.violet, boxShadow: `0 0 16px ${C.violet}88`}} />
          recipes.mcpinfra.net · SRE × FDE
        </div>
        <div style={{fontSize: 96, fontWeight: 850, lineHeight: 1.08, letterSpacing: -3, marginTop: 30, opacity: t1, transform: `translateY(${(1 - t1) * 20}px)`}}>
          大模型部署
        </div>
        <div style={{fontSize: 96, fontWeight: 850, lineHeight: 1.08, letterSpacing: -3, marginTop: 4, opacity: t2, transform: `translateY(${(1 - t2) * 20}px)`}}>
          从「手艺」到<span style={{background: 'linear-gradient(100deg,#7d68ff,#2bc4e6 60%,#ff8fc0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>「工程」</span>
        </div>
        <div style={{fontSize: 40, fontWeight: 700, color: C.ink2, marginTop: 40, opacity: t3}}>
          让推理服务,从「能跑」到 <span style={{color: C.green, fontWeight: 850}}>「持续稳定跑」</span>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 46}}>
          {STEPS.map((s, i) => {
            const d = 56 + i * 12;
            const o = interpolate(frame, [d, d + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
            const last = i === STEPS.length - 1;
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: o, transform: `translateY(${(1 - o) * 12}px)`}}>
                <div style={{fontSize: 27, fontWeight: 800, color: last ? C.green : C.ink2, background: C.panel, border: `2px solid ${last ? C.green + '66' : C.line2}`, borderRadius: 14, padding: '14px 22px', boxShadow: C.shadow}}>
                  <span style={{color: C.violet, marginRight: 8}}>{i + 1}</span>{s}
                </div>
                {!last && <span style={{fontSize: 30, color: C.ink4}}>→</span>}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
