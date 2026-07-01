import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random, Easing} from 'remotion';
import {Bg} from './Bg';
import {C, PREFIX} from './theme';
import {makeGeo, pathPos, Node, Geo, HAGhost} from './flow';

const TRAVEL = 56;
type Req = {i: number; beat: number; birth: number; target: number; color: number; bounce: boolean};

// 三个 beat 的请求(确定性生成)
const REQS: Req[] = [];
// beat 0 · 最少请求:贪心选更空闲腿(带衰减)→ 视觉上往更短的队列条钻
(() => {
  let load = [0, 0]; let k = 0;
  for (let i = 0; i < 30; i++) {
    const birth = 36 + i * 6;
    load[0] *= 0.84; load[1] *= 0.84;
    const target = load[0] <= load[1] ? 0 : 1;
    load[target] += 1;
    REQS.push({i: k++, beat: 0, birth, target, color: i % 4, bounce: false});
  }
})();
// beat 1 · 会话亲和:颜色=会话,固定映射(0,1→A;2,3→B)→ 同色永远同腿
(() => {
  let k = 100;
  for (let i = 0; i < 30; i++) {
    const birth = 232 + i * 6;
    const color = i % 4;
    const target = color < 2 ? 0 : 1;
    REQS.push({i: k++, beat: 1, birth, target, color, bounce: false});
  }
})();
// beat 2 · 熔断:多数打向 B,B 并发超上限则回弹(503)
(() => {
  let k = 200; const cap = 4; const local: Req[] = [];
  for (let i = 0; i < 34; i++) {
    const birth = 424 + i * 5;
    const aim = random(`bk-${i}`) < 0.8 ? 1 : 0;
    let bounce = false;
    if (aim === 1) {
      let live = 0;
      for (const r of local) if (r.target === 1 && !r.bounce && birth - r.birth < TRAVEL) live++;
      if (live >= cap) bounce = true;
    }
    const r = {i: k++, beat: 2, birth, target: aim, color: i % 4, bounce};
    local.push(r); REQS.push(r);
  }
})();

const POLICY = [
  {field: 'simple', val: 'LEAST_REQUEST', c: C.cyan},
  {field: 'consistentHash', val: 'x-session-id', c: C.green},
  {field: 'connectionPool', val: 'http2MaxRequests', c: C.amber},
];
const HEAD = [
  {t: '最少请求', d: '发往在途请求更少的子集群 · 实时拉平', c: C.cyan},
  {t: '会话亲和', d: '同一会话哈希到固定集群 · 复用 KV', c: C.green},
  {t: '熔断 / 过载', d: '超并发上限即刻拒绝 503 · 过载保护', c: C.amber},
];

