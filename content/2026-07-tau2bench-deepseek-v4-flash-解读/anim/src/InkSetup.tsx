import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {InkScene, InkHead, RoughDefs} from './uiInk';
import {K, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);

const Node: React.FC<{title: string; sub: string; delay: number; seed: number}> = ({title, sub, delay, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{flex: 1, textAlign: 'center', opacity: s, transform: `translateY(${(1 - s) * 16}px)`, position: 'relative'}}>
      <svg viewBox="0 0 260 150" style={{width: '100%', height: 150}} preserveAspectRatio="none">
        <RoughDefs id={`nd${seed}`} scale={5} freq={0.03} seed={seed} />
        <rect x="8" y="8" width="244" height="134" rx="14" fill="none" stroke={K.ink} strokeWidth="4" filter={`url(#nd${seed})`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: F_BODY, fontSize: 38, fontWeight: 800, color: K.ink}}>{title}</div>
        <div style={{fontFamily: F_BODY, fontSize: 22, color: K.ink3, fontWeight: 600, marginTop: 8}}>{sub}</div>
      </div>
    </div>
  );
};

const Arrow: React.FC<{delay: number; seed: number}> = ({delay, seed}) => {
  const frame = useCurrentFrame();
  const d = interpolate(frame, [delay, delay + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <svg viewBox="0 0 90 40" style={{width: 90, height: 40, alignSelf: 'flex-start', marginTop: 55, flexShrink: 0}}>
      <RoughDefs id={`ar${seed}`} scale={4} freq={0.05} seed={seed} />
      <path d={`M6 20 L ${6 + 66 * d} 20`} stroke={K.seal} strokeWidth="4" fill="none" strokeLinecap="round" filter={`url(#ar${seed})`} />
      {d > 0.9 && <path d="M62 10 L78 20 L62 30" stroke={K.seal} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" filter={`url(#ar${seed})`} />}
    </svg>
  );
};

export const InkSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const tag = interpolate(frame, [96, 122], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <InkScene>
      <InkHead eyebrow="怎么测?" title={<>让它当<span style={{color: K.seal}}>客服 agent</span></>} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 44}}>
        <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center'}}>
          <Node title="客户" sub="模拟真人提问" delay={22} seed={3} />
          <Arrow delay={40} seed={11} />
          <Node title="Agent" sub="被测的模型" delay={32} seed={5} />
          <Arrow delay={50} seed={13} />
          <Node title="工具·数据库" sub="查询·下单·改签" delay={42} seed={7} />
        </div>
        <div style={{textAlign: 'center', fontFamily: F_BODY, fontSize: 32, color: K.ink2, fontWeight: 600, lineHeight: 1.6}}>
          要<b style={{color: K.ink}}>听懂需求</b>、<b style={{color: K.ink}}>调对工具</b>、把事<b style={{color: K.ink}}>办成</b>
        </div>
      </div>
      <div style={{textAlign: 'center', opacity: tag, fontFamily: F_NUM, fontSize: 30, color: K.ink, fontWeight: 700}}>
        τ²-bench 官方任务 · 共 <span style={{color: K.seal}}>656</span> 次多轮对话
      </div>
    </InkScene>
  );
};
