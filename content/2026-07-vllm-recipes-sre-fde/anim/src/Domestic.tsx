import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const CARDS = ['昇腾 910B / 910C', '海光 DCU', '寒武纪', '天数', '昆仑', 'T-Head PPU'];

export const Domestic: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const gp = spring({frame: frame - 78, fps, config: {damping: 200, stiffness: 120}});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '250px 60px 500px', display: 'flex', flexDirection: 'column', opacity: intro}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 800, color: C.rose}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.rose, boxShadow: `0 0 16px ${C.rose}88`}} />
          第五关 · 国产卡落地
        </div>
        <div style={{fontSize: 62, fontWeight: 850, letterSpacing: -1.5, marginTop: 16}}>
          信创机房,<span style={{color: C.rose}}>只有国产卡</span>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 50}}>
          {CARDS.map((c, i) => {
            const d = 20 + i * 10;
            const o = interpolate(frame, [d, d + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
            return (
              <div key={c} style={{width: 'calc(50% - 8px)', textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.ink, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 16, padding: '24px 10px', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>{c}</div>
            );
          })}
        </div>
        <div style={{marginTop: 44, background: `${C.green}12`, border: `2px solid ${C.green}55`, borderRadius: 22, padding: '32px 32px', boxShadow: C.shadow, opacity: gp, transform: `translateY(${(1 - gp) * 18}px)`}}>
          <div style={{fontSize: 34, fontWeight: 850, color: C.green}}>联动 GPUStack</div>
          <div style={{fontSize: 27, fontWeight: 600, color: C.ink2, marginTop: 12, lineHeight: 1.5}}>
            配方全覆盖 + 国产卡适配后的引擎镜像<br />—— 省掉自己编译 CANN / DTK 的环境地狱
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
