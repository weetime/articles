import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

type B = {mrr: number; val: number; kv: number; tag?: string; color: string};
const BARS: B[] = [
  {mrr: 32, val: 568, kv: 30, tag: '默认', color: C.off},
  {mrr: 48, val: 619, kv: 43, color: C.ink3},
  {mrr: 64, val: 720, kv: 57, color: C.ink3},
  {mrr: 96, val: 823, kv: 78, tag: '甜点', color: C.green},
  {mrr: 128, val: 842, kv: 100, tag: '墙', color: C.rose},
];
const MAXH = 500;
const MAXV = 842;

const Bar: React.FC<{b: B; idx: number}> = ({b, idx}) => {
  const frame = useCurrentFrame();
  const start = 40 + idx * 100;
  const g = interpolate(frame, [start, start + 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const h = (b.val / MAXV) * MAXH * g;
  const val = Math.round(b.val * g);
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
      <div style={{height: 34, marginBottom: 6, display: 'flex', alignItems: 'center'}}>
        {b.tag ? (
          <div style={{fontSize: 20, fontWeight: 800, color: b.color, background: `${b.color}1f`, border: `1px solid ${b.color}66`, borderRadius: 999, padding: '3px 14px', whiteSpace: 'nowrap', opacity: g}}>{b.tag}</div>
        ) : null}
      </div>
      <div style={{fontSize: 34, fontWeight: 850, color: b.color, marginBottom: 8}}>{val}</div>
      <div style={{width: '78%', height: h, borderRadius: '10px 10px 0 0', background: b.color}} />
      <div style={{fontSize: 26, fontWeight: 800, color: C.ink2, marginTop: 14}}>{b.mrr}</div>
      <div style={{fontSize: 18, color: b.kv >= 100 ? C.rose : C.ink3, fontWeight: 600, marginTop: 2}}>KV {b.kv}%</div>
    </div>
  );
};

export const ChatWall: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cb = spring({frame: frame - 132, fps, config: {damping: 200}});
  return (
    <Frame>
      <Eyebrow n="02">Chat 并发</Eyebrow>
      <Title size={50}>抬并发上限,吞吐涨到<span style={{color: C.rose}}>显存墙</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, height: MAXH + 130, paddingTop: 50}}>
          {BARS.map((b, i) => (<Bar key={b.mrr} b={b} idx={i} />))}
        </div>
        <div style={{fontSize: 17, color: C.ink4, fontWeight: 600, textAlign: 'center', marginTop: 6}}>并发上限 max-running-requests →（峰值输出 tok/s）</div>
        <div style={{marginTop: 22, background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `4px solid ${C.green}`, borderRadius: 12, padding: '20px 24px', boxShadow: C.shadow, opacity: cb, transform: `translateY(${(1 - cb) * 14}px)`}}>
          <span style={{fontSize: 26, fontWeight: 700, color: C.ink2, lineHeight: 1.45}}>
            甜点 <b style={{color: C.green}}>96</b>:<b style={{color: C.ink}}>+45%</b>,显存留 22% 余量;到 128 打满 100%,只多 <b style={{color: C.ink}}>2%</b>。
          </span>
        </div>
      </div>
    </Frame>
  );
};
