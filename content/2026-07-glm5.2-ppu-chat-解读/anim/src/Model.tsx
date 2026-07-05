import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Card: React.FC<{label: string; value: string; sub: string; color: string; delay: number}> = ({label, value, sub, color, delay}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'relative', background: C.panel, border: `1px solid ${C.line2}`, borderTop: `3px solid ${color}`, borderRadius: 18, padding: '28px 30px', boxShadow: `0 0 34px ${color}1c, ${C.shadow}`, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${color}22, transparent 70%)`}} />
      <div style={{fontSize: 22, color: C.ink3, fontWeight: 600}}>{label}</div>
      <div style={{fontSize: 50, fontWeight: 900, color, marginTop: 8, letterSpacing: -1, filter: `drop-shadow(0 0 16px ${color}44)`}}>{value}</div>
      <div style={{fontSize: 19, color: C.ink4, fontWeight: 500, marginTop: 6}}>{sub}</div>
    </div>
  );
};

const Gpu: React.FC<{i: number; delay: number}> = ({i, delay}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay + i * 5, delay + i * 5 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{flex: 1, height: 92, borderRadius: 12, background: `linear-gradient(180deg, ${C.violet}26, ${C.violet}10)`, border: `1.5px solid ${C.violet}66`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o, transform: `scale(${0.9 + o * 0.1})`, boxShadow: `0 0 18px ${C.violet}22`}}>
      <div style={{fontSize: 22, fontWeight: 850, color: C.violet2}}>PPU{i}</div>
      <div style={{fontSize: 14, color: C.ink4, marginTop: 2}}>96G</div>
    </div>
  );
};

export const Model: React.FC = () => {
  const f = useCurrentFrame();
  const topo = interpolate(f, [108, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow n="01">模型 · 硬件</Eyebrow>
      <Title size={48}>744B MoE · <span style={{color: C.violet2}}>DSA 稀疏注意力</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18}}>
          <Card label="总参数 / 激活" value="744B / 39B" sub="MoE · 256 专家 top-8" color={C.violet2} delay={30} />
          <Card label="架构 / 注意力" value="MoE + DSA" sub="稀疏注意力 · 自带 MTP" color={C.blue} delay={44} />
          <Card label="量化 / 上下文" value="W4A8 · 32K" sub="mixed_precision_w4" color={C.cyan} delay={58} />
          <Card label="引擎 · 并行" value="SGLang · TP8" sub="nsa = flashmla_sparse" color={C.green} delay={72} />
        </div>
        <div style={{opacity: topo, transform: `translateY(${(1 - topo) * 14}px)`, background: C.panel, border: `1px solid ${C.line2}`, borderTop: `3px solid ${C.amber}`, borderRadius: 18, padding: '26px 26px', boxShadow: `0 0 34px ${C.amber}12, ${C.shadow}`}}>
          <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginBottom: 16}}>硬件 · <span style={{color: C.amber}}>PPU-ZW810E ×8</span>(sm80 / Ampere 级 · 无 FP8)</div>
          <div style={{display: 'flex', gap: 11}}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Gpu key={i} i={i} delay={112} />)}
          </div>
          <div style={{fontSize: 20, color: C.ink4, fontWeight: 500, marginTop: 16, textAlign: 'center'}}>张量并行 TP = 8 · 单节点</div>
        </div>
      </div>
    </Frame>
  );
};
