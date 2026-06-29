import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const TAILS = [
  {an: 806, note: '同期 OpenAI 正常 ~300ms'},
  {an: 1170, note: '无时间聚集 · 非 GC/冷调度'},
  {an: 1390, note: '40 次中 3 次 · 7.5% 稀疏'},
];

const Row: React.FC<{an: number; note: string; idx: number}> = ({an, note, idx}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = 40 + idx * 16;
  const s = spring({frame: frame - start, fps, config: {damping: 200, stiffness: 130}});
  const v = interpolate(frame, [start, start + 30], [0, an], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 20, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 20, padding: '20px 26px', boxShadow: C.shadow, opacity: s, transform: `translateY(${(1 - s) * 18}px)`}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 10, width: 280}}>
        <div style={{fontSize: 22, fontWeight: 700, color: C.violet}}>Anthropic</div>
        <div style={{fontSize: 50, fontWeight: 850, color: C.rose, letterSpacing: -2}}>{Math.round(v)}<span style={{fontSize: 24}}>ms</span></div>
      </div>
      <div style={{fontSize: 28, fontWeight: 900, color: C.ink4}}>→</div>
      <div style={{flex: 1, fontSize: 22, color: C.ink2, fontWeight: 600}}>{note}</div>
      <div style={{fontSize: 20, fontWeight: 800, color: C.green, background: `${C.green}1a`, border: `1px solid ${C.green}55`, borderRadius: 999, padding: '6px 16px'}}>✓ 非协议</div>
    </div>
  );
};

export const LongTail: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  const concl = interpolate(frame, [150, 175], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px' : '220px 56px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          异常归因 · 长尾排查
        </div>
        <div style={{fontSize: land ? 50 : 58, fontWeight: 850, marginTop: 12, letterSpacing: -1}}>
          长尾<span style={{color: C.green}}>不在协议账上</span>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
          {TAILS.map((t, i) => (<Row key={i} an={t.an} note={t.note} idx={i} />))}
          <div style={{marginTop: 8, background: `${C.green}12`, border: `2px solid ${C.green}44`, borderRadius: 20, padding: '22px 26px', opacity: concl, transform: `translateY(${(1 - concl) * 16}px)`}}>
            <div style={{fontSize: 25, fontWeight: 700, color: C.ink, lineHeight: 1.5}}>
              OpenAI 一侧 <b style={{color: C.green}}>0 长尾</b>，两协议共用同一网关与后端、路径对称 —— 归因为
              <b style={{color: C.green}}> 客户端→网关的网络 RTT 抖动</b>（TCP 重传 / DNS），生产做 SLA 时应单独建模。
            </div>
          </div>
        </div>

        <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, textAlign: 'center'}}>
          稳健统计：<b style={{color: C.ink2}}>Tukey 1.5·IQR</b> 围栏不被离群点污染，优于 Z-score
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
