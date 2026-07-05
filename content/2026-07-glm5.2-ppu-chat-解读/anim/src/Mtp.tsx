import React from 'react';
import {useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Bar: React.FC<{label: string; sub: string; val: number; max: number; color: string; fill: string; delay: number}> = ({label, sub, val, max, color, fill, delay}) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [delay, delay + 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const h = (val / max) * 500 * g;
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
      <div style={{fontSize: 72, fontWeight: 900, color, marginBottom: 12, filter: `drop-shadow(0 0 20px ${color}55)`}}>{Math.round(val * g)}</div>
      <div style={{width: '64%', height: h, borderRadius: '14px 14px 0 0', background: fill, boxShadow: `0 0 40px ${color}44, inset 0 2px 0 #ffffff22`}} />
      <div style={{fontSize: 32, fontWeight: 850, color: C.ink, marginTop: 18}}>{label}</div>
      <div style={{fontSize: 22, color: C.ink4, marginTop: 4}}>{sub}</div>
    </div>
  );
};

export const Mtp: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const badge = spring({frame: f - 74, fps, config: {damping: 200, stiffness: 120}});
  const note = interpolate(f, [110, 132], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow n="05">投机解码</Eyebrow>
      <Title size={50}>开 MTP 投机,单流反而<span style={{color: C.rose}}>慢一倍</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
        <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 100, height: 620, padding: '0 60px'}}>
          <Bar label="关投机" sub="baseline" val={26} max={26} color={C.green} fill={C.fillGreen} delay={30} />
          <Bar label="开 EAGLE" sub="steps 5" val={13} max={26} color={C.rose} fill={C.fillRose} delay={58} />
          {/* 大号 delta 徽标 */}
          <div style={{position: 'absolute', top: 40, left: '50%', transform: `translateX(-50%) scale(${0.6 + badge * 0.4})`, opacity: badge,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: `linear-gradient(180deg,${C.rose}2a,${C.rose}12)`, border: `1.5px solid ${C.rose}66`, borderRadius: 20, padding: '14px 26px', boxShadow: `0 0 40px ${C.rose}44`}}>
            <div style={{fontSize: 54, fontWeight: 900, color: C.rose, lineHeight: 1, filter: `drop-shadow(0 0 16px ${C.rose}66)`}}>▼ 2×</div>
            <div style={{fontSize: 20, fontWeight: 700, color: C.ink2}}>更慢</div>
          </div>
        </div>
        <div style={{fontSize: 23, color: C.ink4, fontWeight: 600, textAlign: 'center'}}>单流 tok/s(越高越好)</div>
        <div style={{background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `5px solid ${C.rose}`, borderRadius: 16, padding: '24px 28px', boxShadow: `0 0 30px ${C.rose}16, ${C.shadow}`, opacity: note}}>
          <span style={{fontSize: 28, fontWeight: 700, color: C.ink2, lineHeight: 1.5}}>
            草稿每步投 6 个,仅接受 <b style={{color: C.rose}}>1.9 个</b>(接受率 17%)—— <b style={{color: C.ink}}>W4A8 劣化了 MTP 草稿头</b>,开销大于收益。
          </span>
        </div>
      </div>
    </Frame>
  );
};
