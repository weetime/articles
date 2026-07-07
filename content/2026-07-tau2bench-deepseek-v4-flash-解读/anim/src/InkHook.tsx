import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {BgInk} from './BgInk';
import {RoughDefs} from './uiInk';
import {K, F_TITLE, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);

export const InkHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const eb = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t1 = interpolate(frame, [18, 44], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [40, 66], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const q = spring({frame: frame - 66, fps, config: {damping: 10, stiffness: 150}});
  const sealS = spring({frame: frame - 92, fps, config: {damping: 9, stiffness: 190, mass: 0.7}});
  const sub = interpolate(frame, [104, 124], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <BgInk>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: land ? '0 90px' : '0 80px 300px'}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, opacity: eb, marginBottom: 30}}>
          <span style={{width: 24, height: 24, background: K.seal, borderRadius: 4, transform: 'rotate(-5deg)'}} />
          <span style={{fontFamily: F_BODY, fontSize: 30, fontWeight: 700, color: K.seal, letterSpacing: 4}}>国产卡 · 实测一下</span>
        </div>

        <div style={{fontFamily: F_BODY, fontSize: 46, fontWeight: 600, color: K.ink2, textAlign: 'center', opacity: t1, transform: `translateY(${(1 - t1) * 14}px)`}}>
          国产 PPU 上部署的
        </div>
        <div style={{fontFamily: F_NUM, fontSize: 74, fontWeight: 700, color: K.ink, textAlign: 'center', marginTop: 8, letterSpacing: 1, opacity: t1}}>
          DeepSeek-V4-Flash
        </div>

        <div style={{position: 'relative', marginTop: 46, opacity: t2, transform: `translateY(${(1 - t2) * 16}px)`}}>
          <div style={{fontFamily: F_TITLE, fontSize: 92, fontWeight: 800, color: K.ink, textAlign: 'center', letterSpacing: 3}}>
            能胜任日常工作吗
            <span style={{display: 'inline-block', color: K.seal, fontSize: 110, transform: `scale(${0.5 + q * 0.5}) rotate(${(1 - q) * -20}deg)`, marginLeft: 6}}>?</span>
          </div>
          {/* 手绘毛笔圈重点 */}
          <svg viewBox="0 0 760 150" style={{position: 'absolute', left: '50%', top: '46%', width: 780, height: 150, transform: 'translate(-50%,-50%)'}} preserveAspectRatio="none">
            <RoughDefs id="hkc" scale={7} freq={0.02} />
            <path d="M60 80 C 30 30, 300 12, 560 26 C 720 38, 700 120, 460 132 C 220 142, 40 130, 90 70"
              fill="none" stroke={K.seal} strokeWidth={5} strokeLinecap="round" filter="url(#hkc)"
              strokeDasharray={1500} strokeDashoffset={1500 * (1 - Math.max(0, Math.min(1, (frame - 72) / 34)))} opacity={0.85} />
          </svg>
        </div>

        <div style={{marginTop: 66, fontFamily: F_BODY, fontSize: 32, fontWeight: 700, color: K.ink2, opacity: sub,
          display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{width: 58, height: 58, background: K.seal, borderRadius: 6, display: 'grid', placeItems: 'center',
            transform: `rotate(-4deg) scale(${0.7 + sealS * 0.3})`, opacity: sealS, boxShadow: `inset 0 0 0 2px ${K.paper}cc`, overflow: 'hidden'}}>
            <span style={{fontFamily: F_TITLE, fontSize: 30, color: K.paper, fontWeight: 800, lineHeight: 1}}>验</span>
          </span>
          用 τ²-bench 跑 656 次多轮对话
        </div>
      </div>
    </BgInk>
  );
};
