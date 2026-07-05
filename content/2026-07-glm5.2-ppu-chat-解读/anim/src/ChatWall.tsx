import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

type B = {conc: number; val: number; ttft: string; tag?: string; color: string};
const BARS: B[] = [
  {conc: 8, val: 136, ttft: '0.44s', color: C.off},
  {conc: 16, val: 242, ttft: '0.49s', color: C.ink3},
  {conc: 32, val: 369, ttft: '0.66s', tag: '峰值', color: C.green},
  {conc: 48, val: 270, ttft: '14.9s', tag: '过载', color: C.rose},
  {conc: 64, val: 273, ttft: '30.5s', tag: '过载', color: C.rose},
];
const MAXH = 500;
const MAXV = 369;

const Bar: React.FC<{b: B; idx: number}> = ({b, idx}) => {
  const frame = useCurrentFrame();
  const start = 26 + idx * 44;
  const g = interpolate(frame, [start, start + 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const h = (b.val / MAXV) * MAXH * g;
  const val = Math.round(b.val * g);
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
      <div style={{height: 34, marginBottom: 6, display: 'flex', alignItems: 'center'}}>
        {b.tag ? (
          <div style={{fontSize: 20, fontWeight: 800, color: b.color, background: `${b.color}1f`, border: `1px solid ${b.color}66`, borderRadius: 999, padding: '3px 14px', whiteSpace: 'nowrap', opacity: g}}>{b.tag}</div>
        ) : null}
      </div>
      <div style={{fontSize: 36, fontWeight: 900, color: b.color, marginBottom: 8, filter: `drop-shadow(0 0 14px ${b.color}44)`}}>{val}</div>
      <div style={{width: '78%', height: h, borderRadius: '12px 12px 0 0', background: `linear-gradient(180deg, ${b.color}, ${b.color}bb)`, boxShadow: `0 0 34px ${b.color}44, inset 0 2px 0 #ffffff22`}} />
      <div style={{fontSize: 27, fontWeight: 850, color: C.ink2, marginTop: 14}}>c{b.conc}</div>
      <div style={{fontSize: 18, color: b.tag === '过载' ? C.rose : C.ink3, fontWeight: 600, marginTop: 2}}>{b.ttft}</div>
    </div>
  );
};

export const ChatWall: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cb = spring({frame: frame - 232, fps, config: {damping: 200}});
  return (
    <Frame>
      <Eyebrow n="03">Chat 并发</Eyebrow>
      <Title size={50}>峰值在并发 32,超过即<span style={{color: C.rose}}>过载</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, height: MAXH + 130, paddingTop: 50}}>
          {BARS.map((b, i) => (<Bar key={b.conc} b={b} idx={i} />))}
        </div>
        <div style={{fontSize: 18, color: C.ink4, fontWeight: 600, textAlign: 'center', marginTop: 8}}>并发 →（输出 tok/s;柱下为首字延迟 TTFT）</div>
        <div style={{marginTop: 24, background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `5px solid ${C.rose}`, borderRadius: 16, padding: '24px 28px', boxShadow: `0 0 30px ${C.rose}16, ${C.shadow}`, opacity: cb, transform: `translateY(${(1 - cb) * 14}px)`}}>
          <span style={{fontSize: 28, fontWeight: 700, color: C.ink2, lineHeight: 1.45}}>
            并发 32 达峰 <b style={{color: C.green}}>369</b> tok/s;再往上首字延迟由 <b style={{color: C.ink}}>0.66s</b> 骤升至 <b style={{color: C.rose}}>15s、30s</b>——8 卡算力已饱和。
          </span>
        </div>
      </div>
    </Frame>
  );
};
