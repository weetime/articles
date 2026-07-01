import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type Sc = {tag: string; name: string; desc: string; color: string; rec?: boolean; mini: 'one' | 'split' | 'loop' | 'mesh'};
const SCS: Sc[] = [
  {tag: '单地域起步', name: '单集群', desc: '管控 + 算力同体 · 无跨集群', color: C.violet, mini: 'one'},
  {tag: '多集群标准', name: '管控算力分离', desc: '主集群纯路由 · 子集群跑模型', color: C.green, rec: true, mini: 'split'},
  {tag: '算力复用', name: '管控算力一体', desc: '主集群回环 · 复用自身 GPU', color: C.amber, mini: 'loop'},
  {tag: '跨地域全量', name: '去中心', desc: '每集群全量 · 就近自治', color: C.rose, mini: 'mesh'},
];

const Mini: React.FC<{kind: Sc['mini']; color: string}> = ({kind, color}) => {
  const dot = (cx: number, cy: number, r = 10, fill = color) => <circle cx={cx} cy={cy} r={r} fill={fill} />;
  const ring = (cx: number, cy: number, r = 13) => <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={3} />;
  return (
    <svg width={120} height={96} style={{flexShrink: 0}}>
      <g stroke={color} strokeWidth={3} opacity={0.5} fill="none">
        {kind === 'one' && <line x1={60} y1={20} x2={60} y2={74} />}
        {kind === 'split' && <><line x1={60} y1={26} x2={30} y2={74} /><line x1={60} y1={26} x2={90} y2={74} /></>}
        {kind === 'loop' && <><line x1={60} y1={26} x2={30} y2={74} /><line x1={60} y1={26} x2={90} y2={74} /><path d="M60,26 C92,18 96,46 78,52" /></>}
        {kind === 'mesh' && <><line x1={24} y1={70} x2={60} y2={70} /><line x1={60} y1={70} x2={96} y2={70} /><line x1={60} y1={22} x2={24} y2={70} /><line x1={60} y1={22} x2={96} y2={70} /></>}
      </g>
      {kind === 'one' && <>{ring(60, 20)}{dot(60, 74)}</>}
      {kind === 'split' && <>{ring(60, 26)}{dot(30, 74)}{dot(90, 74)}</>}
      {kind === 'loop' && <>{ring(60, 26)}{dot(30, 74)}{dot(90, 74)}</>}
      {kind === 'mesh' && <>{dot(60, 22)}{dot(24, 70)}{dot(96, 70)}</>}
    </svg>
  );
};

const Card: React.FC<{s: Sc; delay: number}> = ({s, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sp = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 110}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 24, background: C.panel, border: `2px solid ${s.color}66`, borderLeft: `8px solid ${s.color}`, borderRadius: 22, padding: '24px 30px', boxShadow: `0 0 26px ${s.color}1f, ${C.shadow}`, opacity: sp, transform: `translateX(${(1 - sp) * 50}px)`}}>
      <Mini kind={s.mini} color={s.color} />
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 18, fontWeight: 800, color: '#0c0c18', background: s.color, borderRadius: 7, padding: '4px 12px'}}>{s.tag}</span>
          <span style={{fontSize: 36, fontWeight: 850, letterSpacing: -0.5}}>{s.name}</span>
          {s.rec && <span style={{marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: '#0c0c18', background: C.green2, borderRadius: 999, padding: '4px 14px'}}>★ 推荐</span>}
        </div>
        <div style={{fontSize: 24, color: C.ink2, marginTop: 10, fontWeight: 600}}>{s.desc}</div>
      </div>
    </div>
  );
};

export const Scenarios: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '230px 56px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: intro}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            同一套能力 · 按场景选型
          </div>
          <div style={{fontSize: 58, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>落成 <span style={{color: C.cyan}}>4 种部署</span></div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 44}}>
          {SCS.map((s, i) => <Card key={s.name} s={s} delay={24 + i * 16} />)}
        </div>
        <div style={{marginTop: 'auto', fontSize: 24, fontWeight: 700, color: C.ink3, textAlign: 'center'}}>
          差异只在 <b style={{color: C.ink2}}>主集群是否 serving × 策略位置</b>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
