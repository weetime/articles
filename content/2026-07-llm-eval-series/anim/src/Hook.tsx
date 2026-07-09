import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const FAIL = new Set([2, 5, 8]); // 10 次里搞砸 3 次(固定,确定性)

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [16, 38], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const failCount = Math.round(interpolate(frame, [150, 210], [0, 3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  return (
    <Bg>
      <AbsoluteFill style={{padding: '230px 70px 510px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 700, color: C.violet, opacity: t1}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          ModelDoctor · AI 智能体
        </div>
        <div style={{fontSize: 84, fontWeight: 850, lineHeight: 1.08, letterSpacing: -2, marginTop: 26, opacity: t1, transform: `translateY(${(1 - t1) * 20}px)`}}>
          让 AI 帮你<br /><span style={{background: 'linear-gradient(100deg,#9d8bff,#2bc4e6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>订张机票</span>
        </div>
        <div style={{fontSize: 34, color: C.ink2, fontWeight: 600, marginTop: 26, lineHeight: 1.5, opacity: t2}}>
          它得查航班、选座、改签、付款……<br />一口气做好几步。
        </div>

        {/* 10 次尝试 */}
        <div style={{marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 22}}>
          {Array.from({length: 10}).map((_, i) => {
            const appear = spring({frame: frame - (40 + i * 7), fps, config: {damping: 200, stiffness: 150}});
            const isFail = FAIL.has(i);
            const flip = interpolate(frame, [150 + i * 4, 168 + i * 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const failNow = isFail ? flip : 0;
            const good = `${C.green}`, bad = `${C.rose}`;
            const col = failNow > 0.5 ? bad : good;
            return (
              <div key={i} style={{aspectRatio: '1', borderRadius: 20, background: C.panel, border: `2.5px solid ${col}${failNow > 0.5 ? '' : '66'}`, boxShadow: failNow > 0.5 ? `0 0 26px ${C.rose}55` : C.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear, transform: `translateY(${(1 - appear) * 20}px) scale(${1 + failNow * 0.04})`}}>
                <span style={{fontSize: 60, fontWeight: 900, color: col}}>{failNow > 0.5 ? '✗' : '✓'}</span>
              </div>
            );
          })}
        </div>

        <div style={{marginTop: 70, textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.ink}}>
          可十次里,总有 <span style={{color: C.rose, fontSize: 64, fontWeight: 900}}>{failCount}</span> 次
        </div>
        <div style={{textAlign: 'center', fontSize: 40, fontWeight: 850, color: C.rose, marginTop: 8, opacity: interpolate(frame, [200, 220], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          把事儿给你办砸了
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
