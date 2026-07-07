import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type Col = {name: string; who: string; watch: string; color: string; icon: React.ReactNode};
const ic = (path: React.ReactNode, color: string) => (
  <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const COLS: Col[] = [
  {name: 'Chat', who: '人在等', watch: 'TTFT < 1s', color: C.green, icon: ic(<><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9.5L5 19v-2.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z" /><circle cx="8.5" cy="11" r="1.1" fill={C.green} stroke="none" /><circle cx="12" cy="11" r="1.1" fill={C.green} stroke="none" /><circle cx="15.5" cy="11" r="1.1" fill={C.green} stroke="none" /></>, C.green)},
  {name: 'RAG', who: '检索拼进来', watch: 'TTFT + KV 命中', color: C.cyan, icon: ic(<><ellipse cx="12" cy="5.6" rx="7" ry="2.8" /><path d="M5 5.6v12.8c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V5.6" /><path d="M5 12c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8" /></>, C.cyan)},
  {name: 'Agent', who: '喂给工具', watch: '吞吐 / 完成时间', color: C.amber, icon: ic(<><rect x="6.5" y="6.5" width="11" height="11" rx="2.2" /><rect x="10" y="10" width="4" height="4" rx="0.6" /><path d="M9.5 6.5V3.8M14.5 6.5V3.8M9.5 20.2v-2.7M14.5 20.2v-2.7M6.5 9.5H3.8M6.5 14.5H3.8M20.2 9.5h-2.7M20.2 14.5h-2.7" /></>, C.amber)},
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '250px 60px 500px', display: 'flex', flexDirection: 'column', opacity: intro}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 800, color: C.cyan}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.cyan, boxShadow: `0 0 16px ${C.cyan}88`}} />
          第三关 · 跑对场景
        </div>
        <div style={{fontSize: 66, fontWeight: 850, letterSpacing: -1.5, marginTop: 16}}>
          同一个模型,<span style={{color: C.cyan}}>三套 SLO</span>
        </div>
        <div style={{fontSize: 28, fontWeight: 600, color: C.ink3, marginTop: 14}}>盯的指标,完全不同</div>
        <div style={{display: 'flex', gap: 18, marginTop: 54}}>
          {COLS.map((c, i) => {
            const d = 20 + i * 16;
            const o = interpolate(frame, [d, d + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
            return (
              <div key={c.name} style={{flex: 1, background: C.panel, border: `2px solid ${c.color}44`, borderRadius: 22, padding: '34px 18px', textAlign: 'center', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 22}px)`}}>
                <div style={{height: 66, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.icon}</div>
                <div style={{fontSize: 40, fontWeight: 850, color: c.color, marginTop: 14}}>{c.name}</div>
                <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginTop: 6}}>{c.who}</div>
                <div style={{marginTop: 22, paddingTop: 20, borderTop: `1px solid ${C.line}`, fontSize: 24, fontWeight: 800, color: C.ink}}>{c.watch}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 46, textAlign: 'center', fontSize: 32, fontWeight: 800, color: C.ink2}}>
          看懂场景,才知道<span style={{color: C.cyan}}>该往哪调</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
