import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Stat: React.FC<{lab: string; big: React.ReactNode; sub: string; delay: number}> = ({lab, big, sub, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{background: C.panel, border: `1px solid ${C.rose}55`, borderRadius: 22, padding: '28px 32px', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div style={{fontSize: 26, fontWeight: 700, color: C.ink3}}>{lab}</div>
      <div style={{fontSize: 74, fontWeight: 850, letterSpacing: -2, marginTop: 8, color: C.rose, lineHeight: 1.05}}>{big}</div>
      <div style={{fontSize: 25, fontWeight: 600, color: C.ink2, marginTop: 10, lineHeight: 1.4}}>{sub}</div>
    </div>
  );
};

export const Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const ttft = Math.round(interpolate(frame, [30, 60], [0, 108], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const mech = interpolate(frame, [120, 142], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow n="04">Agent 场景</Eyebrow>
      <Title size={50}>换成 Agent 长输入,<span style={{color: C.rose}}>单实例扛不住</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
        <Stat lab="首字延迟 TTFT(中位数)" big={<>65–{ttft} <span style={{fontSize: 40}}>秒</span></>} sub="短对话时只有零点几秒 —— 慢了上百倍" delay={20} />
        <Stat lab="实际处理速度" big={<>0.6–1.7 <span style={{fontSize: 40}}>req/s</span></>} sub="而轨迹需求 3.9 req/s → 供不应求 2–7 倍,全堆在队列" delay={64} />
        <div style={{fontSize: 26, fontWeight: 650, color: C.ink2, lineHeight: 1.5, textAlign: 'center', opacity: mech, transform: `translateY(${(1 - mech) * 12}px)`}}>
          长输入(预填充重)+ 短输出 → 瓶颈在<b style={{color: C.ink}}>算力</b>,不在并发/显存<br />调参救不了,要 <b style={{color: C.violet}}>PD 分离 + 多机</b>
        </div>
      </div>
    </Frame>
  );
};
