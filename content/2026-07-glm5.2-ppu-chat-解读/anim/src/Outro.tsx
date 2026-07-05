import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Pill: React.FC<{children: React.ReactNode; color: string; delay: number}> = ({children, color, delay}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 9, background: C.panel, border: `1px solid ${color}55`, borderRadius: 999, padding: '10px 18px', fontSize: 24, fontWeight: 750, color: C.ink, opacity: o, boxShadow: `0 0 18px ${color}22`}}>
      <span style={{width: 9, height: 9, borderRadius: 3, background: color, boxShadow: `0 0 10px ${color}`}} />{children}
    </div>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const l1 = interpolate(frame, [8, 32], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [26, 50], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 96, fps, config: {damping: 200}});
  const cta = interpolate(frame, [104, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const teaser = spring({frame: frame - 150, fps, config: {damping: 200, stiffness: 120}});
  const tglow = 0.6 + Math.sin(frame / 20) * 0.4;

  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 80px' : '0 72px 300px'}}>
        <div style={{fontSize: 25, fontWeight: 800, letterSpacing: 2, color: C.violet2, opacity: l1, marginBottom: 24,
          background: `linear-gradient(90deg,${C.violet}26,${C.cyan}18)`, border: `1px solid ${C.violet}55`, borderRadius: 999, padding: '9px 22px', boxShadow: `0 0 26px ${C.violet}33`}}>完整测试报告</div>
        <div style={{fontSize: 52, fontWeight: 850, lineHeight: 1.28, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 22}px)`}}>
          配方 · diff · 全量数据<br /><span style={{color: C.violet2}}>都在公众号原文</span>
        </div>

        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 30, maxWidth: 780, opacity: l2}}>
          <Pill color={C.green} delay={40}>最优 = 基线</Pill>
          <Pill color={C.cyan} delay={48}>峰值 ~369 tok/s</Pill>
          <Pill color={C.amber} delay={56}>已达算力上限</Pill>
        </div>

        <div style={{marginTop: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.9 + qr * 0.1})`}}>
          <div style={{padding: 15, background: '#fff', borderRadius: 22, border: `2px solid ${C.line2}`, boxShadow: '0 10px 34px #6f9bd822'}}>
            <Img src={staticFile('qrcode.png')} style={{width: 232, height: 232, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 20, fontSize: 27, fontWeight: 700, color: C.ink, opacity: cta}}>
            扫码关注 · <span style={{color: C.violet2}}>vLLM 生产工程</span>
          </div>
        </div>

        {/* 下期预告 */}
        <div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 16, opacity: teaser, transform: `translateY(${(1 - teaser) * 16}px)`,
          background: `linear-gradient(90deg,${C.amber}22,${C.violet}18)`, border: `1px solid ${C.amber}55`, borderRadius: 16, padding: '18px 28px', boxShadow: `0 0 ${26 + tglow * 26}px ${C.amber}33`}}>
          <span style={{fontSize: 26, color: C.amber}}>▶</span>
          <span style={{fontSize: 28, fontWeight: 800, color: C.ink}}>下期预告 · <span style={{color: C.amber}}>PD 分离部署</span></span>
          <span style={{fontSize: 24, fontWeight: 600, color: C.ink3}}>敬请关注</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
