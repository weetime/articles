import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
import {InkScene, InkHead, RoughDefs} from './uiInk';
import {K, F_BODY, F_NUM} from './inkTheme';

const eo = Easing.out(Easing.cubic);
const CAP = [83.6, 90.4, 91.8, 92.3];
const REL = [83.6, 76.9, 71.7, 67.4];

export const InkScissors: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [30, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const gapT = interpolate(frame, [120, 158], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  const W = 940, H = 620, padL = 100, padR = 90, padT = 24, padB = 78;
  const x = (i: number) => padL + (i / 3) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - 55) / 45) * (H - padT - padB);
  const partial = (arr: number[]) => {
    const pts: string[] = [`${x(0)},${y(arr[0])}`];
    for (let i = 1; i < 4; i++) {
      const seg = interpolate(draw, [(i - 1) / 3, i / 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      if (seg <= 0) break;
      pts.push(`${x(i - 1) + (x(i) - x(i - 1)) * seg},${y(arr[i - 1] + (arr[i] - arr[i - 1]) * seg)}`);
    }
    return pts.join(' ');
  };

  return (
    <InkScene>
      <InkHead eyebrow="为什么会这样?" title={<>「单次」高,「<span style={{color: K.seal}}>次次</span>」难</>} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%'}}>
          <RoughDefs id="scg" scale={6} freq={0.028} seed={4} />
          <RoughDefs id="scc" scale={7} freq={0.02} seed={6} />
          <RoughDefs id="scr" scale={7} freq={0.02} seed={8} />
          {[60, 70, 80, 90, 100].map((g) => (
            <g key={g}>
              <path d={`M${padL} ${y(g)} L ${W - padR} ${y(g)}`} stroke={K.line} strokeWidth={2} fill="none" filter="url(#scg)" />
              <text x={padL - 18} y={y(g) + 8} fill={K.ink3} fontSize={24} textAnchor="end" fontFamily={F_NUM}>{g}</text>
            </g>
          ))}
          <polygon points={`${[0,1,2,3].map((i)=>`${x(i)},${y(CAP[i])}`).join(' ')} ${[3,2,1,0].map((i)=>`${x(i)},${y(REL[i])}`).join(' ')}`} fill={K.seal} opacity={0.1 * gapT} />
          <polyline points={partial(CAP)} fill="none" stroke={K.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" filter="url(#scc)" />
          <polyline points={partial(REL)} fill="none" stroke={K.seal} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" filter="url(#scr)" />
          {draw > 0.98 && <>
            <text x={x(3) - 14} y={y(CAP[3]) - 24} fill={K.ink} fontSize={44} fontWeight={700} textAnchor="end" fontFamily={F_NUM}>92%</text>
            <text x={x(3) - 14} y={y(REL[3]) + 54} fill={K.seal} fontSize={44} fontWeight={700} textAnchor="end" fontFamily={F_NUM}>67%</text>
          </>}
          {[0,1,2,3].map((i)=>(<text key={i} x={x(i)} y={H - padB + 44} fill={K.ink3} fontSize={26} textAnchor="middle" fontFamily={F_BODY}>跑{i+1}次</text>))}
        </svg>
        <div style={{display: 'flex', gap: 40, marginTop: 20, justifyContent: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F_BODY, fontSize: 25, color: K.ink2, fontWeight: 600}}><span style={{width: 32, height: 7, background: K.ink, borderRadius: 4}} /> 有一次成功(能力)</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F_BODY, fontSize: 25, color: K.ink2, fontWeight: 600}}><span style={{width: 32, height: 7, background: K.seal, borderRadius: 4}} /> 次次都成功(可靠)</span>
        </div>
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 28, color: K.ink2, fontWeight: 600, textAlign: 'center', opacity: gapT}}>
        中间这道缝,就是「<b style={{color: K.seal}}>有能力、但不稳定</b>」
      </div>
    </InkScene>
  );
};
