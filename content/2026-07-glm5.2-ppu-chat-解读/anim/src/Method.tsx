import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Step: React.FC<{n: string; title: string; sub: string; color: string; delay: number; last?: boolean}> = ({n, title, sub, color, delay, last}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const arrow = interpolate(f, [delay + 10, delay + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `5px solid ${color}`, borderRadius: 16, padding: '24px 28px', boxShadow: `0 0 30px ${color}16, ${C.shadow}`, opacity: o, transform: `translateX(${(1 - o) * -18}px)`}}>
        <div style={{width: 58, height: 58, flexShrink: 0, borderRadius: 14, background: `linear-gradient(180deg,${color}33,${color}14)`, border: `1.5px solid ${color}66`, color, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px ${color}33`}}>{n}</div>
        <div>
          <div style={{fontSize: 33, fontWeight: 850, color: C.ink}}>{title}</div>
          <div style={{fontSize: 22, color: C.ink3, fontWeight: 500, marginTop: 4}}>{sub}</div>
        </div>
      </div>
      {!last && <div style={{alignSelf: 'center', width: 3, height: 26, background: C.line2, opacity: arrow}}>
        <div style={{width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `9px solid ${C.ink4}`, transform: 'translate(-6px,26px)', opacity: arrow}} />
      </div>}
    </div>
  );
};

export const Method: React.FC = () => {
  return (
    <Frame>
      <Eyebrow n="02">方法 · OFAT</Eyebrow>
      <Title size={46}>控制变量,<span style={{color: C.violet}}>一次一因子</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 0}}>
        <Step n="1" title="部署基线" sub="TP8 · mrr=32 · flashmla_sparse" color={C.violet} delay={30} />
        <Step n="2" title="OFAT 扫 mrr" sub="32 → 48 → 64 → 96,一次一档" color={C.cyan} delay={60} />
        <Step n="3" title="evalscope 压测" sub="ShareGPT · 关思考 · 并发扫描" color={C.green} delay={90} />
        <Step n="4" title="3 轮取中位" sub="seed=42 · 轮间抖动 < 1.5%" color={C.amber} delay={120} />
        <Step n="5" title="/metrics 归因" sub="吞吐 · TTFT · ITL · TPOT · p50/95/99" color={C.violet2} delay={150} last />
      </div>
    </Frame>
  );
};
