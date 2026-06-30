import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const easeOut = Easing.out(Easing.cubic);

type M = {key: string; label: string; off: number; on: number; unit: string; decimals: number; delta: string; up: boolean};
const METRICS: M[] = [
  {key: 'hit', label: 'Prefix-cache hit rate', off: 22.0, on: 65.4, unit: '%', decimals: 1, delta: '▲ +197%', up: true},
  {key: 'tps', label: 'Throughput req/s', off: 2.88, on: 4.73, unit: '', decimals: 2, delta: '▲ +64%', up: true},
  {key: 'ttft', label: 'TTFT P95 (s)', off: 20.0, on: 11.9, unit: '', decimals: 1, delta: '▼ −40%', up: false},
  {key: 'otps', label: 'Output TPS', off: 186, on: 310, unit: '', decimals: 0, delta: '▲ +67%', up: true},
];
const fmt = (v: number, d: number) => v.toFixed(d);

const StatCard: React.FC<{m: M; idx: number; land: boolean}> = ({m, idx, land}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = 36 + idx * 10;
  const t = interpolate(frame, [start, start + 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut});
  const val = m.off + (m.on - m.off) * t;
  const max = Math.max(m.off, m.on);
  const offW = (m.off / max) * 100;
  const onW = (val / max) * 100;
  const color = m.up ? C.green : C.cyan;
  const fill = m.up ? C.fillGreen : C.fillCyan;
  const badge = spring({frame: frame - (start + 60), fps, config: {damping: 200}});
  return (
    <div style={{flex: land ? 1 : undefined, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 22, padding: land ? '24px 24px' : '24px 30px', boxShadow: C.shadow, marginTop: land ? 0 : 20}}>
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <div style={{fontSize: land ? 22 : 26, fontWeight: 700, color: C.ink2}}>{m.label}</div>
        <div style={{marginLeft: 'auto', fontSize: land ? 22 : 26, fontWeight: 800, color, opacity: badge, transform: `scale(${0.7 + badge * 0.3})`, padding: '5px 14px', borderRadius: 999, background: m.up ? `${C.green}1f` : `${C.cyan}1f`, border: `1px solid ${m.up ? C.green : C.cyan}55`}}>{m.delta}</div>
      </div>
      <div style={{fontSize: land ? 52 : 60, fontWeight: 850, letterSpacing: -1.5, marginTop: 10, color: C.ink}}>
        {fmt(val, m.decimals)}<span style={{fontSize: land ? 30 : 34}}>{m.unit}</span>
      </div>
      <div style={{position: 'relative', marginTop: 16, height: 28, background: C.track, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.line}`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${offW}%`, background: `repeating-linear-gradient(45deg,${C.offDeep},${C.offDeep} 8px,${C.line2} 8px,${C.line2} 16px)`, opacity: 0.8}} />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${onW}%`, background: fill, borderRadius: 9}} />
      </div>
      <div style={{marginTop: 10, fontSize: land ? 16 : 18, color: C.ink3, fontWeight: 600}}>
        OFF {fmt(m.off, m.decimals)}{m.unit}　→　ON {fmt(m.on, m.decimals)}{m.unit}
      </div>
    </div>
  );
};

export const BarRaceEN: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 80px 130px' : '210px 60px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          Four metrics · OFF vs ON
        </div>
        <div style={{fontSize: land ? 50 : 56, fontWeight: 800, marginTop: 12, letterSpacing: -1}}>
          One switch, <span style={{color: C.green}}>all four improve</span>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: land ? 'row' : 'column', gap: land ? 20 : 0}}>
            {METRICS.map((m, i) => (<StatCard key={m.key} m={m} idx={i} land={land} />))}
          </div>
        </div>
        <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, textAlign: 'center'}}>
          Hit rate ↑ → reclaimed prefill compute → throughput ↑ &nbsp;&amp;&nbsp; latency ↓ · no trade-off
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
