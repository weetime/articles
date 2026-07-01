import React from 'react';
import {Easing, interpolate} from 'remotion';
import {C} from './theme';

// 共享:多集群拓扑几何 + 请求流(客户端 → F5 → 主集群网关 → 子集群 A/B)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeIO = Easing.bezier(0.45, 0, 0.55, 1);

export type Pt = {x: number; y: number};
export type Geo = {
  land: boolean;
  cli: Pt; f5: Pt; gw: Pt; subs: Pt[];
  nodeW: number; nodeH: number; subW: number; subH: number; gwW: number; gwH: number;
  cliExit: Pt; f5In: Pt; f5Out: Pt; gwIn: Pt; gwOut: Pt;
  subEntry: (i: number) => Pt;
};

export function makeGeo(width: number, height: number): Geo {
  const land = width > height;
  if (land) {
    const cy = 540;
    const cli = {x: 250, y: cy}, f5 = {x: 620, y: cy}, gw = {x: 1010, y: cy};
    const subs = [{x: 1560, y: 360}, {x: 1560, y: 720}];
    const nodeW = 300, nodeH = 120, subW = 340, subH = 150, gwW = 320, gwH = 150;
    return {
      land, cli, f5, gw, subs, nodeW, nodeH, subW, subH, gwW, gwH,
      cliExit: {x: cli.x + nodeW / 2, y: cy},
      f5In: {x: f5.x - 130, y: cy}, f5Out: {x: f5.x + 130, y: cy},
      gwIn: {x: gw.x - gwW / 2, y: cy}, gwOut: {x: gw.x + gwW / 2, y: cy},
      subEntry: (i) => ({x: subs[i].x - subW / 2, y: subs[i].y}),
    };
  }
  const cli = {x: 540, y: 432}, f5 = {x: 540, y: 668}, gw = {x: 540, y: 916};
  const subs = [{x: 320, y: 1258}, {x: 760, y: 1258}];
  const nodeW = 440, nodeH = 120, subW = 380, subH = 168, gwW = 470, gwH = 150;
  return {
    land: false, cli, f5, gw, subs, nodeW, nodeH, subW, subH, gwW, gwH,
    cliExit: {x: 540, y: cli.y + nodeH / 2},
    f5In: {x: 540, y: f5.y - 56}, f5Out: {x: 540, y: f5.y + 56},
    gwIn: {x: 540, y: gw.y - gwH / 2}, gwOut: {x: 540, y: gw.y + gwH / 2},
    subEntry: (i) => ({x: subs[i].x, y: subs[i].y - subH / 2}),
  };
}

// 请求沿路径的位置:客户端 → F5 → 主集群网关 → 子集群[target]。bounce=true 时熔断,回弹不到达。
export function pathPos(p: number, target: number, g: Geo, bounce = false): Pt {
  // 三段:cli→f5 (0-0.28), f5→gw (0.28-0.52), gw→sub (0.52-1)
  if (p < 0.28) {
    const t = easeIO(p / 0.28);
    return {x: lerp(g.cliExit.x, g.f5In.x, t), y: lerp(g.cliExit.y, g.f5In.y, t)};
  }
  if (p < 0.52) {
    const t = easeIO((p - 0.28) / 0.24);
    return {x: lerp(g.f5Out.x, g.gwIn.x, t), y: lerp(g.f5Out.y, g.gwIn.y, t)};
  }
  const t = (p - 0.52) / 0.48;
  const pe = g.subEntry(target);
  if (bounce) {
    // 去到一半被拒,回弹到网关出口
    const bt = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
    const e = easeIO(bt) * 0.55;
    return {x: lerp(g.gwOut.x, pe.x, e), y: lerp(g.gwOut.y, pe.y, e)};
  }
  const e = easeIO(t);
  return {x: lerp(g.gwOut.x, pe.x, e), y: lerp(g.gwOut.y, pe.y, e)};
}

export const Node: React.FC<{
  x: number; y: number; w: number; h: number; children: React.ReactNode;
  glow?: string; glowI?: number; border?: string; dead?: number;
}> = ({x, y, w, h, children, glow, glowI = 0, border, dead = 0}) => (
  <div style={{
    position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h,
    borderRadius: 22, background: C.panel,
    border: `2px solid ${border ?? C.line2}`,
    boxShadow: glow && glowI > 0 ? `0 0 ${36 * glowI}px ${glow}${Math.round(glowI * 130 + 30).toString(16).padStart(2, '0')}, ${C.shadow}` : C.shadow,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    filter: dead > 0 ? `grayscale(${dead}) brightness(${1 - dead * 0.35})` : undefined,
    opacity: 1 - dead * 0.25,
  }}>
    {children}
  </div>
);

// 子集群在途负载条
export const LoadBar: React.FC<{frac: number; color: string; w: number}> = ({frac, color, w}) => (
  <div style={{marginTop: 12, width: w, height: 14, background: C.track, borderRadius: 7, overflow: 'hidden', border: `1px solid ${C.line}`}}>
    <div style={{height: '100%', width: `${interpolate(frac, [0, 1], [0, 100])}%`, background: color, borderRadius: 6}} />
  </div>
);

// 主备 HA:主集群节点后方的热备幽灵卡 + 同步脉冲(体现主备冗余)
export const HAGhost: React.FC<{g: Geo; frame: number; color?: string}> = ({g, frame, color = C.violet}) => {
  const pulse = 0.4 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 16));
  return (
    <>
      {/* 热备幽灵卡:向右下偏移,露出一角 */}
      <div style={{position: 'absolute', left: g.gw.x - g.gwW / 2 + 20, top: g.gw.y - g.gwH / 2 + 20, width: g.gwW, height: g.gwH, borderRadius: 22, background: C.panel, border: `2px dashed ${C.ink4}`, opacity: 0.5}} />
      <div style={{position: 'absolute', left: g.gw.x + g.gwW / 2 - 6, top: g.gw.y + g.gwH / 2 - 4, fontSize: 15, fontWeight: 800, color: C.ink3, background: C.panel, border: `1px dashed ${C.ink4}`, borderRadius: 8, padding: '3px 10px'}}>备 standby</div>
      {/* 同步脉冲徽标 */}
      <div style={{position: 'absolute', left: g.gw.x - 84, top: g.gw.y - g.gwH / 2 - 30, fontSize: 15, fontWeight: 800, color, background: `${color}1f`, border: `1px solid ${color}66`, borderRadius: 999, padding: '4px 12px', opacity: pulse}}>主备 HA ⇄ 永远在线</div>
    </>
  );
};
