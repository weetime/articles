import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Pill: React.FC<{label: string; val: string; color: string; delay: number}> = ({label, val, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 140}});
  return (
    <div style={{flex: 1, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 18, padding: '22px 8px', textAlign: 'center', boxShadow: C.shadow, opacity: s, transform: `translateY(${(1 - s) * 22}px)`}}>
      <div style={{fontSize: 40, fontWeight: 850, color, letterSpacing: -1}}>{val}</div>
      <div style={{fontSize: 18, color: C.ink3, fontWeight: 600, marginTop: 6}}>{label}</div>
    </div>
  );
};

const Chip: React.FC<{children: React.ReactNode; delay: number}> = ({children, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 9, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '14px 20px', fontSize: 20, fontWeight: 600, color: C.ink2, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, boxShadow: C.shadow}}>
      <span style={{width: 7, height: 7, borderRadius: 2, background: C.violet}} />
      {children}
    </div>
  );
};

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const t1 = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [12, 30], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const on = interpolate(frame, [40, 92], [22, 65], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const arc = interpolate(frame, [40, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const badge = interpolate(frame, [92, 108], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = frame > 92 ? 1 + 0.018 * Math.sin((frame - 92) / 17) : 1;
  const glow = frame > 92 ? 0.5 + 0.5 * Math.sin((frame - 92) / 17) : 0;

  const titleBlock = (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet, opacity: t1}}>
        <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
        ModelDoctor · 路由策略实测
      </div>
      <div style={{fontSize: land ? 70 : 78, fontWeight: 850, lineHeight: 1.06, letterSpacing: -2, marginTop: 20, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
        只改一个路由开关
      </div>
      <div style={{fontSize: land ? 52 : 60, fontWeight: 850, letterSpacing: -1.5, marginTop: 8, opacity: t2, transform: `translateY(${(1 - t2) * 18}px)`, background: 'linear-gradient(100deg,#6d4bff,#0891b2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        命中率 ×3 · 吞吐 +64%
      </div>
    </div>
  );

  const statBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: land ? 100 : 118, fontWeight: 850, color: C.off, letterSpacing: -4}}>22%</div>
          <div style={{fontSize: 20, color: C.ink3, fontWeight: 600}}>缓存盲 · 轮询</div>
        </div>
        <svg width={130} height={110}>
          <defs>
            <marker id="ah" markerWidth="12" markerHeight="12" refX="8" refY="6" orient="auto"><path d="M0,0 L10,6 L0,12 Z" fill={C.violet} /></marker>
          </defs>
          <path d="M10,82 C52,82 80,36 122,36" stroke={C.violet} strokeWidth={6} fill="none" strokeDasharray={180} strokeDashoffset={180 - arc * 180} markerEnd={arc > 0.9 ? 'url(#ah)' : undefined} />
        </svg>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: land ? 130 : 160, fontWeight: 850, color: C.violet, letterSpacing: -5, transform: `scale(${pulse})`, textShadow: `0 0 ${glow * 40}px ${C.violet}55`}}>{Math.round(on)}%</div>
          <div style={{fontSize: 20, color: C.violet, fontWeight: 700}}>prefix_cache · KV 感知</div>
        </div>
      </div>
      <span style={{marginTop: 24, fontSize: 28, fontWeight: 800, color: C.green, background: `${C.green}1f`, border: `1px solid ${C.green}55`, borderRadius: 999, padding: '11px 28px', opacity: badge, transform: `scale(${0.8 + badge * 0.2})`}}>
        前缀缓存命中率 ▲ +197%
      </span>
    </div>
  );

  const pillsRow = (
    <div style={{display: 'flex', gap: 14}}>
      <Pill label="吞吐 req/s" val="+64%" color={C.green} delay={96} />
      <Pill label="TTFT P95" val="−40%" color={C.cyan} delay={106} />
      <Pill label="Output TPS" val="+67%" color={C.green} delay={116} />
      <Pill label="E2E P95" val="−37%" color={C.cyan} delay={126} />
    </div>
  );

  const chipsRow = (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: land ? 'flex-start' : 'center'}}>
      <Chip delay={132}>场景 <b style={{color: C.ink}}>RAG/Agent 长上下文</b></Chip>
      <Chip delay={142}><b style={{color: C.ink}}>4 Pods</b> · Qwen3-32B</Chip>
      <Chip delay={152}>OFF/ON 各 <b style={{color: C.ink}}>5 次 × 480 请求</b></Chip>
    </div>
  );

  if (land) {
    return (
      <Bg>
        <AbsoluteFill style={{padding: '90px 90px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 50}}>
            {titleBlock}
            {chipsRow}
          </div>
          <div style={{flex: 1.1, display: 'flex', flexDirection: 'column', gap: 56}}>
            {statBlock}
            {pillsRow}
          </div>
        </AbsoluteFill>
      </Bg>
    );
  }

  return (
    <Bg>
      <AbsoluteFill style={{padding: '220px 60px 510px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        {titleBlock}
        {statBlock}
        {pillsRow}
        {chipsRow}
      </AbsoluteFill>
    </Bg>
  );
};
