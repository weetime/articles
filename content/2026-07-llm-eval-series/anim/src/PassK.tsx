import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const StatCard: React.FC<{lab: string; sub: string; target: number; color: string; delay: number; big: boolean}> = ({lab, sub, target, color, delay, big}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 120}});
  const val = Math.round(interpolate(frame, [delay + 6, delay + 46], [0, target], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo}));
  return (
    <div style={{flex: 1, background: C.panel, border: `2.5px solid ${color}${big ? '' : '66'}`, borderRadius: 28, padding: '34px 20px', textAlign: 'center', boxShadow: big ? `0 0 34px ${color}33` : C.shadow, opacity: s, transform: `translateY(${(1 - s) * 24}px)`}}>
      <div style={{fontSize: 24, color: C.ink3, fontWeight: 700}}>{lab}</div>
      <div style={{fontSize: 130, fontWeight: 900, letterSpacing: -5, color, lineHeight: 1, marginTop: 10}}>{val}<span style={{fontSize: 64}}>%</span></div>
      <div style={{fontSize: 24, color: C.ink2, fontWeight: 600, marginTop: 10}}>{sub}</div>
    </div>
  );
};

export const PassK: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = interpolate(frame, [4, 24], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const arrow = interpolate(frame, [120, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const punch = interpolate(frame, [230, 256], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{padding: '240px 70px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{fontSize: 30, fontWeight: 700, color: C.violet, opacity: t1, textAlign: 'center'}}>别只看「平均能行」</div>
        <div style={{fontSize: 64, fontWeight: 850, letterSpacing: -1.5, lineHeight: 1.12, marginTop: 14, textAlign: 'center', opacity: t1}}>
          国产卡实测 · 某模型
        </div>

        <div style={{marginTop: 70, display: 'flex', alignItems: 'stretch', gap: 24}}>
          <StatCard lab="单次成功率" sub="Pass¹ · 一次做对" target={85} color={C.green} delay={40} big={false} />
          <StatCard lab="次次都对" sub="Pass⁴ · 连做 4 次全对" target={67} color={C.rose} delay={120} big />
        </div>

        <div style={{marginTop: 40, textAlign: 'center', fontSize: 30, fontWeight: 700, color: C.ink2, opacity: arrow}}>
          连做 <span style={{color: C.ink, fontWeight: 850}}>4</span> 次 → 一路掉到 <span style={{color: C.rose, fontWeight: 850}}>67%</span>
        </div>

        <div style={{marginTop: 'auto', textAlign: 'center', opacity: punch, transform: `scale(${0.9 + punch * 0.1})`}}>
          <div style={{fontSize: 56, fontWeight: 900, letterSpacing: -1.5}}>
            「平均能行」<span style={{color: C.ink3}}>≠</span> <span style={{color: C.violet}}>敢交给它</span>
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
