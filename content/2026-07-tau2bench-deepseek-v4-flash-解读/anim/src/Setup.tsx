import React from 'react';
import {useCurrentFrame, interpolate, spring, useVideoConfig, Easing} from 'remotion';
import {Scene, Head, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Node: React.FC<{title: string; sub: string; color: string; delay: number}> = ({title, sub, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{flex: 1, textAlign: 'center', opacity: s, transform: `translateY(${(1 - s) * 20}px)`}}>
      <div style={{background: `${C.panel}dd`, border: `2px solid ${color}77`, borderRadius: 18, padding: '30px 12px', boxShadow: `0 0 26px ${color}22`}}>
        <div style={{fontSize: 34, fontWeight: 800, color}}>{title}</div>
        <div style={{fontSize: 20, color: C.ink3, fontWeight: 600, marginTop: 10}}>{sub}</div>
      </div>
    </div>
  );
};

export const Setup: React.FC = () => {
  const frame = useCurrentFrame();
  // 流动小点
  const dots = (from: number, delay: number) => {
    const p = interpolate((frame - delay) % 45, [0, 45], [0, 1]);
    return frame > delay ? p : -1;
  };
  const arrow = (delay: number, color: string) => {
    const p = dots(0, delay);
    return (
      <div style={{width: 90, position: 'relative', height: 8, alignSelf: 'flex-start', marginTop: 66}}>
        <div style={{position: 'absolute', top: 3, left: 0, right: 0, height: 2, background: `${color}44`}} />
        {p >= 0 && <div style={{position: 'absolute', top: -1, left: `${p * 88}%`, width: 10, height: 10, borderRadius: 5, background: color, boxShadow: `0 0 10px ${color}`}} />}
      </div>
    );
  };
  const tag = interpolate(frame, [96, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Scene>
      <Head eyebrow="怎么测?"
        title={<>让它当<span style={{color: C.cyan}}>客服 agent</span>,跑真实对话</>} />

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40}}>
        <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center'}}>
          <Node title="客户" sub="模拟真人提问" color={C.green} delay={20} />
          {arrow(38, C.green)}
          <Node title="Agent" sub="被测的模型" color={C.violet2} delay={30} />
          {arrow(48, C.violet2)}
          <Node title="工具 / 数据库" sub="查询·下单·改签" color={C.cyan} delay={40} />
        </div>
        <div style={{textAlign: 'center', fontSize: 30, color: C.ink2, fontWeight: 600, lineHeight: 1.6}}>
          模型要<b style={{color: C.ink}}>听懂需求</b>、<b style={{color: C.ink}}>正确调用工具</b>、把事<b style={{color: C.ink}}>办成</b>
        </div>
      </div>

      <div style={{textAlign: 'center', opacity: tag}}>
        <span style={{fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.ink, border: `1px solid ${C.cyan}55`, borderRadius: 14, padding: '15px 30px', background: `${C.cyan}10`, boxShadow: `0 0 20px ${C.cyan}22`}}>
          τ²-bench 官方任务 · 共 656 次多轮对话
        </span>
      </div>
    </Scene>
  );
};
