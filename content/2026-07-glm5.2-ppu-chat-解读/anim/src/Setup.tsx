import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Frame, Eyebrow, Title} from './Frame';
import {C} from './theme';

const Box: React.FC<{tag: string; tagColor: string; rows: string[]; delay: number}> = ({tag, tagColor, rows, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{flex: 1, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 20, padding: '26px 28px', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div style={{fontSize: 24, fontWeight: 800, color: tagColor, background: `${tagColor}1c`, border: `1px solid ${tagColor}55`, borderRadius: 999, padding: '6px 18px', display: 'inline-block'}}>{tag}</div>
      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 13}}>
        {rows.map((r, i) => (
          <div key={i} style={{fontSize: 27, fontWeight: 600, color: C.ink2, lineHeight: 1.35}}>{r}</div>
        ))}
      </div>
    </div>
  );
};

const Load: React.FC<{name: string; shape: string; delay: number; color: string}> = ({name, shape, delay, color}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{flex: 1, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 18, padding: '22px 26px', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 12}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{width: 10, height: 10, borderRadius: 3, background: color}} />
        <span style={{fontSize: 30, fontWeight: 800, color: C.ink}}>{name}</span>
      </div>
      <div style={{fontSize: 24, color: C.ink3, fontWeight: 600, marginTop: 10, lineHeight: 1.4}}>{shape}</div>
    </div>
  );
};

export const Setup: React.FC = () => {
  return (
    <Frame>
      <Eyebrow n="01">方法</Eyebrow>
      <Title>怎么做的</Title>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
        <div style={{display: 'flex', gap: 20}}>
          <Box tag="固定" tagColor={C.off} delay={20} rows={['mem-fraction 0.75', 'TP = 8', 'cuda-graph-bs = 并发上限']} />
          <Box tag="被调" tagColor={C.violet} delay={30} rows={['max-running-requests', '32 → 48 → 64', '→ 96 → 128']} />
        </div>
        <div style={{fontSize: 25, fontWeight: 700, color: C.ink3, marginTop: 4}}>两类负载</div>
        <div style={{display: 'flex', gap: 20}}>
          <Load name="Chat 短对话" shape="输入 ~800 / 输出 ~256" delay={46} color={C.violet} />
          <Load name="Agent 工具调用" shape="真实轨迹 · 长输入 5–9K" delay={56} color={C.amber} />
        </div>
      </div>
    </Frame>
  );
};
