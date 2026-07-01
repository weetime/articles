import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C, PREFIX} from './theme';
import {Board, rv} from './layer';

// 机制:一个请求依次经过三个 CR(Ingress 破环 → ServiceEntry 加权 → DestinationRule outlier)
const eIO = Easing.bezier(0.45, 0, 0.55, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 关键点 y
const CY = {cli: 388, ing: 570, se: 766, dr: 962, sub: 1216};
const CX = 540;
const SUBX = [352, 728];
const CYCLE = 132;

// 请求沿链路的位置(x,y) + 当前所在段 0..4
function reqPos(p: number, target: number) {
  const segs = [
    [CY.cli, CY.ing], [CY.ing, CY.se], [CY.se, CY.dr], [CY.dr, CY.sub],
  ];
  const bounds = [0, 0.2, 0.42, 0.62, 1];
  for (let i = 0; i < 4; i++) {
    if (p <= bounds[i + 1]) {
      const t = eIO((p - bounds[i]) / (bounds[i + 1] - bounds[i]));
      const y = lerp(segs[i][0], segs[i][1], t);
      const x = i < 3 ? CX : lerp(CX, SUBX[target], t);
      return {x, y, seg: i};
    }
  }
  return {x: SUBX[target], y: CY.sub, seg: 3};
}

const Wire: React.FC<{y1: number; y2: number; frame: number; on: boolean; x?: number}> = ({y1, y2, frame, on, x = CX}) => (
  <>
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.line2} strokeWidth={3} />
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.violet} strokeWidth={on ? 4 : 3} strokeDasharray="9 11" strokeDashoffset={-((frame % 26) / 26) * 20} opacity={on ? 0.55 : 0.25} strokeLinecap="round" />
  </>
);

