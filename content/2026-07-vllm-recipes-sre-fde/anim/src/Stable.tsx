import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type G = {k: string; en: string; v: string; color: string; hot?: boolean};
const SIG: G[] = [
  {k: '延迟', en: 'Latency', v: 'TTFT · TPOT', color: C.cyan},
  {k: '流量', en: 'Traffic', v: 'RPS · tok/s', color: C.green},
  {k: '错误', en: 'Errors', v: 'errorRate · OOM', color: C.rose},
  {k: '饱和度', en: 'Saturation ★', v: 'KV 利用率 · 排队深度', color: C.amber, hot: true},
];

export const Stable: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const coc = interpolate(frame, [96, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '240px 60px 500px', display: 'flex', flexDirection: 'column', opacity: intro}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 800, color: C.green}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.green, boxShadow: `0 0 16px ${C.green}88`}} />
          第四关 · 持续稳定跑
        </div>
        <div style={{fontSize: 62, fontWeight: 850, letterSpacing: -1.5, marginTop: 16}}>
          挂上<span style={{color: C.green}}>黄金指标</span>,写进版本库
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 48}}>
          {SIG.map((g, i) => {
            const d = 22 + i * 12;
            const o = interpolate(frame, [d, d + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
            const wide = g.hot;
            return (
              <div key={g.k} style={{width: wide ? '100%' : 'calc(50% - 9px)', background: g.hot ? `${C.amber}14` : C.panel, border: `2px solid ${g.hot ? C.amber + '66' : C.line2}`, borderRadius: 20, padding: '26px 28px', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                  <span style={{fontSize: 32, fontWeight: 850, color: g.color}}>{g.k}</span>
                  <span style={{fontSize: 20, fontWeight: 700, color: C.ink4, fontFamily: 'monospace'}}>{g.en}</span>
                </div>
                <div style={{fontSize: 26, fontWeight: 700, color: C.ink2, marginTop: 10}}>{g.v}{g.hot && <span style={{color: C.amber, fontWeight: 800}}> · 最易漏</span>}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 40, background: C.panel, border: `2px solid ${C.violet}44`, borderRadius: 20, padding: '28px 30px', boxShadow: C.shadow, opacity: coc, transform: `translateY(${(1 - coc) * 16}px)`}}>
          <div style={{fontSize: 30, fontWeight: 850, color: C.violet}}>config-as-code</div>
          <div style={{fontSize: 26, fontWeight: 600, color: C.ink2, marginTop: 10, lineHeight: 1.5}}>
            部署写成带版本的 YAML · 纯函数命令合成 · 可 diff 可回滚
          </div>
        </div>
        <div style={{marginTop: 34, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.ink2}}>
          凌晨三点,你才 <span style={{color: C.green}}>睡得着</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
