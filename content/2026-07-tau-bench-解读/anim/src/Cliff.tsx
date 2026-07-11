import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const DOMS = [
  {d: 'retail', v: 62.7, color: C.green},
  {d: 'telecom', v: 57.5, color: C.cyan},
  {d: 'airline', v: 48.5, color: C.amber},
  {d: 'banking', v: 4.7, color: C.rose},
];

const CAUSES = [
  '幻觉隐藏工具名 · 没解锁就瞎调',
  '调用约定错 · 要 JSON 字符串却传了 dict',
  '把写操作甩给用户去做',
];

const Bar: React.FC<{d: typeof DOMS[0]; idx: number; land: boolean}> = ({d, idx, land}) => {
  const frame = useCurrentFrame();
  const start = 40 + idx * 12;
  const t = interpolate(frame, [start, start + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const maxH = land ? 260 : 360;
  const h = (d.v / 65) * maxH * t + 3;
  const val = d.v * t;
  const cliff = d.d === 'banking';
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
      <div style={{fontSize: land ? 32 : 40, fontWeight: 850, color: d.color, letterSpacing: -1}}>{val.toFixed(1)}%</div>
      <div style={{width: '70%', height: h, background: `linear-gradient(180deg,${d.color},${d.color}bb)`, borderRadius: '12px 12px 0 0', marginTop: 8, boxShadow: cliff ? `0 0 26px ${C.rose}66` : `0 0 16px ${d.color}33`}} />
      <div style={{fontSize: 22, fontWeight: 700, color: cliff ? C.rose : C.ink3, marginTop: 12}}>{d.d}</div>
    </div>
  );
};

export const Cliff: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const head = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{padding: land ? '70px 90px 120px' : '224px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: head}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            τ³ 最难一关
          </div>
          <div style={{fontSize: land ? 54 : 60, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>
            知识全懂,<span style={{color: C.rose}}>协议崩了</span>
          </div>
          <div style={{fontSize: 24, fontWeight: 600, color: C.ink3, marginTop: 10}}>
            同一个 32B 模型 · 四域单次成功率(pass¹)
          </div>
        </div>

        <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '24px 6px 0'}}>
          {DOMS.map((d, i) => <Bar key={d.d} d={d} idx={i} land={land} />)}
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{fontSize: 21, fontWeight: 700, color: C.ink4, letterSpacing: 1}}>banking 断崖到 4.7% · 三重崩</div>
          {CAUSES.map((c, i) => {
            const o = interpolate(frame, [96 + i * 12, 112 + i * 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: o, transform: `translateX(${(1 - o) * -12}px)`, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '14px 18px', boxShadow: C.shadow}}>
                <span style={{width: 30, height: 30, borderRadius: 15, background: `${C.rose}1f`, color: C.rose, fontSize: 18, fontWeight: 850, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</span>
                <span style={{fontSize: 23, fontWeight: 700, color: C.ink2}}>{c}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
