import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const PODS = [
  {hit: 67, off: 28, on: 27},
  {hit: 63, off: 26, on: 29},
  {hit: 68, off: 24, on: 23},
  {hit: 59, off: 22, on: 21},
];

const PodCard: React.FC<{idx: number; hit: number; off: number; on: number; fillH: number}> = ({idx, hit, off, on, fillH}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = 40 + idx * 12;
  const g = interpolate(frame, [start, start + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const share = off + (on - off) * g;
  const h = (hit / 100) * fillH * g;
  const appear = spring({frame: frame - start, fps, config: {damping: 200}});
  return (
    <div style={{flex: 1, opacity: appear, transform: `translateY(${(1 - appear) * 22}px)`}}>
      <div style={{fontSize: 30, fontWeight: 850, marginBottom: 2}}>P{idx + 1}</div>
      <div style={{fontSize: 16, color: C.ink3, fontWeight: 600, marginBottom: 12}}>ON 命中率</div>
      <div style={{position: 'relative', height: fillH, background: C.track, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: C.fillGreen, borderRadius: 14}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: h + 8, textAlign: 'center', fontSize: 30, fontWeight: 850, color: C.green, opacity: g}}>
          {Math.round(hit * g)}%
        </div>
      </div>
      <div style={{marginTop: 14, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center'}}>
        <div style={{fontSize: 15, color: C.ink3, fontWeight: 600}}>流量份额</div>
        <div style={{fontSize: 23, fontWeight: 800, color: C.ink}}>
          {off}% <span style={{color: C.ink4}}>→</span> <span style={{color: C.violet}}>{Math.round(share)}%</span>
        </div>
      </div>
    </div>
  );
};

export const NoHotspot: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  const banner = interpolate(frame, [150, 172], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fillH = land ? 300 : 290;

  const callouts = (
    <div style={{display: 'flex', gap: 18, opacity: banner}}>
      <div style={{flex: 1, background: `${C.green}14`, border: `1px solid ${C.green}55`, borderRadius: 18, padding: '22px 26px'}}>
        <div style={{fontSize: 24, fontWeight: 800, color: C.green}}>✓ 命中率均匀抬高</div>
        <div style={{fontSize: 20, color: C.ink2, marginTop: 8, fontWeight: 600}}>4 个 Pod 全部落在 58–70%,无一被冷落</div>
      </div>
      <div style={{flex: 1, background: `${C.violet}14`, border: `1px solid ${C.violet}55`, borderRadius: 18, padding: '22px 26px'}}>
        <div style={{fontSize: 24, fontWeight: 800, color: C.violet}}>✓ 流量没有热点</div>
        <div style={{fontSize: 20, color: C.ink2, marginTop: 8, fontWeight: 600}}>最大份额 27–29%,开关前后几乎不变</div>
      </div>
    </div>
  );

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 80px 130px' : '210px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          逐 Pod · 命中率 vs 流量
        </div>
        <div style={{fontSize: land ? 48 : 54, fontWeight: 800, marginTop: 12, letterSpacing: -1}}>
          提升靠<span style={{color: C.violet}}>路由智能</span>,不是流量倾斜
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: land ? 36 : 50}}>
          <div style={{display: 'flex', gap: 18}}>
            {PODS.map((p, i) => (<PodCard key={i} idx={i} {...p} fillH={fillH} />))}
          </div>
          {callouts}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
