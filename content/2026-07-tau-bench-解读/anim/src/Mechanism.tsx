import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Node: React.FC<{title: string; sub: string; color: string; delay: number; big?: boolean}> = ({title, sub, color, delay, big}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{width: big ? 560 : 500, background: C.panel, border: `2.5px solid ${color}`, borderRadius: 22, padding: big ? '26px 30px' : '22px 30px', boxShadow: C.shadow, opacity: s, transform: `translateY(${(1 - s) * 20}px)`}}>
      <div style={{fontSize: big ? 40 : 34, fontWeight: 850, color, letterSpacing: -1}}>{title}</div>
      <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginTop: 6}}>{sub}</div>
    </div>
  );
};

const Arrow: React.FC<{label: string; delay: number; color: string; up?: boolean}> = ({label, delay, color, up}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: o, height: 54}}>
      <svg width={26} height={54} viewBox="0 0 26 54">
        <line x1={13} y1={up ? 50 : 4} x2={13} y2={up ? 4 : 50} stroke={color} strokeWidth={4} />
        <path d={up ? 'M6,12 L13,3 L20,12' : 'M6,42 L13,51 L20,42'} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{fontSize: 20, fontWeight: 700, color: C.ink3}}>{label}</span>
    </div>
  );
};

const Badge: React.FC<{children: React.ReactNode; color: string; delay: number}> = ({children, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div style={{flex: 1, textAlign: 'center', background: `${color}14`, border: `1.5px solid ${color}66`, borderRadius: 16, padding: '18px 8px', fontSize: 23, fontWeight: 800, color, opacity: s, transform: `scale(${0.85 + s * 0.15})`}}>
      {children}
    </div>
  );
};

export const Mechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const head = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{padding: land ? '70px 90px 120px' : '224px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: head}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            机制
          </div>
          <div style={{fontSize: land ? 54 : 62, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>
            τ-bench 到底测什么?
          </div>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4}}>
          <Node title="用户模拟器" sub="一个 LLM 扮客户 · 逐轮透露信息" color={C.cyan} delay={10} />
          <Arrow label="多轮对话" delay={26} color={C.ink4} />
          <Node title="被测 Agent" sub="理解需求 · 守 policy 边界 · 调工具" color={C.violet} delay={36} big />
          <Arrow label="工具 / API 调用" delay={54} color={C.ink4} />
          <Node title="后端数据库" sub="订单 / 预订 / 账户被真实修改" color={C.amber} delay={64} />
          <div style={{marginTop: 14}}>
            <Node title="判分 = 比对数据库末态" sub="不看话说得对不对 · 只看有没有办成" color={C.green} delay={80} />
          </div>
        </div>

        <div style={{display: 'flex', gap: 12}}>
          <Badge color={C.cyan} delay={96}>多轮对话</Badge>
          <Badge color={C.violet} delay={104}>工具调用</Badge>
          <Badge color={C.rose} delay={112}>守 policy</Badge>
          <Badge color={C.green} delay={120}>DB 末态判分</Badge>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
