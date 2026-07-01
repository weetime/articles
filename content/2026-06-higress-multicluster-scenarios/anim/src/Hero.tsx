import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {Board, rv} from './layer';

const eo = Easing.out(Easing.cubic);
const PLANS = [
  {n: '单集群', c: C.violet},
  {n: '管控算力分离', c: C.green, rec: true},
  {n: '管控算力一体', c: C.amber},
  {n: '去中心', c: C.rose},
];

const Chip: React.FC<{n: string; c: string; rec?: boolean; delay: number}> = ({n, c, rec, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.panel, border: `2px solid ${c}66`, borderRadius: 15, padding: '15px 20px', fontSize: 26, fontWeight: 800, color: c, opacity: s, transform: `translateY(${(1 - s) * 16}px)`, boxShadow: C.shadow}}>
      <span style={{width: 9, height: 9, borderRadius: 3, background: c, boxShadow: `0 0 12px ${c}`}} />
      {n}
      {rec && <span style={{fontSize: 16, fontWeight: 800, color: '#0c0c18', background: C.green2, borderRadius: 999, padding: '2px 10px'}}>★</span>}
    </div>
  );
};

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [14, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});

  const Axis: React.FC<{no: string; q: React.ReactNode; a: React.ReactNode; c: string; delay: number}> = ({no, q, a, c, delay}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 16, padding: '18px 22px', boxShadow: C.shadow, opacity: rv(frame, delay), transform: `translateX(${(1 - rv(frame, delay)) * 30}px)`}}>
      <span style={{fontSize: 30, fontWeight: 850, color: c, flexShrink: 0}}>{no}</span>
      <div>
        <div style={{fontSize: 25, fontWeight: 800, color: C.ink}}>{q}</div>
        <div style={{fontSize: 19, color: C.ink3, fontWeight: 600, marginTop: 4}}>{a}</div>
      </div>
    </div>
  );

  const content = (
    <AbsoluteFill style={{padding: '236px 60px 510px', display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 700, color: C.violet, opacity: t1}}>
        <span style={{width: 12, height: 12, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
        Higress · 多集群推理网关
      </div>
      <div style={{fontSize: 74, fontWeight: 850, lineHeight: 1.08, letterSpacing: -2, marginTop: 20, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
        多集群部署<br /><span style={{background: 'linear-gradient(100deg,#9d8bff,#2bc4e6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>如何技术选型</span>
      </div>
      <div style={{fontSize: 27, color: C.ink2, marginTop: 18, fontWeight: 500, opacity: t2}}>
        同一套网关能力,按场景落成 <b style={{color: C.ink}}>4 种部署</b> · 决策只看两根轴
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40}}>
        <Axis no="轴①" c={C.cyan} delay={40} q="主集群要不要自己跑模型?" a="纯路由 · 还是 路由 + serving(回环)" />
        <Axis no="轴②" c={C.green} delay={54} q="ai-route 策略放哪?" a="主集群入口集中 · 还是 下沉到每个子集群" />
      </div>

      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'auto'}}>
        {PLANS.map((p, i) => <Chip key={p.n} n={p.n} c={p.c} rec={p.rec} delay={78 + i * 9} />)}
      </div>
      <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginTop: 22, opacity: rv(frame, 120)}}>
        下面从最简单的场景开始,逐一取舍 ↓
      </div>
    </AbsoluteFill>
  );

  return <Bg><Board land={land} boardH={1920}>{content}</Board></Bg>;
};
