import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const TASKS = ['订单查询', '机票改签', '下单购买', '售后退换'];

export const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eye = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const big = spring({frame: frame - 16, fps, config: {damping: 11, stiffness: 110}});
  const bigGlow = 0.5 + 0.5 * Math.sin(Math.max(0, frame - 20) / 13);
  const rate = interpolate(frame, [150, 186], [0, 85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const beat = interpolate(frame, [186, 206], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Scene>
      <div style={{fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.green, letterSpacing: 1, opacity: eye}}>结果出来了</div>
      <div style={{fontSize: 96, fontWeight: 850, letterSpacing: -3, marginTop: 16, transform: `scale(${0.7 + big * 0.3})`, transformOrigin: 'left center',
        color: C.green, textShadow: `0 0 ${bigGlow * 40}px ${C.green}77`}}>能 · 胜 · 任</div>
      <div style={{fontSize: 30, color: C.ink2, fontWeight: 500, marginTop: 20, opacity: eye}}>这些标准客服工单,它都能拿下 ——</div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22}}>
          {TASKS.map((t, i) => {
            const s = spring({frame: frame - (58 + i * 18), fps, config: {damping: 200, stiffness: 150}});
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, background: `${C.panel}dd`, border: `1px solid ${C.green}55`,
                borderRadius: 16, padding: '26px 28px', opacity: s, transform: `translateX(${(1 - s) * -24}px)`, boxShadow: `0 0 20px ${C.green}15`}}>
                <span style={{width: 44, height: 44, borderRadius: 12, background: `${C.green}22`, border: `1px solid ${C.green}`, display: 'grid', placeItems: 'center',
                  fontSize: 28, color: C.green, fontWeight: 800, boxShadow: `0 0 14px ${C.green}44`}}>✓</span>
                <span style={{fontSize: 34, fontWeight: 700, color: C.ink}}>{t}</span>
              </div>
            );
          })}
        </div>

        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 14}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: MONO, fontSize: 64, fontWeight: 850, color: C.violet2, textShadow: `0 0 24px ${C.violet}55`}}>{Math.round(rate)}%</div>
            <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginTop: 4}}>单次成功率</div>
          </div>
          <span style={{fontFamily: MONO, fontSize: 28, fontWeight: 800, color: C.green, background: `${C.green}18`, border: `1px solid ${C.green}66`,
            borderRadius: 999, padding: '13px 28px', opacity: beat, transform: `scale(${0.8 + beat * 0.2})`}}>▲ 超过 DeepSeek-V3.2</span>
        </div>
      </div>
    </Scene>
  );
};
