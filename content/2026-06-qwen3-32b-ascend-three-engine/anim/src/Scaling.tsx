import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const CONC = ['c8', 'c16', 'c32', 'c64', 'c128'];
const SERIES = [
  {key: 'vLLM', color: '#8b6dff', pts: [145, 280, 527, 828, 1228]},
  {key: 'MindIE', color: '#f0a93b', pts: [177, 296, 490, 631, 764]},
  {key: 'SGLang', color: '#9aa0b4', pts: [144, 267, 461, 721, 550]},
];
// SVG plot coords (viewBox 0 0 960 420)
const VBX = 960, VBY = 420, L = 64, R = 852, T = 28, B = 366, MAXY = 1300;
const X = (i: number) => L + (i * (R - L)) / 4;
const Y = (v: number) => B - (v / MAXY) * (B - T);

type Lang = 'zh' | 'en';
const TXT = {
  zh: {eyebrow: '吞吐扩展性 · 输出 tokens/s', t1: 'c64 之后,', t2: '吞吐曲线分化',
    note: ['c8–c32 三家几乎重合;c64 之后差距拉开 —— ', 'vLLM 增至 1228 仍未饱和', ',SGLang c128 ', '回退 721→550']},
  en: {eyebrow: 'Throughput scaling · output tokens/s', t1: 'Past c64, ', t2: 'the curves diverge',
    note: ['c8–c32 nearly overlap; past c64 they split — ', 'vLLM climbs to 1228, unsaturated', '; SGLang ', 'drops 721→550 at c128']},
};

export const Scaling: React.FC<{lang?: Lang}> = ({lang = 'zh'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const S = TXT[lang];
  const intro = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const p = interpolate(frame, [18, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [104, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px 120px' : '220px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          {S.eyebrow}
        </div>
        <div style={{fontSize: land ? 50 : 56, fontWeight: 850, marginTop: 14, letterSpacing: -1.2}}>
          {S.t1}<span style={{color: C.violet}}>{S.t2}</span>
        </div>

        <div style={{display: 'flex', gap: 28, marginTop: 22, fontSize: 20, fontWeight: 700, color: C.ink2}}>
          {SERIES.map((s) => (
            <span key={s.key}><i style={{display: 'inline-block', width: 15, height: 15, borderRadius: 4, background: s.color, marginRight: 8, verticalAlign: -1}} />{s.key}</span>
          ))}
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 24, padding: '26px 24px 16px', boxShadow: C.shadow}}>
            <svg viewBox={`0 0 ${VBX} ${VBY}`} style={{width: '100%', display: 'block'}}>
              {/* gridlines */}
              {[0, 400, 800, 1200].map((g) => (
                <g key={g}>
                  <line x1={L} y1={Y(g)} x2={R} y2={Y(g)} stroke={C.line2} strokeWidth={1} />
                  <text x={L - 12} y={Y(g) + 6} textAnchor="end" fontSize={20} fill={C.ink3} fontWeight={600}>{g}</text>
                </g>
              ))}
              {/* lines (draw-on via dashoffset) */}
              {SERIES.map((s) => {
                const d = s.pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${X(i)},${Y(v)}`).join(' ');
                return <path key={s.key} d={d} fill="none" stroke={s.color} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
              })}
              {/* dots + end value labels, revealed as the line passes */}
              {SERIES.map((s) => s.pts.map((v, i) => {
                const seg = i / 4;
                const o = interpolate(p, [seg - 0.02, seg + 0.05], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
                const last = i === 4;
                return (
                  <g key={s.key + i} opacity={o}>
                    <circle cx={X(i)} cy={Y(v)} r={last ? 8 : 5} fill={s.color} />
                    {last && <text x={X(i) + 14} y={Y(v) + 7} fontSize={26} fontWeight={850} fill={s.color}>{v}</text>}
                  </g>
                );
              }))}
              {/* x axis labels */}
              {CONC.map((c, i) => (
                <text key={c} x={X(i)} y={VBY - 8} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.ink2}>{c}</text>
              ))}
            </svg>
          </div>
        </div>

        <div style={{fontSize: 23, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: note, lineHeight: 1.5}}>
          {S.note[0]}<b style={{color: C.violet}}>{S.note[1]}</b>{S.note[2]}<b style={{color: C.rose}}>{S.note[3]}</b>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
