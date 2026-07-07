import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {InkScene, RoughDefs, Seal} from './uiInk';
import {K, F_TITLE, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);
const B = [
  {k: 'SWE-Verified', f: 80.6, p: 80.6},
  {k: 'Terminal-Bench', f: 68.5, p: 67.9},
  {k: 'BrowseComp', f: 85.9, p: 83.4},
];

export const InkVsPro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eb = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const q = interpolate(frame, [12, 36], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const ans = spring({frame: frame - 44, fps, config: {damping: 12, stiffness: 120}});
  const grow = interpolate(frame, [72, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [150, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const maxH = 250, base = 300;

  return (
    <InkScene>
      <div style={{fontFamily: F_BODY, fontSize: 30, fontWeight: 700, color: K.ink3, letterSpacing: 3, opacity: eb}}>等一下……</div>
      <div style={{fontFamily: F_TITLE, fontSize: 66, fontWeight: 800, marginTop: 12, opacity: q, color: K.ink, letterSpacing: 3}}>
        「Flash」是<span style={{color: K.seal}}>阉割版</span>吗?
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 12, opacity: ans}}>
        <div style={{fontFamily: F_TITLE, fontSize: 82, fontWeight: 800, color: K.green, transform: `scale(${0.85 + ans * 0.15})`, transformOrigin: 'left center', letterSpacing: 4}}>当然不是</div>
        <Seal text="非" delay={52} size={84} rot={-7} />
      </div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20}}>
        <div style={{textAlign: 'center', fontFamily: F_BODY, fontSize: 28, color: K.ink2, fontWeight: 600}}>官方基准上,和旗舰 <b style={{color: K.ink}}>Pro 几乎打平</b>:</div>
        <svg viewBox={`0 0 940 ${base + 90}`} style={{width: '100%'}}>
          <RoughDefs id="vpf" scale={5} freq={0.025} seed={4} />
          <RoughDefs id="vpp" scale={5} freq={0.025} seed={8} />
          {B.map((b, i) => {
            const gx = i * (940 / 3) + 940 / 6;
            const g = interpolate(grow, [i * 0.12, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
            const bw = 110;
            const hf = (b.f / 100) * maxH * g, hp = (b.p / 100) * maxH * g;
            return (
              <g key={b.k}>
                <rect x={gx - bw - 8} y={base - hf} width={bw} height={hf} fill={K.ink} filter="url(#vpf)" rx={3} opacity={0.92} />
                <rect x={gx + 8} y={base - hp} width={bw} height={hp} fill={K.indigo} filter="url(#vpp)" rx={3} opacity={0.88} />
                <text x={gx - bw / 2 - 8} y={base - hf - 14} fill={K.ink} fontSize={30} fontFamily={F_NUM} fontWeight={700} textAnchor="middle" opacity={g}>{b.f}</text>
                <text x={gx + bw / 2 + 8} y={base - hp - 14} fill={K.indigo} fontSize={30} fontFamily={F_NUM} fontWeight={700} textAnchor="middle" opacity={g}>{b.p}</text>
                <text x={gx} y={base + 40} fill={K.ink} fontSize={24} fontFamily={F_NUM} fontWeight={600} textAnchor="middle">{b.k}</text>
              </g>
            );
          })}
        </svg>
        <div style={{display: 'flex', gap: 40, justifyContent: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F_BODY, fontSize: 25, color: K.ink2, fontWeight: 700}}><span style={{width: 22, height: 22, background: K.ink, borderRadius: 3}} /> V4-Flash</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F_BODY, fontSize: 25, color: K.ink2, fontWeight: 700}}><span style={{width: 22, height: 22, background: K.indigo, borderRadius: 3}} /> V4-Pro(旗舰)</span>
        </div>
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 27, color: K.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        国产卡跑的,是<b style={{color: K.green}}>接近旗舰的强模型</b> · 官方数据
      </div>
    </InkScene>
  );
};
