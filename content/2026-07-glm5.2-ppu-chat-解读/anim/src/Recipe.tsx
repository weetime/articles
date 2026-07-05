import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

const Line: React.FC<{children: React.ReactNode; delay: number; hi?: boolean}> = ({children, delay, hi}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{fontFamily: MONO, fontSize: 27, lineHeight: 1.72, color: hi ? C.ink : C.ink2, opacity: o,
      background: hi ? C.violet + '22' : 'transparent', borderLeft: `3px solid ${hi ? C.violet : 'transparent'}`,
      paddingLeft: 12, borderRadius: 4}}>{children}</div>
  );
};

const Diff: React.FC<{sign: string; delay: number; children: React.ReactNode}> = ({sign, delay, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const col = sign === '+' ? C.green : C.rose;
  return (
    <div style={{fontFamily: MONO, fontSize: 26, lineHeight: 1.7, color: col, opacity: o,
      background: col + '14', paddingLeft: 12, borderRadius: 4}}>{sign} {children}</div>
  );
};

export const Recipe: React.FC = () => {
  const f = useCurrentFrame();
  const diff = interpolate(f, [138, 164], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow>当前环境 · 最优配方</Eyebrow>
      <Title size={46}>8 卡 PPU 上的<span style={{color: C.violet2}}>最优配方</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 24}}>
        <div style={{background: C.panel, border: `1px solid ${C.line2}`, borderTop: `3px solid ${C.green}`, borderRadius: 18, padding: '28px 32px', boxShadow: `0 0 34px ${C.green}18, ${C.shadow}`}}>
          <div style={{fontSize: 23, fontWeight: 700, color: C.green, marginBottom: 16}}>✓ 最优配方 · SGLang(直接用)</div>
          <Line delay={40}>--tp 8   --context-length 32768</Line>
          <Line delay={58}>--kv-cache-dtype bfloat16</Line>
          <Line delay={76}>--nsa-decode-backend flashmla_sparse</Line>
          <Line delay={100} hi>--max-running-requests 32   ← 最优 = 32</Line>
          <Line delay={120}>--cuda-graph-bs 32   · 关闭投机</Line>
        </div>
        <div style={{opacity: diff, transform: `translateY(${(1 - diff) * 18}px)`, background: C.panel, border: `1px solid ${C.line2}`, borderTop: `3px solid ${C.rose}`, borderRadius: 18, padding: '24px 32px', boxShadow: `0 0 34px ${C.rose}14, ${C.shadow}`}}>
          <div style={{fontSize: 22, fontWeight: 700, color: C.rose, marginBottom: 14}}>✗ 试过的改动 → 实测反而更差</div>
          <Diff sign="✗" delay={166}>并发上限抬到 48 / 64 / 96　峰值不升(见后)</Diff>
          <div style={{height: 12}} />
          <Diff sign="✗" delay={200}>开 EAGLE 投机　单流慢 2×(见后)</Diff>
        </div>
      </div>
    </Frame>
  );
};
