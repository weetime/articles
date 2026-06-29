import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Node: React.FC<{children: React.ReactNode; color: string; bg: string; delay: number}> = ({children, color, bg, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{background: bg, border: `2px solid ${color}66`, borderRadius: 16, padding: '16px 22px', fontSize: 22, fontWeight: 800, color, opacity: s, transform: `scale(${0.85 + s * 0.15})`}}>
      {children}
    </div>
  );
};

export const ZeroLossEN: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  const fill = interpolate(frame, [30, 96], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const total = interpolate(frame, [30, 96], [0, 21510], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const sliver = interpolate(frame, [96, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flow = -((frame * 2) % 48);

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px' : '220px 60px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          Why zero overhead
        </div>
        <div style={{fontSize: land ? 50 : 54, fontWeight: 850, marginTop: 12, letterSpacing: -1}}>
          21.5 s total — <span style={{color: C.cyan}}>conversion is milliseconds</span>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 50}}>
          <div>
            <div style={{display: 'flex', alignItems: 'baseline', marginBottom: 16}}>
              <div style={{fontSize: 24, fontWeight: 700, color: C.ink2}}>Total latency (200 tokens out)</div>
              <div style={{marginLeft: 'auto', fontSize: 60, fontWeight: 850, letterSpacing: -2, color: C.ink}}>
                {(total / 1000).toFixed(2)}<span style={{fontSize: 30}}> s</span>
              </div>
            </div>
            <div style={{position: 'relative', height: 64, background: C.track, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.line}`}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 99.6}%`, background: C.fillCyan, overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: 22}}>
                <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0) 0 16px, rgba(255,255,255,0.10) 16px 32px)', backgroundPositionX: `${flow}px`}} />
                <span style={{position: 'relative', fontSize: 24, fontWeight: 800, color: '#fff'}}>Backend inference ~99%</span>
              </div>
              <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: '0.4%', background: C.violet, opacity: sliver}} />
            </div>
            <div style={{display: 'flex', marginTop: 12, fontSize: 19, color: C.ink3, fontWeight: 600}}>
              <span>≈ 9.3 tok/s · inference-bound</span>
              <span style={{marginLeft: 'auto', color: C.violet, opacity: sliver}}>← gateway conversion · a few ms (wasm)</span>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap'}}>
            <Node color={C.cyan} bg={`${C.cyan}1a`} delay={120}>Inference ~99%</Node>
            <div style={{fontSize: 30, fontWeight: 900, color: C.violet}}>+</div>
            <Node color={C.violet} bg={`${C.violet}1a`} delay={134}>Convert ms-level</Node>
            <div style={{fontSize: 30, fontWeight: 900, color: C.violet}}>→</div>
            <Node color={C.green} bg={`${C.green}1a`} delay={150}>Below the noise floor</Node>
          </div>
        </div>

        <div style={{fontSize: 23, color: C.ink3, fontWeight: 600, textAlign: 'center', lineHeight: 1.5}}>
          A <b style={{color: C.ink2}}>millisecond</b> cost can't surface in a <b style={{color: C.ink2}}>20-second</b> total — it's below measurement noise
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
