import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const STEPS = [
  {n: '01', h: '看峰值,也看低并发', p: '同一档参数轻负载可能更慢,有固定开销'},
  {n: '02', h: '吞吐的尽头是显存墙', p: 'KV 占满后再加并发,不涨反抖'},
  {n: '03', h: '分清两类负载', p: '对话吃并发(调参)/ Agent 吃算力(架构)'},
  {n: '04', h: '一次实验不是普适结论', p: '换模型 / 数据集 / 硬件,甜点会移'},
];

const Row: React.FC<{s: typeof STEPS[0]; idx: number}> = ({s, idx}) => {
  const frame = useCurrentFrame();
  const delay = 20 + idx * 14;
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', gap: 22, alignItems: 'center', background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 16, padding: '22px 26px', boxShadow: C.shadow, opacity: o, transform: `translateX(${(1 - o) * 20}px)`}}>
      <div style={{fontSize: 40, fontWeight: 850, color: C.violet, minWidth: 62}}>{s.n}</div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 30, fontWeight: 800, color: C.ink}}>{s.h}</div>
        <div style={{fontSize: 23, fontWeight: 600, color: C.ink3, marginTop: 5, lineHeight: 1.35}}>{s.p}</div>
      </div>
    </div>
  );
};

export const HowRead: React.FC = () => {
  return (
    <Frame>
      <Eyebrow n="06">怎么读</Eyebrow>
      <Title size={50}>读这类报告,盯住四件事</Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
        {STEPS.map((s, i) => (<Row key={s.n} s={s} idx={i} />))}
      </div>
    </Frame>
  );
};
