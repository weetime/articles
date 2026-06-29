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
    <div style={{background: bg, border: `2px solid ${color}66`, borderRadius: 16, padding: '16px 22px', fontSize: 24, fontWeight: 800, color, opacity: s, transform: `scale(${0.85 + s * 0.15})`}}>
      {children}
    </div>
  );
};

export const ZeroLoss: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  const fill = interpolate(frame, [30, 96], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const total = interpolate(frame, [30, 96], [0, 21510], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const sliver = interpolate(frame, [96, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flow = -((frame * 2) % 48); // 持续流动条纹

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px' : '220px 60px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          零损耗的成因
        </div>
        <div style={{fontSize: land ? 50 : 58, fontWeight: 850, marginTop: 12, letterSpacing: -1}}>
          21.5 秒总时延，<span style={{color: C.cyan}}>转换仅毫秒量级</span>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 50}}>
          {/* total time bar */}
          <div>
            <div style={{display: 'flex', alignItems: 'baseline', marginBottom: 16}}>
              <div style={{fontSize: 26, fontWeight: 700, color: C.ink2}}>单次总时延（输出 200 tokens）</div>
              <div style={{marginLeft: 'auto', fontSize: 60, fontWeight: 850, letterSpacing: -2, color: C.ink}}>
                {(total / 1000).toFixed(2)}<span style={{fontSize: 30}}> s</span>
              </div>
            </div>
            <div style={{position: 'relative', height: 64, background: C.track, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.line}`}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 99.6}%`, background: C.fillCyan, overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: 22}}>
                <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0) 0 16px, rgba(255,255,255,0.10) 16px 32px)', backgroundPositionX: `${flow}px`}} />
                <span style={{position: 'relative', fontSize: 24, fontWeight: 800, color: '#fff'}}>后端推理 ~99%</span>
              </div>
              <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: '0.4%', background: C.violet, opacity: sliver}} />
            </div>
            <div style={{display: 'flex', marginTop: 12, fontSize: 19, color: C.ink3, fontWeight: 600}}>
              <span>≈ 9.3 tok/s · 推理本身决定</span>
              <span style={{marginLeft: 'auto', color: C.violet, opacity: sliver}}>← 网关协议转换 · 仅几 ms（wasm 层）</span>
            </div>
          </div>

          {/* causal chain */}
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap'}}>
            <Node color={C.cyan} bg={`${C.cyan}1a`} delay={120}>后端推理 ~99%</Node>
            <div style={{fontSize: 30, fontWeight: 900, color: C.violet}}>+</div>
            <Node color={C.violet} bg={`${C.violet}1a`} delay={134}>转换 ms 级</Node>
            <div style={{fontSize: 30, fontWeight: 900, color: C.violet}}>→</div>
            <Node color={C.green} bg={`${C.green}1a`} delay={150}>差异低于测量噪声</Node>
          </div>
        </div>

        <div style={{fontSize: 23, color: C.ink3, fontWeight: 600, textAlign: 'center', lineHeight: 1.5}}>
          <b style={{color: C.ink2}}>毫秒级</b>开销无法在 <b style={{color: C.ink2}}>20 秒级</b>总时延中显现 —— 差异低于测量噪声
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
