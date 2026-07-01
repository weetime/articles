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
  const l2 = interpolate(frame, [26, 52], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const line = interpolate(frame, [50, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 84, fps, config: {damping: 200}});
  const brand = interpolate(frame, [100, 124], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const tags = ['全声明式', '零 EnvoyFilter', '已实测双集群'];

  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 80px' : '0 80px 360px'}}>
        <div style={{fontSize: 26, fontWeight: 700, color: C.violet, opacity: l1, marginBottom: 28}}>多集群推理网关 · 一句话</div>
        <div style={{fontSize: 58, fontWeight: 850, lineHeight: 1.22, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 24}px)`}}>
          一套上游池
        </div>
        <div style={{fontSize: 58, fontWeight: 850, lineHeight: 1.22, textAlign: 'center', letterSpacing: -1, marginTop: 6, opacity: l2, transform: `translateY(${(1 - l2) * 24}px)`}}>
          <span style={{color: C.cyan}}>换一个 DestinationRule</span> 即切策略
        </div>

        <div style={{display: 'flex', gap: 14, marginTop: 40, opacity: line}}>
          {tags.map((t) => (
            <span key={t} style={{fontSize: 24, fontWeight: 800, color: C.green, background: `${C.green}1f`, border: `1px solid ${C.green}55`, borderRadius: 999, padding: '10px 22px'}}>{t}</span>
          ))}
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 440]), height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#9d8bff,#2bc4e6)', margin: '44px 0'}} />

        <div style={{marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 24, border: `2px solid ${C.line2}`, boxShadow: '0 10px 30px #6d4bff1a'}}>
            <Img src={staticFile('qrcode.png')} style={{width: 240, height: 240, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, color: C.ink, opacity: brand}}>
            扫码关注 · <span style={{color: C.violet}}>vLLM 生产工程</span>
          </div>
        </div>

        <div style={{position: 'absolute', bottom: land ? 70 : 560, fontSize: 20, color: C.ink3, fontWeight: 600, opacity: brand, textAlign: 'center'}}>
          完整方案 · 配置 · 实测,见公众号文章
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
