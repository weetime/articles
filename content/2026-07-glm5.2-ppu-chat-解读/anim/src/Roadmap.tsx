import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Item: React.FC<{n: string; title: string; sub: string; color: string; delay: number}> = ({n, title, sub, color, delay}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 24, background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `5px solid ${color}`, borderRadius: 16, padding: '24px 28px', boxShadow: `0 0 30px ${color}16, ${C.shadow}`, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div style={{fontSize: 40, fontWeight: 900, color, fontFamily: 'ui-monospace, Menlo, monospace', width: 56, flexShrink: 0, filter: `drop-shadow(0 0 14px ${color}55)`}}>{n}</div>
      <div style={{flex: 1}}>
        <div style={{fontSize: 33, fontWeight: 850, color: C.ink}}>{title}</div>
        <div style={{fontSize: 22, color: C.ink3, fontWeight: 500, marginTop: 4}}>{sub}</div>
      </div>
    </div>
  );
};

export const Roadmap: React.FC = () => {
  return (
    <Frame>
      <Eyebrow>调优方向 · 建议</Eyebrow>
      <Title size={46}>若要更高吞吐,<span style={{color: C.violet2}}>几个可选方向</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 12}}>
        <Item n="01" title="双副本 · 16 卡聚合吞吐" sub="空闲 8 卡起独立实例 + 前置路由,目标 ~2×" color={C.green2} delay={30} />
        <Item n="02" title="PD 分离" sub="prefill / decode 拆池,降 agent 长输入 TTFT" color={C.cyan} delay={52} />
        <Item n="03" title="W8A8 权重 → 投机复评" sub="INT8 下草稿头不被劣化,重评 MTP" color={C.violet2} delay={74} />
        <Item n="04" title="长上下文 · prefill 调优" sub="chunked-prefill-size 与调度参数" color={C.amber} delay={96} />
        <Item n="05" title="W4A8 kernel 优化跟进" sub="决定单流速度上限的关键路径" color={C.rose} delay={118} />
      </div>
    </Frame>
  );
};