export const Swap: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const g: Geo = makeGeo(width, height);
  const intro = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const beat = frame < 218 ? 0 : frame < 412 ? 1 : 2;

  // 翻牌进度(beat 切换处)
  const flip = beat === 0 ? interpolate(frame, [205, 218], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : beat === 1 ? interpolate(frame, [399, 412], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : interpolate(frame, [412, 425], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // 子集群在途负载(非回弹、到达前)
  const live = [0, 0];
  for (const r of REQS) if (!r.bounce && frame >= r.birth && frame < r.birth + TRAVEL) live[r.target]++;
  // glow
  const glow = [0, 0];
  for (const r of REQS) {
    if (r.bounce) continue;
    const arr = r.birth + TRAVEL;
    if (arr <= frame && frame - arr < 14) {
      const inten = 1 - (frame - arr) / 14;
      if (inten > glow[r.target]) glow[r.target] = inten;
    }
  }
  // 熔断:B 是否处于拒绝态
  let bRej = 0;
  for (const r of REQS) if (r.bounce && frame >= r.birth + TRAVEL * 0.3 && frame < r.birth + TRAVEL * 0.9) bRej = 1;

  const pol = POLICY[beat], hd = HEAD[beat];
  const wire = (a: {x: number; y: number}, b: {x: number; y: number}, col: string, on: boolean) => (
    <>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.line2} strokeWidth={3} />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={on ? 4 : 3} strokeDasharray="9 11" strokeDashoffset={-((frame % 26) / 26) * 20} opacity={on ? 0.5 : 0.25} strokeLinecap="round" />
    </>
  );

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}>
        <div style={{position: 'absolute', left: 60, top: 222, right: 60}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            换 DestinationRule · 即时切策略
          </div>
          <div style={{fontSize: 56, fontWeight: 850, marginTop: 10, letterSpacing: -1.5, color: hd.c, opacity: 1 - flip * 0.0}}>
            {hd.t}
          </div>
          <div style={{fontSize: 25, color: C.ink2, marginTop: 6, fontWeight: 600}}>{hd.d}</div>
        </div>

        {/* DR policy 翻牌 */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 1374, display: 'flex', justifyContent: 'center'}}>
          <div style={{fontFamily: 'ui-monospace,monospace', fontSize: 28, fontWeight: 800, color: C.ink, background: C.panel, border: `2px solid ${pol.c}66`, borderRadius: 16, padding: '14px 26px', boxShadow: `0 0 30px ${pol.c}22, ${C.shadow}`, transform: `rotateX(${flip < 1 ? flip * 180 : 0}deg)`, display: 'flex', gap: 12, alignItems: 'center'}}>
            <span style={{color: C.ink3}}>loadBalancer:</span>
            <span style={{color: pol.c, background: `${pol.c}1f`, border: `1px solid ${pol.c}66`, borderRadius: 9, padding: '3px 14px'}}>{pol.field}: {pol.val}</span>
          </div>
        </div>

        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          {wire(g.cliExit, g.f5In, C.violet, false)}
          {wire(g.f5Out, g.gwIn, C.violet, false)}
          {wire(g.gwOut, g.subEntry(0), PREFIX[0], live[0] > 0)}
          {wire(g.gwOut, g.subEntry(1), bRej ? C.rose : PREFIX[1], live[1] > 0 || bRej > 0)}
        </svg>

        <Node x={g.cli.x} y={g.cli.y} w={g.nodeW} h={92}>
          <div style={{fontSize: 27, fontWeight: 800}}>客户端 / Agent</div>
        </Node>
        <HAGhost g={g} frame={frame} />
        <Node x={g.gw.x} y={g.gw.y} w={g.gwW} h={120} glow={C.violet} glowI={0.6} border={C.violet + '66'}>
          <div style={{fontSize: 28, fontWeight: 850, color: C.violet}}>主集群 Higress · 主</div>
          <div style={{fontSize: 17, color: C.ink3, marginTop: 5}}>跨集群上游池 · 智能分发</div>
        </Node>

        {[0, 1].map((i) => {
          const col = PREFIX[i];
          const rej = i === 1 && bRej > 0;
          const frac = Math.min(1, live[i] / 6);
          return (
            <Node key={i} x={g.subs[i].x} y={g.subs[i].y} w={g.subW} h={g.subH} glow={rej ? C.rose : col} glowI={rej ? 0.8 : glow[i]} border={rej ? C.rose + 'cc' : glow[i] > 0.05 ? col + 'aa' : C.line2}>
              <div style={{fontSize: 28, fontWeight: 850}}>子集群 {i === 0 ? 'A' : 'B'}</div>
              <div style={{fontSize: 16, color: rej ? C.rose : C.ink3, marginTop: 4, fontWeight: rej ? 800 : 400}}>{rej ? '并发已满 · 503' : 'vLLM serving'}</div>
              {/* 在途负载条(最少请求/熔断的主视觉信号) */}
              <div style={{marginTop: 12, width: g.subW - 90, height: 16, background: C.track, borderRadius: 8, overflow: 'hidden', border: `1px solid ${rej ? C.rose : C.line}`}}>
                <div style={{height: '100%', width: `${frac * 100}%`, background: rej ? `linear-gradient(90deg,#e11d48,#ff5d7a)` : i === 0 ? C.fillCyan : C.fillGreen, borderRadius: 7}} />
              </div>
              <div style={{marginTop: 6, fontSize: 17, color: C.ink3, fontWeight: 700}}>在途 {live[i]}</div>
            </Node>
          );
        })}

        {/* 请求流(含会话颜色 / 回弹) */}
        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          {REQS.map((r) => {
            const age = frame - r.birth;
            if (age < 0 || age > TRAVEL + 4) return null;
            const p = Math.min(1, age / TRAVEL);
            const pos = pathPos(p, r.target, g, r.bounce);
            const fade = interpolate(p, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);
            const col = r.bounce ? C.rose : PREFIX[r.color];
            const jit = (random(`sj-${r.i}`) - 0.5) * 9;
            const showX = r.bounce && p > 0.45;
            return (
              <g key={r.i} opacity={fade}>
                <circle cx={pos.x + jit} cy={pos.y} r={17} fill={col} opacity={0.16} />
                <circle cx={pos.x + jit} cy={pos.y} r={10} fill={col} />
                {showX && <text x={pos.x + jit} y={pos.y - 16} fill={C.rose} fontSize={26} fontWeight={900} textAnchor="middle">✕</text>}
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </Bg>
  );
};
