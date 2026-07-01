import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, random, Easing} from 'remotion';
import {Bg} from './Bg';
import {C, PREFIX} from './theme';
import {makeGeo, pathPos, Node, Geo} from './flow';

const TRAVEL = 56;
const DEATH = 150;
const RECOVER = 322;

type Req = {i: number; birth: number; target: number; scatter: boolean; probe: boolean};
const REQS: Req[] = [];
for (let i = 0; i < 74; i++) {
  const birth = 18 + i * 6;
  let target: number;
  if (birth < DEATH) target = random(`fo-${i}`) < 0.3 ? 0 : 1;
  else if (birth < RECOVER) target = 0;
  else target = random(`fo-${i}`) < 0.3 ? 0 : 1;
  const scatter = target === 1 && birth < DEATH && birth + TRAVEL > DEATH;
  REQS.push({i, birth, target, scatter, probe: false});
}
REQS.push({i: 999, birth: RECOVER, target: 1, scatter: false, probe: true}); // 探活先行

export const Failover: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const g: Geo = makeGeo(width, height);
  const intro = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  const dead = frame >= DEATH && frame < RECOVER;
  const deadAmt = interpolate(frame, [DEATH, DEATH + 16, RECOVER, RECOVER + 18], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // 死亡冲击:scale 1→1.16→0.94→1
  const punch = spring({frame: frame - DEATH, fps, config: {damping: 8, stiffness: 150}});
  const bScale = frame < DEATH ? 1 : interpolate(punch, [0, 0.4, 1], [1.16, 0.94, 1]);
  const ring = interpolate(frame, [DEATH, DEATH + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // 恢复探活脉冲
  const probeGlow = interpolate(frame, [RECOVER + TRAVEL - 6, RECOVER + TRAVEL + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * interpolate(frame, [RECOVER + TRAVEL + 10, RECOVER + TRAVEL + 40], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const glow = [0, 0];
  for (const r of REQS) {
    if (r.scatter) continue;
    if (r.target === 1 && dead && !r.probe) continue;
    const arr = r.birth + TRAVEL;
    if (arr <= frame && frame - arr < 14) {
      const inten = 1 - (frame - arr) / 14;
      if (inten > glow[r.target]) glow[r.target] = Math.max(glow[r.target], inten);
    }
  }

  const phase = frame < DEATH ? 0 : frame < RECOVER ? 1 : 2;
  const status = [
    {t: '正常 · 加权 30 / 70', c: C.green},
    {t: '子集群 B 连续探测失败 → outlier 自动摘除', c: C.rose},
    {t: '探活通过 → 自动回填权重', c: C.green},
  ][phase];

  const wire = (a: {x: number; y: number}, b: {x: number; y: number}, col: string, alive: boolean) => (
    <>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.line2} strokeWidth={3} strokeDasharray={alive ? undefined : '4 8'} opacity={alive ? 1 : 0.4} />
      {alive && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={4} strokeDasharray="9 11" strokeDashoffset={-((frame % 26) / 26) * 20} opacity={0.5} strokeLinecap="round" />}
    </>
  );
  const bAlive = !dead;

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}>
        <div style={{position: 'absolute', left: 60, top: 222, right: 60}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            故障转移 · DestinationRule outlier
          </div>
          <div style={{fontSize: 54, fontWeight: 850, marginTop: 10, letterSpacing: -1.5}}>故障<span style={{color: C.rose}}>自动摘除</span> · 探活<span style={{color: C.green}}>自动回填</span></div>
        </div>

        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          {wire(g.cliExit, g.f5In, C.violet, true)}
          {wire(g.f5Out, g.gwIn, C.violet, true)}
          {wire(g.gwOut, g.subEntry(0), PREFIX[0], true)}
          {wire(g.gwOut, g.subEntry(1), PREFIX[1], bAlive)}
          {dead && (
            <circle cx={g.subs[1].x} cy={g.subs[1].y} r={interpolate(ring, [0, 1], [60, 130])} fill="none" stroke={C.rose} strokeWidth={interpolate(ring, [0, 1], [6, 1])} opacity={(1 - ring) * 0.9} />
          )}
        </svg>

        <Node x={g.cli.x} y={g.cli.y} w={g.nodeW} h={92}>
          <div style={{fontSize: 27, fontWeight: 800}}>客户端 / Agent</div>
        </Node>
        <Node x={g.gw.x} y={g.gw.y} w={g.gwW} h={118} glow={C.violet} glowI={0.6} border={C.violet + '66'}>
          <div style={{fontSize: 28, fontWeight: 850, color: C.violet}}>主集群 Higress</div>
          <div style={{fontSize: 17, color: C.ink3, marginTop: 5}}>outlier 探活 · 摘除 / 回填</div>
        </Node>

        {/* 子集群 A */}
        <Node x={g.subs[0].x} y={g.subs[0].y} w={g.subW} h={g.subH} glow={PREFIX[0]} glowI={glow[0]} border={glow[0] > 0.05 ? PREFIX[0] + 'aa' : C.line2}>
          <div style={{fontSize: 28, fontWeight: 850}}>子集群 A</div>
          <div style={{fontSize: 16, color: dead ? C.green : C.ink3, marginTop: 4, fontWeight: dead ? 800 : 400}}>{dead ? '承接全部流量' : 'vLLM serving'}</div>
        </Node>

        {/* 子集群 B(会死) */}
        <div style={{position: 'absolute', left: g.subs[1].x - g.subW / 2, top: g.subs[1].y - g.subH / 2, width: g.subW, height: g.subH, transform: `scale(${bScale})`, transformOrigin: 'center'}}>
          <Node x={g.subW / 2} y={g.subH / 2} w={g.subW} h={g.subH}
            glow={dead ? C.rose : frame >= RECOVER ? C.green : PREFIX[1]} glowI={dead ? 0 : Math.max(glow[1], probeGlow)}
            border={dead ? C.rose + 'cc' : frame >= RECOVER && probeGlow > 0.1 ? C.green + 'aa' : C.line2} dead={deadAmt}>
            <div style={{fontSize: 28, fontWeight: 850}}>子集群 B</div>
            <div style={{fontSize: 16, color: dead ? C.rose : frame >= RECOVER ? C.green : C.ink3, marginTop: 4, fontWeight: dead || frame >= RECOVER ? 800 : 400}}>
              {dead ? '✕ 已摘除' : frame >= RECOVER && probeGlow > 0.05 ? '✓ 探活通过' : 'vLLM serving'}
            </div>
          </Node>
        </div>

        {/* 请求流 */}
        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          {REQS.map((r) => {
            const age = frame - r.birth;
            if (age < 0 || age > TRAVEL + 4) return null;
            let p = Math.min(1, age / TRAVEL);
            let fade = interpolate(p, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);
            let x: number, y: number;
            if (r.scatter && frame >= DEATH) {
              // 死亡瞬间被打散:停在死亡点 + 侧移淡出
              const pAtDeath = Math.min(1, (DEATH - r.birth) / TRAVEL);
              const pos = pathPos(pAtDeath, 1, g);
              const off = (frame - DEATH);
              x = pos.x + (random(`sc-${r.i}`) - 0.5) * off * 2.2;
              y = pos.y - off * 1.2;
              fade = interpolate(off, [0, 16], [1, 0], {extrapolateRight: 'clamp'});
              return (
                <g key={r.i} opacity={fade}>
                  <circle cx={x} cy={y} r={10} fill={C.rose} />
                  <text x={x} y={y - 14} fill={C.rose} fontSize={22} fontWeight={900} textAnchor="middle">✕</text>
                </g>
              );
            }
            const pos = pathPos(p, r.target, g);
            const col = r.probe ? C.green : PREFIX[r.target === 1 ? 1 : 0];
            const jit = (random(`fj-${r.i}`) - 0.5) * 9;
            return (
              <g key={r.i} opacity={fade}>
                {r.probe && <circle cx={pos.x + jit} cy={pos.y} r={20} fill={C.green} opacity={0.25} />}
                <circle cx={pos.x + jit} cy={pos.y} r={r.probe ? 12 : 17} fill={col} opacity={r.probe ? 1 : 0.16} />
                <circle cx={pos.x + jit} cy={pos.y} r={r.probe ? 7 : 10} fill={col} />
              </g>
            );
          })}
        </svg>

        <div style={{position: 'absolute', left: 60, right: 60, top: 1398, textAlign: 'center'}}>
          <span style={{fontSize: 28, fontWeight: 800, color: status.c, background: `${status.c}1a`, border: `1px solid ${status.c}55`, borderRadius: 999, padding: '12px 28px'}}>{status.t}</span>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
