import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random, Easing} from 'remotion';
import {Bg} from './Bg';
import {C, PREFIX} from './theme';
import {makeGeo, pathPos, Node, Geo, HAGhost} from './flow';

const TRAVEL = 56;
const START = 26;

type Req = {i: number; birth: number; target: number; color: number};
const REQS: Req[] = [];
for (let i = 0; i < 90; i++) {
  const birth = START + i * 5;
  if (birth > 360) break;
  const target = random(`cw-${i}`) < 0.3 ? 0 : 1; // 加权 30/70
  REQS.push({i, birth, target, color: i % 4});
}

// 行进蚂蚁连线
const Wire: React.FC<{a: {x: number; y: number}; b: {x: number; y: number}; frame: number; on?: boolean; color?: string}> = ({a, b, frame, on, color}) => (
  <>
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.line2} strokeWidth={3} />
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={(on ? color : C.violet) ?? C.violet} strokeWidth={on ? 4 : 3}
      strokeDasharray="9 11" strokeDashoffset={-((frame % 26) / 26) * 20} opacity={on ? 0.5 : 0.28} strokeLinecap="round" />
  </>
);

export const Cluster: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const g: Geo = makeGeo(width, height);
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  // 子集群到达计数 + glow
  const arrived = [0, 0];
  let glow = [0, 0];
  for (const r of REQS) {
    const arr = r.birth + TRAVEL;
    if (arr <= frame) arrived[r.target]++;
    if (arr <= frame && frame - arr < 15) {
      const inten = 1 - (frame - arr) / 15;
      if (inten > glow[r.target]) glow[r.target] = inten;
    }
  }
  const tot = arrived[0] + arrived[1] || 1;
  const pctA = Math.round((arrived[0] / tot) * 100);
  const pctB = 100 - (tot ? pctA : 0);

  const labelDelay = interpolate(frame, [200, 220], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}>
        <div style={{position: 'absolute', left: 60, top: 224}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            跨集群路由 · 加权池
          </div>
          <div style={{fontSize: 56, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>
            主集群<span style={{color: C.cyan}}>只路由</span> · 子集群<span style={{color: C.green}}>跑模型</span>
          </div>
        </div>

        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          <Wire a={g.cliExit} b={g.f5In} frame={frame} />
          <Wire a={g.f5Out} b={g.gwIn} frame={frame} />
          <Wire a={g.gwOut} b={g.subEntry(0)} frame={frame} on color={PREFIX[0]} />
          <Wire a={g.gwOut} b={g.subEntry(1)} frame={frame} on color={PREFIX[1]} />
          {/* 权重标注 */}
          <g opacity={labelDelay}>
            <text x={(g.gwOut.x + g.subEntry(0).x) / 2 - 50} y={(g.gwOut.y + g.subEntry(0).y) / 2} fill={C.cyan} fontSize={30} fontWeight={800} textAnchor="middle">w 30</text>
            <text x={(g.gwOut.x + g.subEntry(1).x) / 2 + 50} y={(g.gwOut.y + g.subEntry(1).y) / 2} fill={C.green} fontSize={30} fontWeight={800} textAnchor="middle">w 70</text>
          </g>
        </svg>

        <Node x={g.cli.x} y={g.cli.y} w={g.nodeW} h={g.nodeH}>
          <div style={{fontSize: 30, fontWeight: 800}}>客户端 / Agent</div>
          <div style={{fontSize: 18, color: C.ink3, marginTop: 6}}>{'{ model: ... }'} · 双协议</div>
        </Node>

        <Node x={g.f5.x} y={g.f5.y} w={g.nodeW} h={92}>
          <div style={{fontSize: 26, fontWeight: 800, color: C.amber}}>F5 全局 LB</div>
          <div style={{fontSize: 17, color: C.ink3, marginTop: 4}}>就近 / 健康 → 主集群</div>
        </Node>

        <HAGhost g={g} frame={frame} />
        <Node x={g.gw.x} y={g.gw.y} w={g.gwW} h={g.gwH} glow={C.violet} glowI={0.7} border={C.violet + '66'}>
          <div style={{fontSize: 30, fontWeight: 850, color: C.violet}}>主集群 Higress · 主</div>
          <div style={{fontSize: 18, color: C.ink3, marginTop: 6, fontWeight: 600}}>纯路由 · 不 serving</div>
          <div style={{marginTop: 8, fontSize: 16, color: C.ink2, fontFamily: 'ui-monospace,monospace', background: C.track, borderRadius: 8, padding: '4px 12px'}}>ServiceEntry 加权池</div>
        </Node>

        {[0, 1].map((i) => {
          const arrColor = i === 0 ? PREFIX[0] : PREFIX[1];
          const frac = arrived[i] / tot;
          return (
            <Node key={i} x={g.subs[i].x} y={g.subs[i].y} w={g.subW} h={g.subH} glow={arrColor} glowI={glow[i]} border={glow[i] > 0.05 ? arrColor + 'aa' : C.line2}>
              <div style={{fontSize: 28, fontWeight: 850}}>子集群 {i === 0 ? 'A' : 'B'}</div>
              <div style={{fontSize: 17, color: C.ink3, marginTop: 4}}>higress · vLLM serving</div>
              <div style={{marginTop: 12, width: g.subW - 90, height: 16, background: C.track, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.line}`}}>
                <div style={{height: '100%', width: `${frac * 140}%`, maxWidth: '100%', background: i === 0 ? C.fillCyan : C.fillGreen, borderRadius: 7}} />
              </div>
              <div style={{marginTop: 8, fontSize: 22, fontWeight: 850, color: arrColor}}>{tot > 4 ? (i === 0 ? pctA : pctB) : 0}%</div>
            </Node>
          );
        })}

        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          {REQS.map((r) => {
            const age = frame - r.birth;
            if (age < 0 || age > TRAVEL + 3) return null;
            const p = Math.min(1, age / TRAVEL);
            const pos = pathPos(p, r.target, g);
            const fade = interpolate(p, [0, 0.05, 0.92, 1], [0, 1, 1, 0]);
            const col = PREFIX[r.color];
            const jit = (random(`j-${r.i}`) - 0.5) * 10;
            return (
              <g key={r.i} opacity={fade}>
                <circle cx={pos.x + jit} cy={pos.y} r={18} fill={col} opacity={0.16} />
                <circle cx={pos.x + jit} cy={pos.y} r={10} fill={col} />
              </g>
            );
          })}
        </svg>

        <div style={{position: 'absolute', left: 60, right: 60, top: 1400, textAlign: 'center', fontSize: 26, fontWeight: 700, color: C.ink2, opacity: labelDelay}}>
          基线 · <span style={{color: C.violet}}>加权轮询</span>:按端点权重固定 <b style={{color: C.ink}}>30 / 70</b> 分流
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
