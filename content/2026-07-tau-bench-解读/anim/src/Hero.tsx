import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Chip: React.FC<{children: React.ReactNode; delay: number}> = ({children, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '14px 20px', fontSize: 21, fontWeight: 600, color: C.ink2, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, boxShadow: C.shadow}}>
      <span style={{width: 8, height: 8, borderRadius: 2, background: C.violet}} />
      {children}
    </div>
  );
};

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [14, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const p1 = 86;
  const p4 = interpolate(frame, [50, 104], [86, 67], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const arc = interpolate(frame, [50, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const badge = interpolate(frame, [104, 122], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const titleBlock = (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet, opacity: t1}}>
        <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
        τ-bench · 对话式 Agent 评测
      </div>
      <div style={{fontSize: land ? 92 : 104, fontWeight: 850, lineHeight: 1.04, letterSpacing: -3, marginTop: 22, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
        会说话 <span style={{color: C.off}}>≠</span> 会办事
      </div>
      <div style={{fontSize: land ? 44 : 50, fontWeight: 800, letterSpacing: -1, marginTop: 14, opacity: t2, transform: `translateY(${(1 - t2) * 18}px)`, background: 'linear-gradient(100deg,#6d4bff,#0891b2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        把 Agent 能不能「办成事」量出来
      </div>
    </div>
  );

  const statBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: land ? 108 : 128, fontWeight: 850, color: C.green, letterSpacing: -4}}>{Math.round(p1)}%</div>
          <div style={{fontSize: 21, color: C.ink3, fontWeight: 600, marginTop: 4}}>单次成功 · pass¹</div>
        </div>
        <svg width={130} height={110}>
          <defs>
            <marker id="ah" markerWidth="12" markerHeight="12" refX="8" refY="6" orient="auto"><path d="M0,0 L10,6 L0,12 Z" fill={C.rose} /></marker>
          </defs>
          <path d="M8,36 C50,36 80,82 122,82" stroke={C.rose} strokeWidth={6} fill="none" strokeDasharray={180} strokeDashoffset={180 - arc * 180} markerEnd={arc > 0.9 ? 'url(#ah)' : undefined} />
        </svg>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: land ? 128 : 152, fontWeight: 850, color: C.rose, letterSpacing: -5}}>{Math.round(p4)}%</div>
          <div style={{fontSize: 21, color: C.rose, fontWeight: 700, marginTop: 4}}>四次全对 · pass⁴</div>
        </div>
      </div>
      <span style={{marginTop: 22, fontSize: 27, fontWeight: 800, color: C.amber, background: `${C.amber}1f`, border: `1px solid ${C.amber}55`, borderRadius: 999, padding: '11px 26px', opacity: badge, transform: `scale(${0.82 + badge * 0.18})`}}>
        约 1/3 任务,四次做不到次次对
      </span>
    </div>
  );

  const chipsRow = (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: land ? 'flex-start' : 'center'}}>
      <Chip delay={128}>用户模拟器逐轮给信息</Chip>
      <Chip delay={138}>调工具改<b style={{color: C.ink}}>后端数据库</b></Chip>
      <Chip delay={148}>按<b style={{color: C.ink}}>数据库末态</b>判分</Chip>
    </div>
  );

  if (land) {
    return (
      <Bg>
        <AbsoluteFill style={{padding: '90px 90px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 46}}>{titleBlock}{chipsRow}</div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>{statBlock}</div>
        </AbsoluteFill>
      </Bg>
    );
  }

  return (
    <Bg>
      <AbsoluteFill style={{padding: '224px 60px 500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        {titleBlock}
        {statBlock}
        {chipsRow}
      </AbsoluteFill>
    </Bg>
  );
};
