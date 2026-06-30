import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

export const HookEN: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const s1 = spring({frame, fps, config: {damping: 200, stiffness: 150}});
  const s2 = spring({frame: frame - 16, fps, config: {damping: 160, stiffness: 160}});
  const s3 = interpolate(frame, [34, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sub = interpolate(frame, [52, 66], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = frame > 30 ? 1 + 0.035 * Math.sin((frame - 30) / 6) : 1;
  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 80px' : '220px 70px 510px'}}>
        <div style={{fontSize: 27, fontWeight: 800, color: C.violet, letterSpacing: 3, opacity: s1, marginBottom: 26}}>
          HIGRESS · PREFIX-CACHE ROUTING
        </div>
        <div style={{fontSize: land ? 80 : 88, fontWeight: 900, lineHeight: 1.1, textAlign: 'center', letterSpacing: -2, opacity: s1, transform: `translateY(${(1 - s1) * 30}px)`}}>
          Same GPUs.<br />Same model.
        </div>
        <div style={{marginTop: 30, fontSize: land ? 64 : 78, fontWeight: 900, textAlign: 'center', letterSpacing: -1, opacity: s2, transform: `scale(${pulse}) translateY(${(1 - s2) * 26}px)`, background: 'linear-gradient(100deg,#7d68ff,#2bc4e6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
          3× the cache hits
        </div>
        <div style={{marginTop: 34, fontSize: land ? 34 : 38, fontWeight: 800, color: C.ink, opacity: s3}}>
          One routing switch.
        </div>
        <div style={{marginTop: 44, fontSize: 30, color: C.ink2, fontWeight: 600, opacity: sub}}>
          ↓ here's the catch
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
