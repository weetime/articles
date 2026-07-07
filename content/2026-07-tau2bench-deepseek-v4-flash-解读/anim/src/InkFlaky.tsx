import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {InkScene, RoughDefs} from './uiInk';
import {K, F_TITLE, F_BODY} from './inkTheme';

const eo = Easing.out(Easing.cubic);
const RUNS = [1, 1, 0, 1];

export const InkFlaky: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eb = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const big = spring({frame: frame - 14, fps, config: {damping: 12, stiffness: 110}});
  const sub = interpolate(frame, [40, 62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [150, 178], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <InkScene>
      <div style={{fontFamily: F_BODY, fontSize: 30, fontWeight: 700, color: K.seal, letterSpacing: 3, opacity: eb, display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{width: 24, height: 24, background: K.seal, borderRadius: 4, transform: 'rotate(-5deg)'}} />但是……
      </div>
      <div style={{fontFamily: F_TITLE, fontSize: 96, fontWeight: 800, color: K.ink, marginTop: 10, opacity: big, transform: `scale(${0.85 + big * 0.15})`, transformOrigin: 'left center', letterSpacing: 4}}>
        稳定性<span style={{color: K.seal}}>不足</span>
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 34, color: K.ink2, fontWeight: 600, marginTop: 22, opacity: sub, lineHeight: 1.5}}>
        <b style={{color: K.ink}}>同一个任务</b>多跑几次,结果<b style={{color: K.seal}}>不一定都让你满意</b>
      </div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30}}>
        <div style={{textAlign: 'center', fontFamily: F_BODY, fontSize: 28, color: K.ink3, fontWeight: 600}}>同一个「改签」连跑 4 次:</div>
        <div style={{display: 'flex', gap: 40, justifyContent: 'center'}}>
          {RUNS.map((v, i) => {
            const s = spring({frame: frame - (74 + i * 20), fps, config: {damping: 12, stiffness: 130}});
            const dr = interpolate(frame, [80 + i * 20, 104 + i * 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const color = v ? K.green : K.seal;
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: s, transform: `scale(${0.6 + s * 0.4})`}}>
                <svg viewBox="0 0 130 130" style={{width: 140, height: 140}}>
                  <RoughDefs id={`fk${i}`} scale={5} freq={0.035} seed={i + 2} />
                  <circle cx="65" cy="65" r="52" fill="none" stroke={color} strokeWidth="5" filter={`url(#fk${i})`} strokeDasharray={340} strokeDashoffset={340 * (1 - dr)} opacity={0.5} />
                  {v
                    ? <path d="M40 68 L58 88 L92 42" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" filter={`url(#fk${i})`} strokeDasharray={120} strokeDashoffset={120 * (1 - dr)} />
                    : <g stroke={color} strokeWidth="9" strokeLinecap="round" filter={`url(#fk${i})`}>
                        <path d="M42 42 L88 88" strokeDasharray={90} strokeDashoffset={90 * (1 - dr)} />
                        <path d="M88 42 L42 88" strokeDasharray={90} strokeDashoffset={90 * (1 - dr)} />
                      </g>}
                </svg>
                <div style={{fontFamily: F_BODY, fontSize: 24, color: K.ink3, fontWeight: 600}}>第 {i + 1} 次</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 30, color: K.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        3 次成功、<b style={{color: K.seal}}>1 次翻车</b> —— 生产上这可能就是事故
      </div>
    </InkScene>
  );
};
