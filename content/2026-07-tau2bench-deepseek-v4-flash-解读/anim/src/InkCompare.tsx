import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
import {InkScene, InkHead, RoughDefs} from './uiInk';
import {K, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);
const DOMS = [
  {name: '机票客服 airline', ours: 81.5, v32: 63.8},
  {name: '电商客服 retail', ours: 85.7, v32: 81.1},
];

export const InkCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [40, 104], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [120, 148], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const CW = 940, CH = 620, baseY = 540, top = 40, maxV = 100;
  const yOf = (v: number) => baseY - (v / maxV) * (baseY - top);
  const groupW = CW / 2;

  const bar = (cx: number, v: number, color: string, delay: number, fid: string, label: string) => {
    const g = interpolate(grow, [delay, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
    const bw = 150, h = (baseY - yOf(v)) * g, y = baseY - h;
    return (
      <g key={label + cx}>
        <rect x={cx - bw / 2} y={y} width={bw} height={h} fill={color} filter={`url(#${fid})`} opacity={0.92} rx={4} />
        <text x={cx} y={y - 22} fill={color} fontSize={46} fontFamily={F_NUM} fontWeight={700} textAnchor="middle" opacity={g}>{v}</text>
        <text x={cx} y={baseY + 42} fill={K.ink2} fontSize={26} fontFamily={F_BODY} fontWeight={600} textAnchor="middle">{label}</text>
      </g>
    );
  };

  return (
    <InkScene>
      <InkHead eyebrow="放进参照系" title={<>比上一代<span style={{color: K.seal}}>更高一截</span></>} />
      <div style={{flex: 1, display: 'flex', alignItems: 'center'}}>
        <svg viewBox={`0 0 ${CW} ${CH}`} style={{width: '100%'}}>
          <RoughDefs id="rb1" scale={5} freq={0.02} seed={4} />
          <RoughDefs id="rb2" scale={5} freq={0.02} seed={9} />
          <RoughDefs id="rax" scale={6} freq={0.03} seed={2} />
          {/* 手绘基线 */}
          <path d={`M20 ${baseY} L ${CW - 20} ${baseY}`} stroke={K.ink} strokeWidth={4} fill="none" strokeLinecap="round" filter="url(#rax)" />
          {DOMS.map((d, i) => {
            const gx = i * groupW + groupW / 2;
            return (
              <g key={d.name}>
                <text x={gx} y={top - 6} fill={K.ink} fontSize={30} fontFamily={F_BODY} fontWeight={700} textAnchor="middle">{d.name}</text>
                {bar(gx - 95, d.ours, K.ink, 0, 'rb1', '本评测')}
                {bar(gx + 95, d.v32, K.indigo, 0.12, 'rb2', 'V3.2')}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{display: 'flex', gap: 36, justifyContent: 'center', marginBottom: 6}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F_BODY, fontSize: 26, color: K.ink2, fontWeight: 600}}><span style={{width: 22, height: 22, background: K.ink, borderRadius: 3}} />本评测 V4-Flash</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F_BODY, fontSize: 26, color: K.ink2, fontWeight: 600}}><span style={{width: 22, height: 22, background: K.indigo, borderRadius: 3}} />上一代 DeepSeek-V3.2</span>
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 28, color: K.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        两个场景都<span style={{color: K.seal, fontWeight: 700}}>稳稳高于上一代</span>
      </div>
    </InkScene>
  );
};
