import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type M = {key: string; label: string; oa: number; an: number; unit: string; dec: number; delta: string; scale: number};
const METRICS: M[] = [
  {key: 'tp50', label: 'TTFT P50', oa: 304.2, an: 297.6, unit: ' ms', dec: 1, delta: 'Δ 2.2%', scale: 1},
  {key: 'tp95', label: 'TTFT P95', oa: 594.6, an: 566.0, unit: ' ms', dec: 1, delta: 'Δ 4.8%', scale: 1},
  {key: 'cp50', label: '总时延 P50', oa: 21.54, an: 21.51, unit: ' s', dec: 2, delta: 'Δ 0.1%', scale: 1},
  {key: 'cp95', label: '总时延 P95', oa: 21.78, an: 21.68, unit: ' s', dec: 2, delta: 'Δ 0.5%', scale: 1},
];

const Bar: React.FC<{tag: string; color: string; w: number; label: string; phase: number}> = ({tag, color, w, label, phase}) => {
  const frame = useCurrentFrame();
  const sx = -28 + (((frame + phase) % 102) / 102) * 156; // 持续扫光
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 12}}>
      <div style={{width: 92, fontSize: 18, fontWeight: 700, color: C.ink3, textAlign: 'right'}}>{tag}</div>
      <div style={{flex: 1, height: 30, background: C.track, borderRadius: 9, overflow: 'hidden', border: `1px solid ${C.line}`}}>
        <div style={{position: 'relative', height: '100%', width: `${w}%`, background: color, borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sx}%`, width: '26%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)', transform: 'skewX(-18deg)'}} />
          <span style={{position: 'relative', fontSize: 17, fontWeight: 800, color: '#fff'}}>{label}</span>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{m: M; idx: number}> = ({m, idx}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = 34 + idx * 12;
  const t = interpolate(frame, [start, start + 56], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const oaV = m.oa * t, anV = m.an * t;
  const max = Math.max(m.oa, m.an);
  const fmt = (v: number) => v.toFixed(m.dec) + m.unit;
  const badge = spring({frame: frame - (start + 50), fps, config: {damping: 200}});
  return (
    <div style={{background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 22, padding: '22px 26px', boxShadow: C.shadow}}>
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.ink}}>{m.label}</div>
        <div style={{marginLeft: 'auto', fontSize: 21, fontWeight: 800, color: C.ink3, background: C.track, border: `1px solid ${C.line2}`, borderRadius: 999, padding: '5px 14px', opacity: badge}}>{m.delta}</div>
      </div>
      <Bar tag="OpenAI" color={C.fillCyan} w={(oaV / max) * 92} label={fmt(oaV)} phase={idx * 26} />
      <Bar tag="Anthropic" color={C.fillViolet} w={(anV / max) * 92} label={fmt(anV)} phase={idx * 26 + 51} />
    </div>
  );
};

export const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px' : '220px 56px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          OpenAI vs Anthropic · 四项指标
        </div>
        <div style={{fontSize: land ? 50 : 56, fontWeight: 850, marginTop: 12, letterSpacing: -1}}>
          四项指标，<span style={{color: C.green}}>几乎完全重合</span>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
            {METRICS.map((m, i) => (<Card key={m.key} m={m} idx={i} />))}
          </div>
        </div>
        <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, textAlign: 'center'}}>
          所有差异 <b style={{color: C.ink2}}>|Δ%| &lt; 5%</b>，且小于样本自身标准差 · 统计上无可测差异
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
