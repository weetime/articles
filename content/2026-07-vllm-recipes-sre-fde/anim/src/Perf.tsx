import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type E = {name: string; tput: number; ttft: string; win?: boolean};
const ENG: E[] = [
  {name: 'vLLM', tput: 1228, ttft: '1.2s', win: true},
  {name: 'MindIE', tput: 764, ttft: '25.3s'},
  {name: 'SGLang', tput: 550, ttft: '9.0s'},
];
const MAX = 1228;

const Row: React.FC<{e: E; idx: number}> = ({e, idx}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = 30 + idx * 14;
  const t = interpolate(frame, [start, start + 56], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const val = Math.round(e.tput * t);
  const w = (e.tput / MAX) * 100 * t;
  const color = e.win ? C.green : C.ink3;
  const fill = e.win ? C.fillGreen : C.fillOff;
  const badge = spring({frame: frame - (start + 46), fps, config: {damping: 200}});
  return (
    <div style={{marginTop: idx === 0 ? 0 : 24}}>
      <div style={{display: 'flex', alignItems: 'baseline', marginBottom: 10}}>
        <span style={{fontSize: 34, fontWeight: 850, color: e.win ? C.green : C.ink}}>{e.name}</span>
        <span style={{marginLeft: 16, fontSize: 24, fontWeight: 700, color: C.ink3}}>TTFT p50 <b style={{color: e.win ? C.green : C.rose}}>{e.ttft}</b></span>
        <span style={{marginLeft: 'auto', fontSize: 40, fontWeight: 850, color, letterSpacing: -1}}>{val}<span style={{fontSize: 24, color: C.ink3, marginLeft: 4}}>tok/s</span></span>
      </div>
      <div style={{position: 'relative', height: 34, background: C.track, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.line}`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`, background: fill, borderRadius: 11}} />
        {e.win && badge > 0 && (
          <span style={{position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) scale(${0.7 + badge * 0.3})`, fontSize: 20, fontWeight: 800, color: '#04140c', opacity: badge}}>最快</span>
        )}
      </div>
    </div>
  );
};

export const Perf: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const punch = interpolate(frame, [118, 138], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '240px 64px 500px', display: 'flex', flexDirection: 'column', opacity: intro}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 800, color: C.amber}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.amber, boxShadow: `0 0 16px ${C.amber}88`}} />
          第二关 · 跑得好不好
        </div>
        <div style={{fontSize: 66, fontWeight: 850, letterSpacing: -1.5, marginTop: 16}}>
          只换引擎,<span style={{color: C.amber}}>差多少?</span>
        </div>
        <div style={{fontSize: 26, fontWeight: 600, color: C.ink3, marginTop: 14}}>
          昇腾 910B4 · Qwen3-32B · 同一份真实流量 · c128
        </div>
        <div style={{marginTop: 46, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 24, padding: '38px 34px', boxShadow: C.shadow}}>
          {ENG.map((e, i) => (<Row key={e.name} e={e} idx={i} />))}
        </div>
        <div style={{marginTop: 40, textAlign: 'center', fontSize: 34, fontWeight: 850, opacity: punch, transform: `scale(${0.9 + punch * 0.1})`}}>
          吞吐差 <span style={{color: C.green}}>2.2×</span> · 首字延迟差 <span style={{color: C.rose}}>20×</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
