import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const STEPS = [
  {n: '01', t: '查航班', d: '调用工具'},
  {n: '02', t: '选座位', d: '调用工具'},
  {n: '03', t: '改签', d: '调用工具'},
  {n: '04', t: '付款', d: '调用工具'},
];

export const Steps: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{padding: '230px 80px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{fontSize: 30, fontWeight: 700, color: C.violet, opacity: t1}}>问题就出在「好几步」</div>
        <div style={{fontSize: 66, fontWeight: 850, letterSpacing: -1.5, lineHeight: 1.12, marginTop: 16, opacity: t1, transform: `translateY(${(1 - t1) * 16}px)`}}>
          智能体要<span style={{color: C.violet}}>连着调工具</span>
        </div>

        <div style={{marginTop: 60, display: 'flex', flexDirection: 'column', gap: 8}}>
          {STEPS.map((s, i) => {
            const appear = spring({frame: frame - (40 + i * 34), fps, config: {damping: 200, stiffness: 130}});
            const lit = appear > 0.6;
            return (
              <React.Fragment key={i}>
                <div style={{display: 'flex', alignItems: 'center', gap: 26, background: C.panel, border: `2px solid ${lit ? C.violet : C.line2}`, borderRadius: 22, padding: '26px 30px', boxShadow: lit ? `0 0 30px ${C.violet}33` : C.shadow, opacity: appear, transform: `translateX(${(1 - appear) * -30}px)`}}>
                  <div style={{width: 68, height: 68, flexShrink: 0, borderRadius: 16, background: lit ? C.violet : C.track, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 850, color: lit ? '#fff' : C.ink3}}>{s.n}</div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 46, fontWeight: 800, color: C.ink}}>{s.t}</div>
                  </div>
                  <div style={{fontSize: 22, fontWeight: 700, color: lit ? C.cyan : C.ink4, background: lit ? `${C.cyan}1a` : 'transparent', border: `1px solid ${lit ? C.cyan + '55' : C.line2}`, borderRadius: 999, padding: '8px 18px'}}>{s.d}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{textAlign: 'center', fontSize: 30, color: C.ink4, opacity: appear, lineHeight: 1}}>↓</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{marginTop: 'auto', fontSize: 34, fontWeight: 700, color: C.ink2, textAlign: 'center', opacity: interpolate(frame, [210, 240], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          环环相扣,一步接一步
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
