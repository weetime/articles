import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const STEPS = ['查航班', '选座位', '改签', '付款'];
const BROKEN = 2; // 第 3 步(改签)出错

export const OneWrong: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t1 = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const breakT = interpolate(frame, [70, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bigIn = spring({frame: frame - 150, fps, config: {damping: 200, stiffness: 120}});

  return (
    <Bg>
      <AbsoluteFill style={{padding: '240px 80px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{fontSize: 30, fontWeight: 700, color: C.rose, opacity: t1}}>而这中间……</div>

        {/* 步骤链:第 3 步爆红,之后灰掉 */}
        <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 14}}>
          {STEPS.map((s, i) => {
            const isBroken = i === BROKEN;
            const afterBroken = i > BROKEN;
            const failNow = isBroken ? breakT : 0;
            const grey = afterBroken ? breakT : 0;
            const border = failNow > 0.5 ? C.rose : afterBroken && grey > 0.5 ? C.line2 : C.violet;
            const inkc = grey > 0.5 ? C.ink4 : C.ink;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, background: C.panel, border: `2.5px solid ${border}`, borderRadius: 20, padding: '24px 30px', boxShadow: failNow > 0.5 ? `0 0 34px ${C.rose}66` : C.shadow, opacity: 1 - grey * 0.45, transform: `scale(${1 + failNow * 0.03})`}}>
                <div style={{width: 60, height: 60, flexShrink: 0, borderRadius: 14, background: failNow > 0.5 ? C.rose : grey > 0.5 ? C.track : C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: failNow > 0.5 || grey <= 0.5 ? '#fff' : C.ink3}}>
                  {failNow > 0.5 ? '✗' : grey > 0.5 ? '·' : '✓'}
                </div>
                <div style={{flex: 1, fontSize: 44, fontWeight: 800, color: inkc}}>{s}</div>
                {failNow > 0.5 && <div style={{fontSize: 26, fontWeight: 800, color: C.rose}}>出错</div>}
                {grey > 0.5 && <div style={{fontSize: 24, fontWeight: 700, color: C.ink4}}>全废</div>}
              </div>
            );
          })}
        </div>

        <div style={{marginTop: 70, textAlign: 'center', opacity: bigIn, transform: `scale(${0.85 + bigIn * 0.15})`}}>
          <div style={{fontSize: 78, fontWeight: 900, letterSpacing: -2, color: C.rose}}>一步错 · 满盘皆输</div>
          <div style={{fontSize: 34, fontWeight: 600, color: C.ink2, marginTop: 18}}>前面做对再多,也白搭</div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
