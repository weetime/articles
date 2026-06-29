import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

export const Outro: React.FC = () => {
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
          结论
        </div>
        <div style={{fontSize: 56, fontWeight: 850, lineHeight: 1.25, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 24}px)`}}>
          同一网关，承载两种协议
        </div>
        <div style={{fontSize: 56, fontWeight: 850, lineHeight: 1.25, textAlign: 'center', letterSpacing: -1, marginTop: 6, opacity: l2, transform: `translateY(${(1 - l2) * 24}px)`}}>
          转换 <span style={{color: C.green}}>零损耗</span> · 接入 <span style={{color: C.violet}}>零改造</span>
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 420]), height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#7d68ff,#2bc4e6)', margin: '46px 0'}} />

        <div style={{fontSize: 30, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: line, lineHeight: 1.5}}>
          保留现有 <b style={{color: C.ink}}>OpenAI / Anthropic SDK</b><br />仅替换 base_url 即可对接
        </div>

        {/* QR + brand */}
        <div style={{marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 24, border: `2px solid ${C.line2}`, boxShadow: '0 10px 30px #6d4bff1a'}}>
            <Img src={staticFile('qrcode.png')} style={{width: 240, height: 240, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, color: C.ink, opacity: brand}}>
            扫码关注 · <span style={{color: C.violet}}>vLLM 生产工程</span>
          </div>
        </div>

        <div style={{position: 'absolute', bottom: land ? 70 : 540, fontSize: 20, color: C.ink3, fontWeight: 600, opacity: brand}}>
          <b style={{color: C.ink}}>ModelDoctor</b> · 面向私有化、多引擎推理的可观测与压测工具箱
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
