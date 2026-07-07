import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {BgInk} from './BgInk';
import {RoughDefs, Seal} from './uiInk';
import {K, F_TITLE, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);

export const InkOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const l1 = interpolate(frame, [8, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [24, 50], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const uw = interpolate(frame, [50, 82], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const pts = interpolate(frame, [70, 98], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 100, fps, config: {damping: 200}});
  const brand = interpolate(frame, [116, 138], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <BgInk>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: land ? '0 90px' : '0 80px 280px'}}>
        <div style={{fontFamily: F_BODY, fontSize: 30, fontWeight: 700, color: K.seal, opacity: l1, marginBottom: 26, letterSpacing: 4, display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 22, height: 22, background: K.seal, borderRadius: 4, transform: 'rotate(-5deg)'}} />一句话总结
        </div>
        <div style={{fontFamily: F_TITLE, fontSize: 68, fontWeight: 800, textAlign: 'center', color: K.ink, opacity: l1, transform: `translateY(${(1 - l1) * 16}px)`, letterSpacing: 3}}>
          国产 PPU 已能承载
        </div>
        <div style={{fontFamily: F_TITLE, fontSize: 68, fontWeight: 800, textAlign: 'center', color: K.seal, marginTop: 4, opacity: l2, transform: `translateY(${(1 - l2) * 16}px)`, letterSpacing: 3}}>
          强大的 agent 模型
        </div>
        <svg viewBox="0 0 600 26" style={{width: 460, height: 22, marginTop: 6}} preserveAspectRatio="none">
          <RoughDefs id="ou" scale={9} freq={0.03} />
          <path d={`M8 14 C 160 6, 340 22, ${8 + 584 * uw} 12`} fill="none" stroke={K.ink} strokeWidth={8} strokeLinecap="round" filter="url(#ou)" opacity={uw > 0.02 ? 0.85 : 0} strokeDasharray={600} strokeDashoffset={600 * (1 - uw)} />
        </svg>

        <div style={{display: 'flex', gap: 22, opacity: pts, marginTop: 34, flexWrap: 'wrap', justifyContent: 'center'}}>
          <span style={{fontFamily: F_BODY, fontSize: 26, fontWeight: 700, color: K.green, border: `2px solid ${K.green}`, borderRadius: 40, padding: '10px 24px'}}>能力达标 · 工具/数据库 83–88%</span>
          <span style={{fontFamily: F_BODY, fontSize: 26, fontWeight: 700, color: K.seal, border: `2px solid ${K.seal}`, borderRadius: 40, padding: '10px 24px'}}>稳定性待打磨 · 次次全过 67%</span>
        </div>

        <div style={{marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 14, boxShadow: `0 4px 22px ${K.ink2}33`, border: `3px solid ${K.ink}`}}>
            <Img src={staticFile('qrcode.png')} style={{width: 220, height: 220, borderRadius: 8}} />
          </div>
          <div style={{marginTop: 20, fontFamily: F_BODY, fontSize: 28, fontWeight: 700, color: K.ink, opacity: brand}}>
            扫码关注 · <span style={{color: K.seal}}>vLLM 生产工程</span>
          </div>
          <div style={{marginTop: 8, fontFamily: F_BODY, fontSize: 23, fontWeight: 600, color: K.ink3, opacity: brand}}>
            下载完整报告 &amp; 复现步骤
          </div>
        </div>
      </div>
    </BgInk>
  );
};
