import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {InkScene, RoughDefs, Seal} from './uiInk';
import {K, F_TITLE, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);
const TASKS = ['订单查询', '机票改签', '下单购买', '售后退换'];

export const InkVerdict: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eb = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const big = spring({frame: frame - 14, fps, config: {damping: 12, stiffness: 110}});
  const rate = interpolate(frame, [150, 184], [0, 85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <InkScene>
      <div style={{fontFamily: F_BODY, fontSize: 30, fontWeight: 700, color: K.seal, letterSpacing: 3, opacity: eb, display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{width: 24, height: 24, background: K.seal, borderRadius: 4, transform: 'rotate(-5deg)'}} />结果出来了
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 12}}>
        <div style={{fontFamily: F_TITLE, fontSize: 118, fontWeight: 800, color: K.ink, letterSpacing: 6, transform: `scale(${0.7 + big * 0.3})`, transformOrigin: 'left center'}}>能胜任</div>
        <Seal text="能胜任" delay={30} size={116} rot={-6} />
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 32, color: K.ink2, fontWeight: 600, marginTop: 16, opacity: eb}}>这些标准客服工单,它都拿得下 ——</div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
          {TASKS.map((t, i) => {
            const s = spring({frame: frame - (58 + i * 16), fps, config: {damping: 200, stiffness: 150}});
            const ck = interpolate(frame, [66 + i * 16, 90 + i * 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: s, transform: `translateX(${(1 - s) * -20}px)`}}>
                <svg viewBox="0 0 60 60" style={{width: 60, height: 60, flexShrink: 0}}>
                  <RoughDefs id={`ck${i}`} scale={4} freq={0.04} seed={i + 1} />
                  <path d="M12 32 L26 46 L50 14" fill="none" stroke={K.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
                    filter={`url(#ck${i})`} strokeDasharray={80} strokeDashoffset={80 * (1 - ck)} />
                </svg>
                <span style={{fontFamily: F_BODY, fontSize: 40, fontWeight: 700, color: K.ink}}>{t}</span>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 10}}>
          <span style={{fontFamily: F_NUM, fontSize: 88, fontWeight: 700, color: K.seal}}>{Math.round(rate)}%</span>
          <span style={{fontFamily: F_BODY, fontSize: 30, color: K.ink2, fontWeight: 600}}>单次成功率 · <span style={{color: K.green, fontWeight: 700}}>超过上一代 V3.2</span></span>
        </div>
      </div>
    </InkScene>
  );
};
