import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const OFF = [20.4, 23.1, 22.2, 22.4, 20.6];
const ON = [58.7, 66.5, 67.4, 66.7, 67.5];
const SCALE = 80;

type Geo = {top: number; h: number; barW: number; gap: number; groupGap: number; left: number};

const Bar: React.FC<{x: number; v: number; on: boolean; delay: number; g: Geo}> = ({x, v, on, delay, g}) => {
  const frame = useCurrentFrame();
  const gr = interpolate(frame, [delay, delay + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const h = (v / SCALE) * g.h * gr;
  return (
    <>
      <div style={{position: 'absolute', left: x, top: g.top + g.h - h, width: g.barW, height: h, borderRadius: 8, background: on ? C.fillViolet : C.fillOff}} />
      <div style={{position: 'absolute', left: x - 5, top: g.top + g.h - h - 34, width: g.barW + 10, textAlign: 'center', fontSize: 20, fontWeight: 800, color: on ? C.violet : C.ink3, opacity: gr}}>
        {v.toFixed(1)}
      </div>
    </>
  );
};

const MeanTag: React.FC<{cx: number; text: string; sub: string; color: string; delay: number; g: Geo}> = ({cx, text, sub, color, delay, g}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: cx - 110, top: g.top + g.h + 26, width: 220, textAlign: 'center', opacity: o}}>
      <div style={{fontSize: 22, color: C.ink3, fontWeight: 600}}>{sub}</div>
      <div style={{fontSize: 46, fontWeight: 850, color, letterSpacing: -1}}>{text}</div>
    </div>
  );
};

export const RunData: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});

  const barW = land ? 96 : 64;
  const gap = land ? 18 : 12;
  const groupGap = land ? 150 : 70;
  const g: Geo = {
    top: land ? 300 : 480,
    h: land ? 520 : 500,
    barW, gap, groupGap,
    left: (width - (10 * barW + 8 * gap + groupGap)) / 2,
  };
  const xOf = (group: number, i: number) => g.left + (group === 1 ? 5 * (barW + gap) + groupGap : 0) + i * (barW + gap);
  const offCx = xOf(0, 2) + barW / 2;
  const onCx = xOf(1, 2) + barW / 2;

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}>
        <div style={{position: 'absolute', left: land ? 80 : 60, top: land ? 70 : 220}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            原始数据 · 10 次跑测
          </div>
          <div style={{fontSize: land ? 48 : 56, fontWeight: 800, marginTop: 12, letterSpacing: -1}}>
            每一次 ON 都<span style={{color: C.violet}}>甩开 OFF</span>
          </div>
        </div>

        <div style={{position: 'absolute', left: g.left - 20, width: 10 * barW + 8 * gap + groupGap + 40, top: g.top + g.h, height: 2, background: C.line2}} />

        {OFF.map((v, i) => (<Bar key={`o${i}`} x={xOf(0, i)} v={v} on={false} delay={40 + i * 9} g={g} />))}
        {ON.map((v, i) => (<Bar key={`n${i}`} x={xOf(1, i)} v={v} on delay={95 + i * 9} g={g} />))}
        <MeanTag cx={offCx} text="22.0%" sub="OFF 均值" color={C.off} delay={120} g={g} />
        <MeanTag cx={onCx} text="65.4%" sub="ON 均值" color={C.violet} delay={170} g={g} />

        <div style={{position: 'absolute', left: 60, right: 60, top: g.top + g.h + (land ? 120 : 150), textAlign: 'center', fontSize: 24, color: C.ink3, fontWeight: 600}}>
          十次方差极小 · 不是走运,是<b style={{color: C.ink}}>可复现</b>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
