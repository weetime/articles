import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Card: React.FC<{mrr: string; val: number; delay: number; drop: boolean}> = ({mrr, val, delay, drop}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = Math.round(interpolate(frame, [delay, delay + 26], [0, val], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <div style={{flex: 1, background: C.panel, border: `1px solid ${drop ? C.rose + '66' : C.line2}`, borderRadius: 20, padding: '28px 18px', textAlign: 'center', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div style={{fontSize: 24, fontWeight: 700, color: C.ink3}}>{mrr}</div>
      <div style={{fontSize: 68, fontWeight: 850, letterSpacing: -2, marginTop: 8, color: drop ? C.rose : C.ink}}>{v}</div>
      <div style={{fontSize: 18, color: C.ink4, fontWeight: 600, marginTop: 6}}>tok/s @ 并发 32</div>
      {drop ? <div style={{fontSize: 30, color: C.rose, fontWeight: 850, marginTop: 6}}>▼</div> : <div style={{height: 42}} />}
    </div>
  );
};

export const LowConc: React.FC = () => {
  const frame = useCurrentFrame();
  const chip = interpolate(frame, [92, 112], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow n="03">同一并发</Eyebrow>
      <Title size={50}>但高并发参数,<span style={{color: C.rose}}>低负载时反而更慢</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30}}>
        <div style={{display: 'flex', gap: 20, alignItems: 'stretch'}}>
          <Card mrr="mrr 32" val={568} delay={22} drop={false} />
          <Card mrr="mrr 64" val={496} delay={40} drop />
          <Card mrr="mrr 96" val={340} delay={58} drop />
        </div>
        <div style={{background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `4px solid ${C.amber}`, borderRadius: 12, padding: '20px 24px', boxShadow: C.shadow, opacity: chip, transform: `translateY(${(1 - chip) * 14}px)`}}>
          <span style={{fontSize: 26, fontWeight: 700, color: C.ink2, lineHeight: 1.45}}>
            cuda-graph-bs 越大,小 batch 固定开销越吃亏 —— <b style={{color: C.ink}}>没有一套参数全场都占优,按真实并发选</b>。
          </span>
        </div>
      </div>
    </Frame>
  );
};
