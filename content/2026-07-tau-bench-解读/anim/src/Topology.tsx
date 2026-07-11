import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, random} from 'remotion';
import {Bg} from './Bg';
import {C, PREFIX} from './theme';

const TRAVEL = 48;
const OFF_START = 30;
const OFF_END = 175;
const TR_END = 240;
const ON_RAMP_END = 410;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIO = Easing.bezier(0.45, 0, 0.55, 1);

type Req = {i: number; birth: number; color: number; target: number; on: boolean};
const REQS: Req[] = [];
for (let i = 0; i < 110; i++) {
  const birth = OFF_START + i * 5;
  if (birth > 485) break;
  if (birth >= OFF_END && birth < TR_END) continue;
  const on = birth >= TR_END;
  const color = i % 4;
  const target = on ? color : Math.floor(random(`off-${i}`) * 4);
  REQS.push({i, birth, color, target, on});
}

type Pt = {x: number; y: number};
type Geo = {
  cli: Pt; gw: Pt; gwW: number; gwH: number; cliW: number; cliH: number;
  podW: number; podH: number;
  cliExit: Pt; gwIn: Pt; gwOut: Pt;
  pod: (i: number) => Pt; podEntry: (i: number) => Pt;
};

function pathPos(p: number, target: number, g: Geo) {
  if (p < 0.42) {
    const t = easeIO(p / 0.42);
    return {x: lerp(g.cliExit.x, g.gwIn.x, t), y: lerp(g.cliExit.y, g.gwIn.y, t)};
  }
  if (p < 0.52) {
    const t = (p - 0.42) / 0.1;
    return {x: lerp(g.gwIn.x, g.gwOut.x, t), y: lerp(g.gwIn.y, g.gwOut.y, t)};
  }
  const t = easeIO((p - 0.52) / 0.48);
  const pe = g.podEntry(target);
  return {x: lerp(g.gwOut.x, pe.x, t), y: lerp(g.gwOut.y, pe.y, t)};
}

const Node: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; glow?: string; glowI?: number; border?: string}> = ({x, y, w, h, children, glow, glowI = 0, border}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 20, background: C.panel, border: `2px solid ${border ?? C.line2}`, boxShadow: glow && glowI > 0 ? `0 0 ${34 * glowI}px ${glow}${Math.round(glowI * 130 + 30).toString(16).padStart(2, '0')}, ${C.shadow}` : C.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
    {children}
  </div>
);