const CR: React.FC<{y: number; no: string; name: string; role: string; detail: React.ReactNode; color: string; glow: number; delay: number; frame: number}> =
  ({y, no, name, role, detail, color, glow, delay, frame}) => {
    const o = rv(frame, delay);
    const W = 880;
    return (
      <div style={{position: 'absolute', left: CX - W / 2, top: y - 58, width: W, minHeight: 116, background: glow > 0.05 ? `linear-gradient(180deg,${color}20,${C.panel})` : C.panel, border: `2px solid ${glow > 0.05 ? color : C.line2}`, borderRadius: 18, padding: '16px 24px', boxShadow: glow > 0.05 ? `0 0 ${30 * glow}px ${color}55, ${C.shadow}` : C.shadow, opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
          <span style={{fontSize: 26, fontWeight: 850, color}}>{no} {name}</span>
          <span style={{fontSize: 17, color: C.ink3, fontWeight: 700}}>{role}</span>
          {glow > 0.3 && <span style={{marginLeft: 'auto', fontSize: 18, fontWeight: 850, color}}>▶ 处理中</span>}
        </div>
        <div style={{fontSize: 19, color: C.ink2, marginTop: 8, fontWeight: 600, lineHeight: 1.45, fontFamily: 'ui-monospace,monospace'}}>{detail}</div>
      </div>
    );
  };

export const Mechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  // 循环请求:持续 spawn,让链路一直有请求在流动(覆盖整段旁白)
  const start = 44;
  const reqs = Array.from({length: 16}, (_, i) => {
    const birth = start + i * 62;
    const p = (frame - birth) / CYCLE;
    const target = i % 2 === 0 ? 1 : 0; // 交替(演示 30/70 与命中)
    return {i, birth, p, target};
  });

  // 节点点亮:某请求正处于该段
  const glowAt = (seg: number) => {
    let g = 0;
    for (const r of reqs) {
      if (r.p < 0 || r.p > 1) continue;
      const pos = reqPos(r.p, r.target);
      if (pos.seg === seg) g = Math.max(g, 1);
      // 到达节点瞬间加亮
    }
    return g;
  };

  return (
    <Bg>
      <Board land={land}>
        <AbsoluteFill style={{opacity: intro}}>
          <div style={{position: 'absolute', left: 56, top: 222}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 700, color: C.violet}}>
              <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
              机制 · 一个请求的旅程
            </div>
            <div style={{fontSize: 50, fontWeight: 850, marginTop: 8, letterSpacing: -1.5}}>三个 CR · <span style={{color: C.violet}}>各司其职</span></div>
          </div>

          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
            <Wire y1={CY.cli + 40} y2={CY.ing - 58} frame={frame} on={glowAt(0) > 0} />
            <Wire y1={CY.ing + 58} y2={CY.se - 58} frame={frame} on={glowAt(1) > 0} />
            <Wire y1={CY.se + 58} y2={CY.dr - 58} frame={frame} on={glowAt(2) > 0} />
            <line x1={CX} y1={CY.dr + 58} x2={SUBX[0]} y2={CY.sub - 60} stroke={C.line2} strokeWidth={3} />
            <line x1={CX} y1={CY.dr + 58} x2={SUBX[1]} y2={CY.sub - 60} stroke={C.line2} strokeWidth={3} />
          </svg>

          {/* 客户端 */}
          <div style={{position: 'absolute', left: CX - 300, top: CY.cli - 42, width: 600, height: 84, background: C.panel, border: `2px solid ${C.violet}55`, borderRadius: 16, boxShadow: C.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: rv(frame, 10)}}>
            <div style={{fontSize: 24, fontWeight: 800}}>客户端 · <span style={{fontFamily: 'ui-monospace,monospace', color: C.cyan}}>{'{ model: Qwen-demo }'}</span></div>
          </div>

          <CR frame={frame} y={CY.ing} no="①" name="Ingress" role="HA 入口 + 破环" color={C.amber} glow={glowAt(0)} delay={20}
            detail={<>match: <span style={{color: C.cyan}}>Qwen-demo</span> · model-mapper → <span style={{color: C.green}}>Qwen-test</span></>} />
          <CR frame={frame} y={CY.se} no="②" name="ServiceEntry" role="加权池 · 选端点" color={C.cyan} glow={glowAt(1)} delay={26}
            detail={<>endpoints[ w30, w70 ] → 按权重选中一个<span style={{color: C.cyan}}>子集群网关</span></>} />
          <CR frame={frame} y={CY.dr} no="③" name="DestinationRule" role="LB 策略 + outlier" color={C.rose} glow={glowAt(2)} delay={32}
            detail={<>loadBalancer 选 pod · outlierDetection <span style={{color: C.rose}}>判活 / 摘除</span></>} />

          {/* 子集群 */}
          {[0, 1].map((i) => (
            <div key={i} style={{position: 'absolute', left: SUBX[i] - 165, top: CY.sub - 60, width: 330, height: 120, background: C.panel, border: `2px solid ${glowAt(3) > 0 ? PREFIX[i] + 'aa' : C.line2}`, borderRadius: 16, boxShadow: C.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: rv(frame, 38)}}>
              <div style={{fontSize: 26, fontWeight: 850}}>子集群 {i === 0 ? 'A' : 'B'}</div>
              <div style={{fontSize: 16, color: C.ink3, marginTop: 5}}>本地别名命中 · serving</div>
            </div>
          ))}

          {/* 请求点 + model 名随破环变化 */}
          <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
            {reqs.map((r) => {
              if (r.p < 0 || r.p > 1) return null;
              const pos = reqPos(r.p, r.target);
              const fade = interpolate(r.p, [0, 0.04, 0.94, 1], [0, 1, 1, 0]);
              const renamed = r.p >= 0.2;
              const col = renamed ? C.green : C.cyan;
              return (
                <g key={r.i} opacity={fade}>
                  <circle cx={pos.x} cy={pos.y} r={20} fill={col} opacity={0.18} />
                  <circle cx={pos.x} cy={pos.y} r={11} fill={col} />
                  {pos.seg < 3 && (
                    <text x={pos.x + 22} y={pos.y + 6} fill={col} fontSize={18} fontWeight={800} fontFamily="ui-monospace,monospace">{renamed ? 'Qwen-test' : 'Qwen-demo'}</text>
                  )}
                </g>
              );
            })}
          </svg>

          <div style={{position: 'absolute', left: 56, right: 56, top: 1360, textAlign: 'center', fontSize: 22, fontWeight: 700, color: C.ink3, opacity: rv(frame, 70)}}>
            回环腿带 <span style={{color: C.green}}>Qwen-test</span> 只命中本地别名 → <span style={{color: C.green}}>无路由环路</span>
          </div>
        </AbsoluteFill>
      </Board>
    </Bg>
  );
};
