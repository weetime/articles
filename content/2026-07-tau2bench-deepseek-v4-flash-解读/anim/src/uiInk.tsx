import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {BgInk} from './BgInk';
import {K, F_TITLE, F_BODY} from './inkTheme';

const eo = Easing.out(Easing.cubic);

// 手绘抖动滤镜:把边缘用湍流位移,做出毛笔/手绘的不规整感。每个 svg 内放一次。
export const RoughDefs: React.FC<{id: string; scale?: number; freq?: number; seed?: number}> = ({id, scale = 6, freq = 0.016, seed = 5}) => (
  <defs>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

export const InkScene: React.FC<{children: React.ReactNode; pad?: string; land?: boolean}> = ({children, pad, land}) => (
  <BgInk>
    <AbsoluteFill style={{padding: land ? '70px 110px' : (pad || '196px 84px 600px'), display: 'flex', flexDirection: 'column'}}>
      {children}
    </AbsoluteFill>
  </BgInk>
);

// 行楷标题 + 手绘毛笔下划线(墨迹从左扫出)
export const InkHead: React.FC<{eyebrow: string; title: React.ReactNode; delay?: number}> = ({eyebrow, title, delay = 0}) => {
  const frame = useCurrentFrame();
  const eb = interpolate(frame, [delay + 2, delay + 18], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const ti = interpolate(frame, [delay + 10, delay + 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const uw = interpolate(frame, [delay + 30, delay + 58], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <div>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, opacity: eb}}>
        <span style={{width: 26, height: 26, background: K.seal, borderRadius: 4, display: 'inline-block', transform: 'rotate(-4deg)'}} />
        <span style={{fontFamily: F_BODY, fontSize: 30, fontWeight: 700, color: K.seal, letterSpacing: 3}}>{eyebrow}</span>
      </div>
      <div style={{fontFamily: F_TITLE, fontSize: 78, fontWeight: 800, color: K.ink, marginTop: 18, lineHeight: 1.15,
        opacity: ti, transform: `translateY(${(1 - ti) * 14}px)`, letterSpacing: 2}}>{title}</div>
      <svg viewBox="0 0 600 26" style={{width: 440, height: 20, marginTop: 8, display: 'block'}} preserveAspectRatio="none">
        <RoughDefs id="hu" scale={9} freq={0.03} />
        <path d={`M6 15 C 150 6, 320 22, ${6 + 588 * uw} 12`} fill="none" stroke={K.ink} strokeWidth={9}
          strokeLinecap="round" filter="url(#hu)" opacity={uw > 0.02 ? 0.9 : 0} strokeDasharray={600} strokeDashoffset={600 * (1 - uw)} />
      </svg>
    </div>
  );
};

// 朱砂印章:落款盖印(缩放冲击 + 微旋),文字阴刻
export const Seal: React.FC<{text: string; delay: number; size?: number; rot?: number}> = ({text, delay, size = 96, rot = -5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 190, mass: 0.7}});
  const chars = text.split('');
  return (
    <div style={{width: size, height: size, background: K.seal, borderRadius: 10, transform: `rotate(${rot}deg) scale(${0.6 + s * 0.4})`,
      opacity: interpolate(s, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}), display: 'grid',
      gridTemplateColumns: chars.length > 2 ? '1fr 1fr' : '1fr', placeItems: 'center', gap: 2, padding: 8,
      boxShadow: `inset 0 0 0 3px ${K.paper}cc`, filter: `contrast(1.1)`}}>
      {chars.map((c, i) => (
        <span key={i} style={{fontFamily: F_TITLE, fontSize: size * (chars.length > 2 ? 0.36 : 0.5), fontWeight: 800, color: K.paper, lineHeight: 1}}>{c}</span>
      ))}
    </div>
  );
};

// 手绘毛笔矩形(柱状图用):墨填充 + 边缘抖动
export const brushRect = (x: number, y: number, w: number, h: number, color: string, fid: string, opacity = 1) => (
  <rect x={x} y={y} width={w} height={h} fill={color} rx={3} filter={`url(#${fid})`} opacity={opacity} />
);

export {eo};
