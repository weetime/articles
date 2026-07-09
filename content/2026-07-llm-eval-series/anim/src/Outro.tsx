import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const l1 = interpolate(frame, [8, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [30, 58], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l3 = interpolate(frame, [58, 88], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const line = interpolate(frame, [92, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 130, fps, config: {damping: 200}});
  const brand = interpolate(frame, [150, 176], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', padding: '300px 70px 510px'}}>
        <div style={{fontSize: 28, fontWeight: 700, color: C.violet, opacity: l1, marginBottom: 34}}>一句话记住</div>
        <div style={{fontSize: 62, fontWeight: 850, lineHeight: 1.3, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 20}px)`}}>
          选 AI 智能体
        </div>
        <div style={{fontSize: 62, fontWeight: 850, lineHeight: 1.3, textAlign: 'center', letterSpacing: -1, marginTop: 4, opacity: l2, transform: `translateY(${(1 - l2) * 20}px)`}}>
          别信一次<span style={{color: C.off}}>漂亮的演示</span>
        </div>
        <div style={{fontSize: 62, fontWeight: 850, lineHeight: 1.3, textAlign: 'center', letterSpacing: -1, marginTop: 4, opacity: l3, transform: `translateY(${(1 - l3) * 20}px)`}}>
          要看它 <span style={{color: C.violet}}>次次都对</span>
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 420]), height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#9d8bff,#2bc4e6)', margin: '54px 0'}} />

        <div style={{fontSize: 30, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: line}}>
          次次都对,才敢把真活儿交给它
        </div>

        <div style={{marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 24, border: `2px solid ${C.line2}`, boxShadow: '0 10px 30px #6d4bff1a'}}>
            <Img src={staticFile('qrcode.png')} style={{width: 220, height: 220, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, color: C.ink, opacity: brand}}>
            扫码关注 · <span style={{color: C.violet}}>vLLM 生产工程</span>
          </div>
        </div>

        <div style={{position: 'absolute', bottom: 540, fontSize: 20, color: C.ink3, fontWeight: 600, opacity: brand, textAlign: 'center'}}>
          <b style={{color: C.ink}}>ModelDoctor</b> · 面向私有化、多引擎推理的可观测与压测
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
