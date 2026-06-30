import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type Lang = 'zh' | 'en';
type Row = {tag: string; color: string; fill: string; w: number; val: string};
type Block = {name: string; nameEn: string; unit: string; win: string; winEn: string; rows: Row[]; delay: number};

const vF = 'linear-gradient(90deg,#a394ff,#7d68ff)';
const mF = 'linear-gradient(90deg,#f0a93b,#d97706)';
const sF = 'linear-gradient(90deg,#7a8494,#5b6473)';

const TXT = {
  zh: {eyebrow: 'c128 延迟快照 · p50 越低越好', t1: 'c128 三引擎', t2: '延迟分布'},
  en: {eyebrow: 'c128 latency snapshot · p50 lower is better', t1: 'Latency distribution ', t2: 'at c128'},
};

const BLOCKS: Block[] = [
  {name: 'TTFT 首字延迟', nameEn: 'TTFT first-token', unit: 'p50', win: 'vLLM 比 MindIE 低 21×', winEn: 'vLLM 21× lower', delay: 24, rows: [
    {tag: 'vLLM', color: C.violet, fill: vF, w: 5, val: '1.2 s'},
    {tag: 'SGLang', color: C.off, fill: sF, w: 36, val: '9.0 s'},
    {tag: 'MindIE', color: C.amber, fill: mF, w: 100, val: '25.3 s'},
  ]},
  {name: 'ITL 逐 token 延迟', nameEn: 'ITL inter-token', unit: 'p50', win: 'vLLM ≈ MindIE', winEn: 'vLLM ≈ MindIE', delay: 40, rows: [
    {tag: 'vLLM', color: C.violet, fill: vF, w: 50, val: '100 ms'},
    {tag: 'MindIE', color: C.amber, fill: mF, w: 53, val: '106 ms'},
    {tag: 'SGLang', color: C.off, fill: sF, w: 100, val: '202 ms'},
  ]},
  {name: 'E2E 端到端时延', nameEn: 'E2E end-to-end', unit: 'p50', win: 'vLLM 最低', winEn: 'vLLM lowest', delay: 56, rows: [
    {tag: 'vLLM', color: C.violet, fill: vF, w: 48, val: '52.5 s'},
    {tag: 'MindIE', color: C.amber, fill: mF, w: 67, val: '73.6 s'},
    {tag: 'SGLang', color: C.off, fill: sF, w: 100, val: '110 s'},
  ]},
];

const Bar: React.FC<{r: Row; delay: number}> = ({r, delay}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 11}}>
      <div style={{width: 110, textAlign: 'right', fontSize: 20, fontWeight: 800, color: r.color}}>{r.tag}</div>
      <div style={{flex: 1, height: 30, background: C.track, borderRadius: 9, overflow: 'hidden', border: `1px solid ${C.line}`}}>
        <div style={{width: `${r.w * t}%`, height: '100%', background: r.fill, borderRadius: 8}} />
      </div>
      <div style={{width: 96, fontSize: 22, fontWeight: 850, color: C.ink, opacity: t}}>{r.val}</div>
    </div>
  );
};

export const Latency: React.FC<{lang?: Lang}> = ({lang = 'zh'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const S = TXT[lang];

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px 120px' : '220px 56px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          {S.eyebrow}
        </div>
        <div style={{fontSize: land ? 50 : 56, fontWeight: 850, marginTop: 14, letterSpacing: -1.2}}>
          {S.t1}<span style={{color: C.violet}}>{S.t2}</span>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
          {BLOCKS.map((b) => (
            <div key={b.name} style={{background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 22, padding: '22px 26px', boxShadow: C.shadow}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <div style={{fontSize: 24, fontWeight: 850, color: C.ink}}>{lang === 'en' ? b.nameEn : b.name}</div>
                <div style={{fontSize: 16, color: C.ink3, fontWeight: 600}}>{b.unit}</div>
                <div style={{marginLeft: 'auto', fontSize: 16, fontWeight: 800, color: C.violet, background: `${C.violet}1f`, border: `1px solid ${C.violet}55`, borderRadius: 999, padding: '5px 14px'}}>{lang === 'en' ? b.winEn : b.win}</div>
              </div>
              {b.rows.map((r, i) => (<Bar key={r.tag} r={r} delay={b.delay + i * 6} />))}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
