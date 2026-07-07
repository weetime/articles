import React from 'react';
import {useCurrentFrame, interpolate, random, Easing} from 'remotion';
import {Scene, Head, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const COLS = 30, ROWS = 4;

function buildCol(i: number): number[] {
  const p = i / (COLS - 1);
  let passes: number;
  if (p < 0.67) passes = 4;
  else if (p > 0.92) passes = 0;
  else passes = 1 + Math.floor(random(`c${i}`) * 3);
  const cells = [0, 0, 0, 0];
  const idx = [0, 1, 2, 3].sort((a, b) => random(`s${i}${a}`) - random(`s${i}${b}`));
  for (let k = 0; k < passes; k++) cells[idx[k]] = 1;
  return cells;
}
const MATRIX = Array.from({length: COLS}, (_, i) => buildCol(i));

export const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [26, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const note = interpolate(frame, [120, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cell = 30, gap = 6;
  const gw = COLS * (cell + gap) - gap, gh = ROWS * (cell + gap) - gap;

  return (
    <Scene>
      <Head eyebrow="放大看:每个任务跑 4 次"
        title={<>稳过 · 稳挂 · 中间<span style={{color: C.rose}}>时对时错</span></>} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 40}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <svg viewBox={`0 0 ${gw} ${gh}`} style={{width: '100%', maxWidth: 960, filter: 'drop-shadow(0 0 16px #00000066)'}}>
            {MATRIX.map((col, ci) => col.map((v, ri) => {
              const lit = interpolate(reveal, [(ci / COLS) * 0.85, (ci / COLS) * 0.85 + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const color = v ? C.green : C.rose;
              return <rect key={`${ci}-${ri}`} x={ci * (cell + gap)} y={ri * (cell + gap)} width={cell} height={cell} rx={6} fill={color} opacity={lit} style={{filter: lit > 0.5 ? `drop-shadow(0 0 4px ${color}88)` : 'none'}} />;
            }))}
          </svg>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 23, color: C.ink3, fontWeight: 600, padding: '0 20px'}}>
          <span>← 每次都过</span><span>时对时错</span><span>每次都挂 →</span>
        </div>
        <div style={{display: 'flex', gap: 40, justifyContent: 'center', opacity: note}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 27, color: C.ink2, fontWeight: 700}}><span style={{width: 24, height: 24, borderRadius: 6, background: C.green, boxShadow: `0 0 12px ${C.green}88`}} /> 成功</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 27, color: C.ink2, fontWeight: 700}}><span style={{width: 24, height: 24, borderRadius: 6, background: C.rose, boxShadow: `0 0 12px ${C.rose}88`}} /> 失败</span>
        </div>
      </div>
      <div style={{fontSize: 26, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        中间这条<b style={{color: C.rose}}>红绿相间的带</b>,就是不稳定的那批任务
      </div>
    </Scene>
  );
};
