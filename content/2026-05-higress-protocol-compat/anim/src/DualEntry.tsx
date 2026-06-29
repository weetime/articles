import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type N = {label: string; sub: string; hl?: boolean};

const Lane: React.FC<{
  title: string; sub: string; color: string; nodes: N[]; delay: number; band: string;
}> = ({title, sub, color, nodes, delay, band}) => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [delay, delay + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  // travelling dots along the lane
  const period = 130;
  const dots = [0, 0.25, 0.5, 0.75].map((ph) => ((frame - delay) / period + ph) % 1).filter((p) => p >= 0);
  return (
    <div style={{opacity: intro, background: band, border: `2px solid ${color}44`, borderRadius: 26, padding: '24px 26px', boxShadow: C.shadow}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <div style={{fontSize: 30, fontWeight: 850, color}}>{title}</div>
        <div style={{fontSize: 19, color: C.ink3, fontWeight: 600}}>{sub}</div>
      </div>
      <div style={{position: 'relative', marginTop: 18, height: 130}}>
        {/* baseline */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 60, height: 4, background: `${color}33`, borderRadius: 2}} />
        {/* travelling dots */}
        {dots.map((p, i) => (
          <div key={i} style={{position: 'absolute', top: 54, left: `${p * 100}%`, width: 16, height: 16, borderRadius: 8, background: color, boxShadow: `0 0 16px ${color}`, transform: 'translateX(-8px)'}} />
        ))}
        {/* nodes */}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {nodes.map((n, i) => (
            <React.Fragment key={i}>
              <div style={{width: 198, background: n.hl ? `${color}22` : C.panel, border: `2px solid ${n.hl ? color + '99' : C.line2}`, borderRadius: 16, padding: '14px 10px', textAlign: 'center'}}>
                <div style={{fontSize: 21, fontWeight: 800, color: n.hl ? color : C.ink}}>{n.label}</div>
                <div style={{fontSize: 15, color: C.ink3, fontWeight: 600, marginTop: 5}}>{n.sub}</div>
              </div>
              {i < nodes.length - 1 && <div style={{fontSize: 30, fontWeight: 900, color: `${color}cc`}}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DualEntry: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px' : '220px 56px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          机制 · 双协议入口
        </div>
        <div style={{fontSize: land ? 50 : 58, fontWeight: 850, marginTop: 12, letterSpacing: -1}}>
          两条入口，<span style={{color: C.green}}>共用同一后端</span>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30}}>
          <Lane
            title="OpenAI" sub="原协议直通 · 仅路由与计量" color={C.cyan} delay={16}
            band={`linear-gradient(160deg,${C.cyan}10, transparent)`}
            nodes={[
              {label: '客户端', sub: '/v1/chat/completions'},
              {label: '网关直通', sub: '路由 + 计量'},
              {label: 'Qwen3-32B', sub: 'OpenAI 兼容'},
              {label: '原样返回', sub: 'data: 块 + [DONE]'},
            ]}
          />
          <Lane
            title="Anthropic" sub="网关双向翻译 · 客户端无感" color={C.violet} delay={40}
            band={`linear-gradient(160deg,${C.violet}12, transparent)`}
            nodes={[
              {label: '客户端', sub: '/v1/messages'},
              {label: '映射 OpenAI 形态', sub: 'ms 级 · wasm', hl: true},
              {label: 'Qwen3-32B', sub: '同一后端'},
              {label: '回译 Anthropic', sub: 'message_* 事件', hl: true},
            ]}
          />
        </div>

        <div style={{fontSize: 23, color: C.ink3, fontWeight: 600, textAlign: 'center'}}>
          协议路由按入口路径判别 · <b style={{color: C.ink2}}>无需额外配置</b>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