export const Topology: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});
  const isOn = frame >= TR_END;

  let g: Geo;
  if (land) {
    const podW = 250, podH = 124, cliW = 320, cliH = 100, gwW = 320, gwH = 110;
    const podYs = [190, 350, 510, 670];
    const podCx = 1580;
    const cy = 430;
    g = {
      cli: {x: 300, y: cy}, gw: {x: 900, y: cy}, gwW, gwH, cliW, cliH, podW, podH,
      cliExit: {x: 300 + cliW / 2, y: cy},
      gwIn: {x: 900 - gwW / 2, y: cy},
      gwOut: {x: 900 + gwW / 2, y: cy},
      pod: (i) => ({x: podCx, y: podYs[i]}),
      podEntry: (i) => ({x: podCx - podW / 2, y: podYs[i]}),
    };
  } else {
    const podXs = [210, 430, 650, 870], podY = 1010, podW = 188, podH = 162;
    const gwW = 400, gwH = 116, cliW = 420, cliH = 104;
    g = {
      cli: {x: 540, y: 400}, gw: {x: 540, y: 660}, gwW, gwH, cliW, cliH, podW, podH,
      cliExit: {x: 540, y: 452},
      gwIn: {x: 540, y: 602},
      gwOut: {x: 540, y: 718},
      pod: (i) => ({x: podXs[i], y: podY}),
      podEntry: (i) => ({x: podXs[i], y: podY - podH / 2}),
    };
  }

  const meter = interpolate(frame, [0, OFF_END, TR_END, ON_RAMP_END], [0.21, 0.22, 0.225, 0.654], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const podGlow = [0, 1, 2, 3].map((pod) => {
    let gg = 0, on = false;
    for (const r of REQS) {
      if (r.target !== pod) continue;
      const arr = r.birth + TRAVEL;
      if (arr <= frame && frame - arr < 16) {
        const inten = 1 - (frame - arr) / 16;
        if (inten > gg) {gg = inten; on = r.on;}
      }
    }
    return {g: gg, on};
  });

  const trSweep = interpolate(frame, [OFF_END + 4, TR_END - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const trAlpha = interpolate(frame, [OFF_END, OFF_END + 14, TR_END - 14, TR_END], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const meterStyle: React.CSSProperties = land
    ? {position: 'absolute', left: 80, right: 80, bottom: 150}
    : {position: 'absolute', left: 60, right: 60, top: 1150};

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}>
        <div style={{position: 'absolute', left: land ? 80 : 60, top: land ? 60 : 220}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            机制拆解 · 流量路由
          </div>
          <div style={{fontSize: land ? 50 : 60, fontWeight: 800, marginTop: 12, letterSpacing: -1}}>
            相同前缀 <span style={{color: isOn ? C.green : C.off}}>{isOn ? '→ 命中同一个 Pod' : '被随机打散'}</span>
          </div>
        </div>

        <div style={{position: 'absolute', right: land ? 80 : 60, top: land ? 64 : 232, padding: '12px 22px', borderRadius: 999, fontSize: 22, fontWeight: 800, fontFamily: 'ui-monospace,monospace', color: isOn ? C.violet : C.ink3, background: isOn ? `${C.violet}22` : C.panel, border: `2px solid ${isOn ? C.violet + '66' : C.line2}`}}>
          lb_policy: {isOn ? 'prefix_cache' : 'round_robin'}
        </div>

        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={g.cliExit.x} y1={g.cliExit.y} x2={g.gwIn.x} y2={g.gwIn.y} stroke={C.line2} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => {
            const active = isOn && podGlow[i].g > 0.05;
            const pe = g.podEntry(i);
            return <line key={i} x1={g.gwOut.x} y1={g.gwOut.y} x2={pe.x} y2={pe.y} stroke={active ? PREFIX[i] : C.line2} strokeWidth={active ? 5 : 3} opacity={active ? 0.45 + podGlow[i].g * 0.4 : 0.5} />;
          })}
        </svg>

        <Node x={g.cli.x} y={g.cli.y} w={g.cliW} h={g.cliH}>
          <div style={{fontSize: 28, fontWeight: 800}}>客户端 / Agent</div>
          <div style={{fontSize: 18, color: C.ink3, marginTop: 6}}>大量请求 · 共享长前缀</div>
        </Node>

        <Node x={g.gw.x} y={g.gw.y} w={g.gwW} h={g.gwH} glow={C.violet} glowI={isOn ? 0.85 : 0} border={isOn ? C.violet + '66' : C.line2}>
          <div style={{fontSize: 28, fontWeight: 800}}>Higress 网关</div>
          <div style={{fontSize: 18, color: isOn ? C.violet : C.ink3, marginTop: 6, fontWeight: 700}}>{isOn ? 'KV 感知 · 最长前缀匹配' : 'cache-blind · 轮询打散'}</div>
        </Node>

        {[0, 1, 2, 3].map((i) => {
          const {g: gg, on} = podGlow[i];
          const pc = g.pod(i);
          const glowColor = on ? C.green : C.off;
          const border = gg > 0.05 ? (on ? C.green + '88' : C.off + '88') : C.line2;
          return (
            <Node key={i} x={pc.x} y={pc.y} w={g.podW} h={g.podH} glow={glowColor} glowI={gg} border={border}>
              <div style={{fontSize: 28, fontWeight: 800}}>P{i + 1}</div>
              <div style={{fontSize: 15, color: C.ink3, marginTop: 4}}>vLLM · APC</div>
              <div style={{marginTop: 10, fontSize: 17, fontWeight: 800, padding: '5px 12px', borderRadius: 9, color: gg > 0.05 ? (on ? C.green : C.ink3) : C.ink4, background: gg > 0.05 ? (on ? `${C.green}22` : `${C.off}22`) : 'transparent', opacity: gg > 0.05 ? 0.5 + gg * 0.5 : 0.45}}>
                {gg > 0.05 ? (on ? '✓ KV 命中' : '✗ 重算 prefill') : on ? '命中' : '空闲'}
              </div>
            </Node>
          );
        })}

        <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
          {REQS.map((r) => {
            const age = frame - r.birth;
            if (age < 0 || age > TRAVEL + 4) return null;
            const p = Math.min(1, age / TRAVEL);
            const pos = pathPos(p, r.target, g);
            const fade = interpolate(p, [0, 0.06, 0.9, 1], [0, 1, 1, 0]);
            const col = PREFIX[r.color];
            return (
              <g key={r.i} opacity={fade}>
                <circle cx={pos.x} cy={pos.y} r={20} fill={col} opacity={0.18} />
                <circle cx={pos.x} cy={pos.y} r={11} fill={col} />
              </g>
            );
          })}
        </svg>

        <div style={{...meterStyle, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 22, padding: '28px 34px', boxShadow: C.shadow}}>
          <div style={{display: 'flex', alignItems: 'baseline'}}>
            <div style={{fontSize: 24, fontWeight: 700, color: C.ink2}}>前缀缓存命中率</div>
            <div style={{marginLeft: 'auto', fontSize: 68, fontWeight: 850, letterSpacing: -2, color: isOn ? C.violet : C.off}}>{Math.round(meter * 100)}%</div>
          </div>
          <div style={{marginTop: 16, height: 34, background: C.track, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.line}`}}>
            <div style={{height: '100%', width: `${meter * 100}%`, borderRadius: 11, background: isOn ? C.fillViolet : C.fillOff}} />
          </div>
          <div style={{marginTop: 12, fontSize: 19, color: C.ink3, fontWeight: 600}}>
            {isOn ? '同前缀稳定命中 → 跳过重复 prefill' : '相同前缀被打散 → 每个 Pod 各自重算'}
          </div>
        </div>

        {trAlpha > 0.01 && (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: trAlpha}}>
            <div style={{background: 'linear-gradient(100deg,#6d4bff,#0891b2)', color: '#fff', fontSize: 46, fontWeight: 850, padding: '28px 54px', borderRadius: 22, boxShadow: '0 20px 60px #6d4bff55', transform: `translateX(${interpolate(trSweep, [0, 1], [-40, 40])}px)`}}>
              切到 prefix_cache → KV 感知
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </Bg>
  );
};
