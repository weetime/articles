import React from 'react';
import {useCurrentFrame, interpolate, random, Easing} from 'remotion';
import {InkScene, InkHead, RoughDefs} from './uiInk';
import {K, F_BODY} from './inkTheme';

const eo = Easing.out(Easing.cubic);
const COLS = 22, ROWS = 4;

function buildCol(i: number): number[] {
  const p = i / (COLS - 1);
  let passes: number;
  if (p < 0.64) passes = 4;
  else if (p > 0.9) passes = 0;
  else passes = 1 + Math.floor(random(`ig${i}`) * 3);
  const cells = [0, 0, 0, 0];
  const idx = [0, 1, 2, 3].sort((a, b) => random(`is${i}${a}`) - random(`is${i}${b}`));
  for (let k = 0; k < passes; k++) cells[idx[k]] = 1;
  return cells;
}
const MATRIX = Array.from({length: COLS}, (_, i) => buildCol(i));

export const InkGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [28, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const note = interpolate(frame, [120, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cell = 40, r = 14;
  const gw = COLS * cell, gh = ROWS * cell;

  const dots = (want: number) => MATRIX.flatMap((col, ci) => col.map((v, ri) => {
    if (v !== want) return null;
    const lit = interpolate(reveal, [(ci / COLS) * 0.85, (ci / COLS) * 0.85 + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <circle key={`${ci}-${ri}`} cx={ci * cell + cell / 2} cy={ri * cell + cell / 2} r={r * (0.6 + lit * 0.4)} fill={want ? K.green : K.seal} opacity={lit * 0.9} />;
  })).filter(Boolean);

  return (
    <InkScene>
      <InkHead eyebrow="放大看:每个任务跑 4 次" title={<>两头稳,中间<span style={{color: K.seal}}>时对时错</span></>} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 42}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <svg viewBox={`0 0 ${gw} ${gh}`} style={{width: '100%', maxWidth: 940}}>
            <RoughDefs id="grG" scale={5} freq={0.05} seed={3} />
            <RoughDefs id="grR" scale={5} freq={0.05} seed={9} />
            <g filter="url(#grG)">{dots(1)}</g>
            <g filter="url(#grR)">{dots(0)}</g>
          </svg>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F_BODY, fontSize: 25, color: K.ink3, fontWeight: 600, padding: '0 10px'}}>
          <span>← 每次都过</span><span>时对时错</span><span>每次都挂 →</span>
        </div>
        <div style={{display: 'flex', gap: 44, justifyContent: 'center', opacity: note}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F_BODY, fontSize: 28, color: K.ink2, fontWeight: 700}}><span style={{width: 26, height: 26, borderRadius: 13, background: K.green}} /> 成功</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F_BODY, fontSize: 28, color: K.ink2, fontWeight: 700}}><span style={{width: 26, height: 26, borderRadius: 13, background: K.seal}} /> 失败</span>
        </div>
      </div>
      <div style={{fontFamily: F_BODY, fontSize: 28, color: K.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        中间这条<b style={{color: K.seal}}>红绿相间的带</b>,就是不稳定的那批任务
      </div>
    </InkScene>
  );
};
