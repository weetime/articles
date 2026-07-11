import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Step: React.FC<{tag: string; year: string; add: string; note: string; color: string; delay: number; last?: boolean}> =
({tag, year, add, note, color, delay, last}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  const lineH = interpolate(frame, [delay + 6, delay + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <div style={{display: 'flex', gap: 24, opacity: s, transform: `translateX(${(1 - s) * -20}px)`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{width: 30, height: 30, borderRadius: 16, background: color, boxShadow: `0 0 18px ${color}66`, flex: 'none'}} />
        {!last && <div style={{width: 4, flex: 1, marginTop: 6, background: C.line2, borderRadius: 2, position: 'relative'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: `${lineH * 100}%`, background: color, borderRadius: 2}} />
        </div>}
      </div>
      <div style={{paddingBottom: last ? 0 : 34, flex: 1}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <span style={{fontSize: 46, fontWeight: 850, color, letterSpacing: -1}}>{tag}</span>
          <span style={{fontSize: 22, fontWeight: 700, color: C.ink4}}>{year}</span>
        </div>
        <div style={{fontSize: 30, fontWeight: 800, color: C.ink, marginTop: 6}}>{add}</div>
        <div style={{fontSize: 23, fontWeight: 600, color: C.ink3, marginTop: 4, lineHeight: 1.4}}>{note}</div>
      </div>
    </div>
  );
};

export const Evolution: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const head = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const domO = interpolate(frame, [116, 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const doms = [['airline', '50'], ['retail', '115'], ['telecom', '2285 生成'], ['banking', '698 文档']];

  return (
    <Bg>
      <AbsoluteFill style={{padding: land ? '70px 90px 120px' : '224px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: head}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            三代演进
          </div>
          <div style={{fontSize: land ? 54 : 62, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>
            越测越像<span style={{color: C.violet}}>真实业务</span>
          </div>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 20}}>
          <Step tag="τ-bench" year="2024" add="airline + retail 两域" note="首创:用户模拟器 + 工具 + policy + pass^k" color={C.cyan} delay={12} />
          <Step tag="τ²-bench" year="2025" add="+ telecom · dual-control" note="用户也能操作环境 —— Agent 要「指挥用户」而非独自执行" color={C.violet} delay={40} />
          <Step tag="τ³-bench" year="最新" add="+ banking 知识域 / voice" note="可发现工具:特权动作藏起来,须先解锁再调用" color={C.rose} delay={68} last />
        </div>

        <div style={{opacity: domO}}>
          <div style={{fontSize: 20, fontWeight: 700, color: C.ink4, marginBottom: 10, letterSpacing: 1}}>四个域</div>
          <div style={{display: 'flex', gap: 12}}>
            {doms.map(([d, n], i) => (
              <div key={d} style={{flex: 1, textAlign: 'center', background: C.panel, border: `1.5px solid ${C.line2}`, borderRadius: 14, padding: '14px 6px', boxShadow: C.shadow}}>
                <div style={{fontSize: 25, fontWeight: 850, color: [C.cyan, C.violet, C.amber, C.rose][i]}}>{d}</div>
                <div style={{fontSize: 17, fontWeight: 600, color: C.ink3, marginTop: 4}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
