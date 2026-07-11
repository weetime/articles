import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const BARS = [
  {k: 'pass¹', v: 81.5, color: C.green},
  {k: 'pass²', v: 76.3, color: C.green2},
  {k: 'pass³', v: 72.0, color: C.amber},
  {k: 'pass⁴', v: 68.0, color: C.rose},
];

const Bar: React.FC<{b: typeof BARS[0]; idx: number; land: boolean}> = ({b, idx, land}) => {
  const frame = useCurrentFrame();
  const start = 44 + idx * 12;
  const t = interpolate(frame, [start, start + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const maxH = land ? 320 : 440;
  const h = (b.v / 100) * maxH * t;
  const val = b.v * t;
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
      <div style={{fontSize: land ? 34 : 42, fontWeight: 850, color: b.color, letterSpacing: -1}}>{val.toFixed(0)}%</div>
      <div style={{width: '72%', height: h, background: `linear-gradient(180deg,${b.color},${b.color}bb)`, borderRadius: '12px 12px 0 0', marginTop: 8, boxShadow: `0 0 22px ${b.color}44`}} />
      <div style={{fontSize: 23, fontWeight: 700, color: C.ink3, marginTop: 12}}>{b.k}</div>
    </div>
  );
};

export const PassK: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const head = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const anchor = interpolate(frame, [110, 132], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{padding: land ? '70px 90px 120px' : '224px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: head}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            核心指标 · pass^k
          </div>
          <div style={{fontSize: land ? 54 : 60, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>
            不是会不会,是<span style={{color: C.rose}}>稳不稳</span>
          </div>
          <div style={{fontSize: 25, fontWeight: 600, color: C.ink3, marginTop: 10, lineHeight: 1.4}}>
            同一任务做 k 次,<b style={{color: C.ink}}>次次都成功</b>的比例
          </div>
        </div>

        <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 10, padding: '30px 10px 0'}}>
          {BARS.map((b, i) => <Bar key={b.k} b={b} idx={i} land={land} />)}
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8}}>
          <div style={{fontSize: 25, fontWeight: 700, color: C.ink2, textAlign: 'center'}}>
            pass¹ 高、pass^k 低 = <b style={{color: C.rose}}>会做但不稳</b> · 生产每请求只有一次机会
          </div>
          <div style={{opacity: anchor, textAlign: 'center', fontSize: 22, fontWeight: 700, color: C.amber, background: `${C.amber}14`, border: `1px solid ${C.amber}44`, borderRadius: 14, padding: '14px 20px'}}>
            公开榜:连 GPT-4o 都 &lt;50% · retail 连对 8 次 &lt;25%
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
