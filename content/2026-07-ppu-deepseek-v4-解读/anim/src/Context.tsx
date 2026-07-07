import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Side: React.FC<{lab: string; big: string; sub: string; color: string; delay: number}> = ({lab, big, sub, color, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{flex: 1, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 22, padding: '30px 26px', textAlign: 'center', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div style={{fontSize: 24, fontWeight: 700, color: C.ink3}}>{lab}</div>
      <div style={{fontSize: 82, fontWeight: 850, letterSpacing: -3, marginTop: 10, color}}>{big}</div>
      <div style={{fontSize: 22, fontWeight: 600, color: C.ink3, marginTop: 8}}>{sub}</div>
    </div>
  );
};

export const Context: React.FC = () => {
  const frame = useCurrentFrame();
  const note = interpolate(frame, [66, 88], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow n="05">上下文</Eyebrow>
      <Title size={50}>上下文:卡在<span style={{color: C.rose}}>显存</span>,不是模型</Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26}}>
        <div style={{display: 'flex', gap: 20, alignItems: 'stretch'}}>
          <Side lab="模型能力" big="1M" sub="官方支持百万 token" color={C.green} delay={22} />
          <Side lab="部署实际" big="8K→64K" sub="原本锁死 8192" color={C.violet} delay={40} />
        </div>
        <div style={{background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `4px solid ${C.violet}`, borderRadius: 12, padding: '20px 24px', boxShadow: C.shadow, opacity: note, transform: `translateY(${(1 - note) * 14}px)`}}>
          <span style={{fontSize: 25, fontWeight: 650, color: C.ink2, lineHeight: 1.5}}>
            调大 context <b style={{color: C.ink}}>不吃 KV 池</b>,只放行长请求;8K 会直接拒掉真实 Agent <b style={{color: C.rose}}>24%</b> 的请求(最长 124K)。
          </span>
        </div>
      </div>
    </Frame>
  );
};
