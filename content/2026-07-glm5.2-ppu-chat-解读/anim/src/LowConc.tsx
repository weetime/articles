import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

type K = 'best' | 'drop' | 'flat';
const Card: React.FC<{mrr: string; val: number; delay: number; kind: K; tag?: string}> = ({mrr, val, delay, kind, tag}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = Math.round(interpolate(frame, [delay, delay + 26], [0, val], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const col = kind === 'best' ? C.green : kind === 'drop' ? C.rose : C.ink2;
  return (
    <div style={{flex: 1, background: C.panel, border: `1px solid ${kind === 'best' ? C.green + '66' : kind === 'drop' ? C.rose + '55' : C.line2}`, borderTop: `3px solid ${col}`, borderRadius: 20, padding: '30px 12px', textAlign: 'center', boxShadow: `0 0 32px ${col}1c, ${C.shadow}`, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div style={{fontSize: 23, fontWeight: 700, color: C.ink3}}>{mrr}</div>
      <div style={{fontSize: 66, fontWeight: 900, letterSpacing: -2, marginTop: 8, color: col, filter: `drop-shadow(0 0 16px ${col}44)`}}>{v}</div>
      <div style={{fontSize: 17, color: C.ink4, fontWeight: 600, marginTop: 6}}>峰值 tok/s</div>
      <div style={{fontSize: 19, color: col, fontWeight: 800, marginTop: 8}}>{tag ?? (kind === 'drop' ? '▼' : '·')}</div>
    </div>
  );
};

export const LowConc: React.FC = () => {
  const frame = useCurrentFrame();
  const chip = interpolate(frame, [92, 112], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Frame>
      <Eyebrow n="04">并发扫描</Eyebrow>
      <Title size={48}>抬高并发上限,<span style={{color: C.rose}}>一档都没突破 369</span></Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 30}}>
        <div style={{display: 'flex', gap: 16, alignItems: 'stretch'}}>
          <Card mrr="mrr 32" val={369} delay={22} kind="best" tag="基线·峰值" />
          <Card mrr="mrr 48" val={313} delay={38} kind="drop" />
          <Card mrr="mrr 64" val={307} delay={54} kind="drop" />
          <Card mrr="mrr 96" val={366} delay={70} kind="flat" tag="追平" />
        </div>
        <div style={{background: C.panel, border: `1px solid ${C.line2}`, borderLeft: `5px solid ${C.green}`, borderRadius: 16, padding: '24px 28px', boxShadow: `0 0 30px ${C.green}16, ${C.shadow}`, opacity: chip, transform: `translateY(${(1 - chip) * 14}px)`}}>
          <span style={{fontSize: 27, fontWeight: 700, color: C.ink2, lineHeight: 1.5}}>
            GLM 激活 39B,并发 32 已使 8 卡算力饱和;48 / 64 / 96 全部收敛到 <b style={{color: C.ink}}>307–369</b>。<b style={{color: C.green}}>369 即本配置算力上限。</b>
          </span>
        </div>
      </div>
    </Frame>
  );
};
