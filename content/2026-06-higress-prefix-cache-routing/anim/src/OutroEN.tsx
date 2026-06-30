import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

export const OutroEN: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const l1 = interpolate(frame, [8, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [28, 54], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const line = interpolate(frame, [50, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 80, fps, config: {damping: 200}});
  const brand = interpolate(frame, [96, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 80px' : '0 80px 320px'}}>
        <div style={{fontSize: 26, fontWeight: 700, color: C.violet, opacity: l1, marginBottom: 30}}>
          TAKEAWAY
        </div>
        <div style={{fontSize: 54, fontWeight: 850, lineHeight: 1.25, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 24}px)`}}>
          Change where each request goes
        </div>
        <div style={{fontSize: 52, fontWeight: 850, lineHeight: 1.25, textAlign: 'center', letterSpacing: -1, marginTop: 8, opacity: l2, transform: `translateY(${(1 - l2) * 24}px)`}}>
          <span style={{color: C.off}}>cache-blind</span> → <span style={{color: C.violet}}>KV-aware</span>
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 420]), height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#6d4bff,#0891b2)', margin: '46px 0'}} />

        <div style={{fontSize: 30, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: line}}>
          On the right workload, it's almost a <b style={{color: C.green}}>free lunch</b>
        </div>

        <div style={{marginTop: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 24, border: `2px solid ${C.line2}`, boxShadow: '0 10px 30px #6d4bff1a'}}>
            <Img src={staticFile('qrcode.png')} style={{width: 220, height: 220, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, color: C.ink, opacity: brand}}>
            Full write-up · <span style={{color: C.violet}}>link in description</span>
          </div>
        </div>

        <div style={{position: 'absolute', bottom: land ? 70 : 540, fontSize: 20, color: C.ink3, fontWeight: 600, opacity: brand}}>
          <b style={{color: C.ink}}>ModelDoctor</b> · observability &amp; load-testing for self-hosted, multi-engine inference
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
