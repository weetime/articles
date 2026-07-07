import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {MONO} from './ui';

const eo = Easing.out(Easing.cubic);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const chip = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t1 = interpolate(frame, [18, 44], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [34, 60], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const q = spring({frame: frame - 58, fps, config: {damping: 12, stiffness: 120}});
  const qGlow = 0.5 + 0.5 * Math.sin(Math.max(0, frame - 60) / 12);
  const sub = interpolate(frame, [78, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: land ? '0 90px' : '0 70px 300px'}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.cyan,
          border: `1px solid ${C.cyan}55`, borderRadius: 999, padding: '11px 26px', opacity: chip, letterSpacing: 1, boxShadow: `0 0 22px ${C.cyan}22`}}>
          <span style={{width: 9, height: 9, borderRadius: 5, background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`}} />
          国产卡 · 实测一下
        </div>

        <div style={{fontSize: 58, fontWeight: 800, marginTop: 44, textAlign: 'center', lineHeight: 1.3, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
          <span style={{color: C.ink2}}>国产 PPU 上部署的</span><br />
          <span style={{background: `linear-gradient(100deg,${C.violet2},${C.cyan})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: 850, fontSize: 76}}>DeepSeek-V4-Flash</span>
        </div>

        <div style={{fontSize: 62, fontWeight: 850, marginTop: 40, textAlign: 'center', lineHeight: 1.25, opacity: t2, transform: `translateY(${(1 - t2) * 18}px)`}}>
          能胜任日常工作吗<span style={{display: 'inline-block', color: C.amber, fontSize: 90, transform: `scale(${0.6 + q * 0.4})`, textShadow: `0 0 ${qGlow * 40}px ${C.amber}`, marginLeft: 8}}>?</span>
        </div>

        <div style={{marginTop: 50, fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.ink, opacity: sub, letterSpacing: 1,
          border: `1px solid ${C.violet}44`, borderRadius: 14, padding: '16px 34px', background: `${C.violet}12`}}>
          咱们用 τ²-bench 测一测 →
        </div>
      </div>
    </Bg>
  );
};
