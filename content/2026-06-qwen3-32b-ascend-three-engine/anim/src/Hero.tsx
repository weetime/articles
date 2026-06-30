import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
type Lang = 'zh' | 'en';
const TXT = {
  zh: {eyebrow: 'ModelDoctor · 昇腾三引擎横评', tag: 'Qwen3-32B · ShareGPT', t1: '同一个 Qwen3-32B', t2: '三引擎吞吐相差 2.2 倍',
    sub: ['同一台 ', 'Ascend 910B4', '(每引擎 TP=4)、同一个 ', 'Qwen3-32B', '、同一份 ', 'ShareGPT 真实流量', ',prefix caching 三家全开。8→128 五档并发,每档跑 3 次取中位数,全部 45 轮 0 错误。'],
    rank: 'c128 输出吞吐', unit: 'tokens / s · 越高越好',
    chips: ['硬件 Ascend 910B4 ×4 · TP=4', '数据集 ShareGPT · max_tokens 512', '压测 evalscope perf', '并发档 8 / 16 / 32 / 64 / 128'],
    brand: '多引擎推理可观测'},
  en: {eyebrow: 'ModelDoctor · Ascend three-engine benchmark', tag: 'Qwen3-32B · ShareGPT', t1: 'Same Qwen3-32B,', t2: '2.2× throughput gap',
    sub: ['One ', 'Ascend 910B4', ' (TP=4 per engine), one ', 'Qwen3-32B', ', one shared ', 'ShareGPT real workload', '. Prefix caching on for all three. Five concurrency levels 8→128, 3-run median each, 45 runs at 0% error.'],
    rank: 'c128 output throughput', unit: 'tokens / s · higher is better',
    chips: ['Ascend 910B4 ×4 · TP=4', 'ShareGPT · max_tokens 512', 'evalscope perf', 'concurrency 8 / 16 / 32 / 64 / 128'],
    brand: 'multi-engine inference observability'},
};

const RankBar: React.FC<{name: string; val: number; max: number; color: string; fill: string; delay: number}> = ({name, val, max, color, fill, delay}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const w = (val / max) * 100 * t;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 18}}>
      <div style={{width: 188, textAlign: 'right', fontSize: 28, fontWeight: 800, color}}>{name}</div>
      <div style={{flex: 1, height: 52, background: C.track, borderRadius: 13, overflow: 'hidden', border: `1px solid ${C.line}`}}>
        <div style={{width: `${w}%`, height: '100%', background: fill, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 18, fontSize: 27, fontWeight: 850, color: '#fff'}}>
          {Math.round(val * t)}
        </div>
      </div>
    </div>
  );
};

export const Hero: React.FC<{lang?: Lang}> = ({lang = 'zh'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const S = TXT[lang];
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [16, 38], [0, 1], {extrapolateRight: 'clamp', easing: eo});

  const titleBlock = (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet, opacity: t1}}>
        <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
        {S.eyebrow}
      </div>
      <div style={{fontSize: land ? 64 : 70, fontWeight: 850, lineHeight: 1.08, letterSpacing: -2, marginTop: 20, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
        {S.t1}
      </div>
      <div style={{fontSize: land ? 52 : 60, fontWeight: 850, letterSpacing: -1.5, marginTop: 8, opacity: t2, transform: `translateY(${(1 - t2) * 18}px)`, background: 'linear-gradient(100deg,#8b6dff,#2bc4e6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        {S.t2}
      </div>
    </div>
  );

  const rankBlock = (
    <div style={{background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 24, padding: '30px 32px', boxShadow: C.shadow}}>
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.ink}}>{S.rank}</div>
        <div style={{marginLeft: 'auto', fontSize: 19, fontWeight: 600, color: C.ink3}}>{S.unit}</div>
      </div>
      <RankBar name="vLLM-Ascend" val={1228} max={1228} color={C.violet} fill={C.fillViolet} delay={30} />
      <RankBar name="MindIE" val={764} max={1228} color={C.amber} fill="linear-gradient(90deg,#d97706,#f0a93b)" delay={42} />
      <RankBar name="SGLang" val={550} max={1228} color={C.ink3} fill={C.fillOff} delay={54} />
    </div>
  );

  const chipsRow = (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: land ? 'flex-start' : 'center'}}>
      {S.chips.map((tx, i) => {
        const o = interpolate(frame, [70 + i * 8, 84 + i * 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '13px 20px', fontSize: 20, fontWeight: 700, color: C.ink2, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, boxShadow: C.shadow}}>
            <span style={{width: 7, height: 7, borderRadius: 2, background: C.violet}} />{tx}
          </div>
        );
      })}
    </div>
  );

  const sub = (
    <div style={{fontSize: 22, color: C.ink2, marginTop: 16, lineHeight: 1.5, display: 'none'}}>{S.sub.join('')}</div>
  );

  if (land) {
    return (
      <Bg>
        <AbsoluteFill style={{padding: '90px 90px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 44}}>{titleBlock}{chipsRow}</div>
          <div style={{flex: 1.15}}>{rankBlock}</div>
        </AbsoluteFill>
      </Bg>
    );
  }
  return (
    <Bg>
      <AbsoluteFill style={{padding: '220px 60px 500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        {titleBlock}{sub}{rankBlock}{chipsRow}
      </AbsoluteFill>
    </Bg>
  );
};
