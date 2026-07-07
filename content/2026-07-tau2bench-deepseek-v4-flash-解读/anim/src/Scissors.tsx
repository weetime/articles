import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
import {Scene, Head, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const CAP = [83.6, 90.4, 91.8, 92.3];
const REL = [83.6, 76.9, 71.7, 67.4];

export const Scissors: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [28, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const gapT = interpolate(frame, [118, 158], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  const W = 940, H = 640, padL = 96, padR = 96, padT = 30, padB = 84;
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
    <Scene>
      <Head eyebrow="为什么会这样?"
        title={<>「单次」上去了,「<span style={{color: C.rose}}>次次</span>」却掉了</>} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%'}}>
          {[60, 70, 80, 90, 100].map((g) => (
            <g key={g}>
              <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke={C.line2} strokeWidth={1} />
              <text x={padL - 16} y={y(g) + 7} fill={C.ink4} fontSize={22} textAnchor="end" fontFamily={MONO}>{g}</text>
            </g>
          ))}
          <polygon points={`${[0,1,2,3].map((i)=>`${x(i)},${y(CAP[i])}`).join(' ')} ${[3,2,1,0].map((i)=>`${x(i)},${y(REL[i])}`).join(' ')}`} fill={C.violet} opacity={0.14 * gapT} />
          <polyline points={partial(CAP)} fill="none" stroke={C.violet2} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${C.violet2}aa)`}} />
          <polyline points={partial(REL)} fill="none" stroke={C.rose} strokeWidth={7} strokeDasharray="3 13" strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${C.rose}88)`}} />
          {draw > 0.98 && <>
            <circle cx={x(3)} cy={y(CAP[3])} r={11} fill={C.violet2} style={{filter: `drop-shadow(0 0 8px ${C.violet2})`}} />
            <text x={x(3) - 20} y={y(CAP[3]) - 22} fill={C.violet2} fontSize={40} fontWeight={800} textAnchor="end" fontFamily={MONO}>92%</text>
            <circle cx={x(3)} cy={y(REL[3])} r={11} fill={C.rose} style={{filter: `drop-shadow(0 0 8px ${C.rose})`}} />
            <text x={x(3) - 20} y={y(REL[3]) + 52} fill={C.rose} fontSize={40} fontWeight={800} textAnchor="end" fontFamily={MONO}>67%</text>
          </>}
          {[0,1,2,3].map((i)=>(<text key={i} x={x(i)} y={H - padB + 42} fill={C.ink3} fontSize={25} textAnchor="middle" fontFamily={MONO}>跑{i+1}次</text>))}
        </svg>
        <div style={{display: 'flex', gap: 34, marginTop: 22, justifyContent: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, color: C.ink2, fontWeight: 600}}><span style={{width: 30, height: 7, borderRadius: 4, background: C.violet2}} /> 有一次成功(能力)</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, color: C.ink2, fontWeight: 600}}><span style={{width: 30, height: 7, borderRadius: 4, background: C.rose}} /> 次次都成功(可靠)</span>
        </div>
      </div>
      <div style={{fontSize: 26, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: gapT}}>
        阴影这道缝,就是「<b style={{color: C.violet2}}>有能力、但不稳定</b>」
      </div>
    </Scene>
  );
};
