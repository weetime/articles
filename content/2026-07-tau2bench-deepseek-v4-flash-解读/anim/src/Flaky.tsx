import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const RUNS = [1, 1, 0, 1]; // 同一任务 4 次:对 对 错 对

export const Flaky: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eye = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const big = spring({frame: frame - 14, fps, config: {damping: 12, stiffness: 110}});
  const sub = interpolate(frame, [40, 62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [150, 178], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Scene>
      <div style={{fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.rose, letterSpacing: 1, opacity: eye}}>但是……</div>
      <div style={{fontSize: 76, fontWeight: 850, letterSpacing: -2, marginTop: 16, opacity: big, transform: `scale(${0.85 + big * 0.15})`, transformOrigin: 'left center'}}>
        <span style={{color: C.ink}}>稳定性</span> <span style={{color: C.rose, textShadow: `0 0 26px ${C.rose}55`}}>不足</span>
      </div>
      <div style={{fontSize: 32, color: C.ink2, fontWeight: 500, marginTop: 24, opacity: sub, lineHeight: 1.5}}>
        <b style={{color: C.ink}}>同一个任务</b>,让它多跑几次 ——<br />结果<b style={{color: C.rose}}>不一定都让你满意</b>
      </div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30}}>
        <div style={{textAlign: 'center', fontSize: 26, color: C.ink3, fontWeight: 600}}>比如同一个「改签」任务,连跑 4 次:</div>
        <div style={{display: 'flex', gap: 26, justifyContent: 'center'}}>
          {RUNS.map((v, i) => {
            const s = spring({frame: frame - (74 + i * 22), fps, config: {damping: 12, stiffness: 130}});
            const color = v ? C.green : C.rose;
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: s, transform: `scale(${0.5 + s * 0.5})`}}>
                <div style={{width: 130, height: 130, borderRadius: 24, background: `${color}1e`, border: `2px solid ${color}`, display: 'grid', placeItems: 'center',
                  fontSize: 72, color, fontWeight: 800, boxShadow: `0 0 30px ${color}44`}}>{v ? '✓' : '✗'}</div>
                <div style={{fontFamily: MONO, fontSize: 22, color: C.ink3, fontWeight: 600}}>第 {i + 1} 次</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{fontSize: 28, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        3 次成功、<b style={{color: C.rose}}>1 次翻车</b> —— 生产上这可能就是事故
      </div>
    </Scene>
  );
};
