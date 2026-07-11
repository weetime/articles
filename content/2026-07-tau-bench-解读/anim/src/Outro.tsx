import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const GATE = [
  {t: 'pass⁴ ≥ 70%', d: '可自主上线', color: C.green},
  {t: '30 – 70%', d: '仅辅助 · 人在环,状态变更需人核', color: C.amber},
  {t: '< 30%', d: '不建议', color: C.rose},
  {t: '< 5%', d: '完全不能用', color: C.off},
];

const Row: React.FC<{g: typeof GATE[0]; idx: number}> = ({g, idx}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - (86 + idx * 9), fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, background: C.panel, border: `1.5px solid ${g.color}55`, borderRadius: 16, padding: '16px 24px', boxShadow: C.shadow, opacity: s, transform: `translateY(${(1 - s) * 16}px)`}}>
      <div style={{fontSize: 30, fontWeight: 850, color: g.color, width: 210, letterSpacing: -1}}>{g.t}</div>
      <div style={{width: 1, height: 34, background: C.line2}} />
      <div style={{fontSize: 24, fontWeight: 700, color: C.ink2}}>{g.d}</div>
    </div>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const l1 = interpolate(frame, [8, 32], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [26, 52], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const line = interpolate(frame, [50, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const foot = interpolate(frame, [130, 152], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 90px' : '224px 70px 500px'}}>
        <div style={{fontSize: 26, fontWeight: 700, color: C.violet, opacity: l1, marginBottom: 22}}>怎么用这套数</div>
        <div style={{fontSize: land ? 52 : 58, fontWeight: 850, lineHeight: 1.24, textAlign: 'center', letterSpacing: -1.5, opacity: l1, transform: `translateY(${(1 - l1) * 22}px)`}}>
          看能不能上生产
        </div>
        <div style={{fontSize: land ? 52 : 58, fontWeight: 850, lineHeight: 1.24, textAlign: 'center', letterSpacing: -1.5, marginTop: 4, opacity: l2, transform: `translateY(${(1 - l2) * 22}px)`}}>
          看 <span style={{color: C.rose}}>pass⁴</span>,不看 <span style={{color: C.green}}>pass¹</span>
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 360]), height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#6d4bff,#0891b2)', margin: '38px 0 34px'}} />

        <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 720}}>
          {GATE.map((g, i) => <Row key={i} g={g} idx={i} />)}
        </div>

        <div style={{position: 'absolute', bottom: land ? 64 : 452, fontSize: 22, color: C.ink3, fontWeight: 600, opacity: foot, textAlign: 'center'}}>
          阈值随业务风险校准 · <b style={{color: C.ink2}}>先收藏备用,按需查阅</b>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
