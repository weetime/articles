import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing} from 'remotion';
import {Bg} from './Bg';
import {C, FONT} from './theme';

const eo = Easing.out(Easing.cubic);
const MONO = 'SFMono-Regular,"JetBrains Mono",Menlo,Consolas,monospace';

const LINES: {t: string; c?: string}[] = [
  {t: '$ 选模型 → 配硬件 → serve', c: C.green},
  {t: 'vllm serve Qwen3-32B \\'},
  {t: '  --tensor-parallel-size 4 \\'},
  {t: '  --max-model-len 8192 \\'},
  {t: '  --kv-cache-dtype fp8'},
];
const STEPS = ['① download', '② vllm serve', '③ curl 验证'];

export const Run: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Bg>
      <AbsoluteFill style={{padding: '240px 64px 500px', display: 'flex', flexDirection: 'column', opacity: intro}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 800, color: C.violet}}>
          <span style={{width: 12, height: 12, borderRadius: 6, background: C.violet, boxShadow: `0 0 16px ${C.violet}88`}} />
          第一关 · 能跑
        </div>
        <div style={{fontSize: 64, fontWeight: 850, letterSpacing: -1.5, marginTop: 16}}>
          复制一条<span style={{color: C.green}}>能直接跑</span>的命令
        </div>
        <div style={{marginTop: 44, background: '#0a0d14', border: `1px solid ${C.line2}`, borderRadius: 22, padding: '30px 32px', boxShadow: C.shadow}}>
          <div style={{display: 'flex', gap: 10, marginBottom: 24}}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (<span key={c} style={{width: 15, height: 15, borderRadius: 8, background: c}} />))}
          </div>
          {LINES.map((ln, i) => {
            const d = 20 + i * 13;
            const o = interpolate(frame, [d, d + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={i} style={{fontFamily: MONO, fontSize: 30, lineHeight: 1.6, color: ln.c || C.ink, opacity: o, transform: `translateX(${(1 - o) * 12}px)`, whiteSpace: 'pre'}}>{ln.t}</div>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 40}}>
          {STEPS.map((s, i) => {
            const b = spring({frame: frame - (86 + i * 10), fps, config: {damping: 200}});
            return (
              <div key={s} style={{flex: 1, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 800, color: C.ink2, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 16, padding: '20px 8px', boxShadow: C.shadow, opacity: b, transform: `translateY(${(1 - b) * 16}px)`}}>{s}</div>
            );
          })}
        </div>
        <div style={{marginTop: 34, fontSize: 30, fontWeight: 700, color: C.ink3, textAlign: 'center'}}>
          恭喜,你把它跑起来了 —— <span style={{color: C.amber}}>但这只是第 0 天</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
