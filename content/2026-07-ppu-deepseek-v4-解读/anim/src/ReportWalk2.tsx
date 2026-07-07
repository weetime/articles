import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';

// 沉浸式走查:报告长图当连续背景;讲到每处 → 压暗报告 + 浮起「动效解说卡」(替代静态气泡),高亮点仍亮聚焦。
// 图: public/report-tall-w.png  (1080 × 5021)
const IMG_W = 1080, IMG_H = 5021, FW = 1080, FH = 1920;
const ease = Easing.inOut(Easing.cubic);
const eo = Easing.out(Easing.cubic);

type Beat = {
  id: string; dur: number; cy: number; s: number;
  hl: {x: number; y: number; w: number; h: number} | null;
  color: string; tag: string; title: string; sub: string;
};
const BEATS: Beat[] = [
  {id: 'purpose', dur: 352, cy: 957,  s: 1.02, hl: {x: 61, y: 926, w: 958, h: 63},   color: '#6f9bd8', tag: '目的',         title: '给定 SLO,有没有优化空间?', sub: '厂商推荐的基线参数稳妥;探索定向优化与取舍'},
  {id: 'method',  dur: 354, cy: 1305, s: 1.02, hl: {x: 61, y: 1224, w: 958, h: 162}, color: '#6f9bd8', tag: '方法 · 控制变量', title: '只调一个参数',            sub: '固定显存/并行,只扫并发上限 32→128;两类负载各测'},
  {id: 'sweet',   dur: 269, cy: 1875, s: 1.06, hl: {x: 672, y: 1705, w: 122, h: 380}, color: '#2e7d5b', tag: '结果 · 甜点',   title: '并发 96 · 823 tok/s · +45%', sub: '峰值吞吐随并发上限上升'},
  {id: 'wall',    dur: 272, cy: 1875, s: 1.06, hl: {x: 833, y: 1690, w: 120, h: 395}, color: '#c1443c', tag: '结果 · KV cache', title: '128 → KV 100% · 仅 +2%', sub: 'KV cache 决定吞吐上界'},
  {id: 'lowconc', dur: 307, cy: 3160, s: 1.04, hl: {x: 62, y: 3104, w: 956, h: 44},  color: '#b7791f', tag: '归因 · 低并发', title: '同并发反而更慢 568→340',  sub: 'cuda-graph 固定开销;按真实并发选'},
  {id: 'agent',   dur: 369, cy: 3641, s: 1.06, hl: {x: 78, y: 3495, w: 474, h: 340}, color: '#c1443c', tag: '结果 · Agent',  title: '首字 108 秒 · 过载 2–7×',  sub: 'prefill 受限;需 PD 分离或加卡'},
  {id: 'context', dur: 314, cy: 4175, s: 1.03, hl: {x: 61, y: 4144, w: 958, h: 63},  color: '#6f9bd8', tag: '归因 · 上下文', title: '模型 1M,但 8K 拒 24%',    sub: '受限于 KV 显存,非模型能力'},
  {id: 'reco',    dur: 334, cy: 4372, s: 1.03, hl: {x: 62, y: 4300, w: 956, h: 144}, color: '#2e7d5b', tag: '结论 · 分场景', title: '每个场景对应一套参数', sub: '高吞吐 96 · 延迟敏感默认 32 · Agent 走架构'},
  {id: 'limit',   dur: 282, cy: 4477, s: 1.03, hl: {x: 61, y: 4456, w: 958, h: 42},  color: '#6f9bd8', tag: '局限(诚实)', title: '部分单次 · 共享环境', sub: '方向可靠,精确值需多次复现'},
  {id: 'cta',     dur: 259, cy: 4780, s: 1.02, hl: null,                              color: '#6f9bd8', tag: '用数据决策', title: '16 卡?PD 分离?换 decoder?', sub: '用实测数据决策 · 完整报告见下方图文'},
];
const START: number[] = [];
{ let f = 0; for (const b of BEATS) { START.push(f); f += b.dur; } }
const TOTAL = START[START.length - 1] + BEATS[BEATS.length - 1].dur;

const A = (hex: string, aa: string) => hex + aa;
const G = '#37a86e', R = '#e05a4f', Am = '#d69a2e', B = '#7fb0e8';
// 数字滚动 / 出现
const cu = (lf: number, d0: number, d1: number, a: number, b: number) =>
  Math.round(interpolate(lf, [d0, d1], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo}));
const app = (lf: number, d0: number, d1: number) =>
  interpolate(lf, [d0, d1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
// 过冲弹入 0→1.1→1(炸裂用):当 scale + opacity=min(1,val)
const pop = (lf: number, d0: number, d1: number) =>
  interpolate(lf, [d0, d0 + (d1 - d0) * 0.55, d1], [0, 1.12, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
// 落地冲击缩放 1→1.14→1
const punch = (lf: number, c: number) =>
  interpolate(lf, [c - 8, c, c + 12], [1, 1.16, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
const glow = (c: string, r: number) => `0 0 ${r}px ${c}`;

// —— 每拍的动效数据可视化(浮在解说卡里)——
const Viz: React.FC<{b: Beat; lf: number}> = ({b, lf}) => {
  const tnum = {fontVariantNumeric: 'tabular-nums' as const};
  if (b.id === 'method') {
    const opts = [32, 48, 64, 96, 128];
    return (
      <div style={{display: 'flex', gap: 12, marginTop: 14}}>
        {opts.map((v, i) => {
          const on = app(lf, 18 + i * 9, 34 + i * 9);
          return <span key={v} style={{padding: '8px 18px', borderRadius: 12, fontSize: 33, fontWeight: 800, ...tnum,
            color: `rgba(255,255,255,${0.32 + 0.68 * on})`, background: `rgba(127,176,232,${0.10 + 0.28 * on})`,
            border: `1px solid rgba(127,176,232,${0.25 + 0.55 * on})`}}>{v}</span>;
        })}
      </div>
    );
  }
  if (b.id === 'sweet') {
    const n = cu(lf, 16, 62, 568, 823);
    const bw = interpolate(lf, [16, 62], [38, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
    const bd = pop(lf, 54, 74);
    const pn = punch(lf, 64);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 12}}>
        <div style={{fontSize: 84, fontWeight: 900, color: G, letterSpacing: -2, ...tnum, transform: `scale(${pn})`, transformOrigin: 'left center', textShadow: glow(A(G, 'aa'), 30)}}>{n}<span style={{fontSize: 27, color: '#9fb0c2', fontWeight: 700}}> tok/s</span></div>
        <div style={{transform: `scale(${Math.min(bd, 1.12)})`, opacity: Math.min(bd, 1)}}><span style={{padding: '7px 16px', borderRadius: 999, fontSize: 27, fontWeight: 850, color: '#fff', background: G, boxShadow: glow(A(G, '99'), 22)}}>+45%</span></div>
        <div style={{flex: 1, height: 12, background: '#ffffff22', borderRadius: 6, overflow: 'hidden'}}><div style={{height: '100%', width: `${bw}%`, background: G, borderRadius: 6, boxShadow: glow(A(G, 'cc'), 12)}} /></div>
      </div>
    );
  }
  if (b.id === 'wall') {
    const fill = interpolate(lf, [16, 56], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
    const bd = app(lf, 52, 70);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 14}}>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, fontWeight: 700, color: '#c2c9d6', marginBottom: 7}}><span>KV cache 使用率</span><span style={{color: R, ...tnum}}>{Math.round(fill)}%</span></div>
          <div style={{height: 18, background: '#ffffff1c', borderRadius: 9, overflow: 'hidden'}}><div style={{height: '100%', width: `${fill}%`, background: `linear-gradient(90deg,${Am},${R})`, borderRadius: 9}} /></div>
        </div>
        <div style={{transform: `scale(${bd})`, opacity: bd}}><span style={{padding: '7px 15px', borderRadius: 999, fontSize: 24, fontWeight: 800, color: '#fff', background: R}}>吞吐仅 +2%</span></div>
      </div>
    );
  }
  if (b.id === 'lowconc') {
    const vals = [568, 496, 340], cols = [Am, R, R], mrr = [32, 64, 96], maxh = 116;
    return (
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 46, marginTop: 16, height: maxh + 48}}>
        {vals.map((v, i) => {
          const h = app(lf, 18 + i * 11, 48 + i * 11) * (v / 568) * maxh;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
              <div style={{fontSize: 30, fontWeight: 800, color: cols[i], ...tnum}}>{v}</div>
              <div style={{width: 104, height: h, background: cols[i], borderRadius: '8px 8px 0 0', marginTop: 6, boxShadow: glow(A(cols[i], '77'), 14)}} />
              <div style={{fontSize: 21, color: '#8b98a8', marginTop: 6}}>mrr {mrr[i]}</div>
            </div>
          );
        })}
        <div style={{fontSize: 52, fontWeight: 900, color: R, marginLeft: 10, alignSelf: 'center', textShadow: glow(A(R, '99'), 20)}}>↓</div>
      </div>
    );
  }
  if (b.id === 'agent') {
    const n = cu(lf, 16, 56, 6, 108);
    const bd = pop(lf, 52, 72);
    const pn = punch(lf, 58);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 12}}>
        <div style={{fontSize: 86, fontWeight: 900, color: R, letterSpacing: -2, ...tnum, transform: `scale(${pn})`, transformOrigin: 'left center', textShadow: glow(A(R, 'aa'), 32)}}>{n}<span style={{fontSize: 30, color: '#9fb0c2', fontWeight: 700}}> 秒</span></div>
        <div style={{fontSize: 24, color: '#9fb0c2', fontWeight: 700}}>首字延迟</div>
        <div style={{transform: `scale(${Math.min(bd, 1.12)})`, opacity: Math.min(bd, 1), marginLeft: 'auto'}}><span style={{padding: '7px 16px', borderRadius: 999, fontSize: 26, fontWeight: 850, color: '#fff', background: R, boxShadow: glow(A(R, '99'), 24)}}>过载 2–7×</span></div>
      </div>
    );
  }
  if (b.id === 'context') {
    const a1 = app(lf, 16, 34), a2 = app(lf, 34, 54);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, fontSize: 30, fontWeight: 800}}>
        <span style={{opacity: a1, padding: '8px 18px', borderRadius: 12, color: R, background: '#e05a4f22', border: `1px solid ${R}88`}}>8K · 拒 24%</span>
        <span style={{opacity: a2, fontSize: 34, color: '#9fb0c2'}}>→</span>
        <span style={{opacity: a2, padding: '8px 18px', borderRadius: 12, color: G, background: '#37a86e22', border: `1px solid ${G}88`}}>64K · 不额外占 KV ✓</span>
      </div>
    );
  }
  if (b.id === 'reco') {
    const chips = [['高吞吐', 'mrr 96', G], ['延迟敏感', '默认 32', B], ['Agent', 'PD 分离 · 架构', Am]] as const;
    return (
      <div style={{display: 'flex', gap: 14, marginTop: 14}}>
        {chips.map((c, i) => {
          const on = app(lf, 18 + i * 12, 40 + i * 12);
          return (
            <div key={i} style={{flex: 1, opacity: on, transform: `translateY(${(1 - on) * 16}px)`, background: '#ffffff10', border: `1px solid ${c[2]}66`, borderTop: `4px solid ${c[2]}`, borderRadius: 14, padding: '14px 16px'}}>
              <div style={{fontSize: 22, fontWeight: 800, color: c[2]}}>{c[0]}</div>
              <div style={{fontSize: 25, fontWeight: 800, color: '#fff', marginTop: 4, fontVariantNumeric: 'tabular-nums'}}>{c[1]}</div>
            </div>
          );
        })}
      </div>
    );
  }
  if (b.id === 'cta') {
    const opts = ['16 卡?', 'PD 分离?', '换 decoder?'];
    return (
      <div style={{display: 'flex', gap: 14, marginTop: 14}}>
        {opts.map((v, i) => {
          const on = app(lf, 16 + i * 10, 36 + i * 10);
          return <span key={v} style={{opacity: on, transform: `scale(${0.9 + 0.1 * on})`, padding: '11px 22px', borderRadius: 14, fontSize: 29, fontWeight: 800, color: '#fff', background: '#7fb0e820', border: `1px solid ${B}77`}}>{v}</span>;
        })}
      </div>
    );
  }
  return null; // purpose / limit:仅文字
};

const Highlighter: React.FC<{b: Beat; start: number}> = ({b, start}) => {
  const f = useCurrentFrame();
  if (!b.hl) return null;
  const end = start + b.dur;
  const wipe = interpolate(f, [start + 14, start + 34], [0, b.hl.w], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const o = interpolate(f, [start + 10, start + 22, end - 14, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  const pulse = 0.5 + 0.5 * Math.sin((f - start) * 0.24); // 脉冲辉光
  return (
    <div style={{position: 'absolute', left: b.hl.x, top: b.hl.y, width: wipe, height: b.hl.h, opacity: o,
      background: A(b.color, '30'), border: `3px solid ${b.color}`, borderRadius: 8, overflow: 'hidden',
      boxShadow: `0 0 ${30 + 22 * pulse}px ${A(b.color, 'cc')}, 0 0 0 ${5 + 3 * pulse}px ${A(b.color, '2a')}`}}>
      <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 5, background: b.color}} />
    </div>
  );
};

const BeatFlash: React.FC = () => {
  const f = useCurrentFrame();
  let idx = 0;
  for (let i = 0; i < BEATS.length; i++) if (f >= START[i]) idx = i;
  const b = BEATS[idx], start = START[idx];
  const o = interpolate(f, [start + 38, start + 46, start + 64], [0, 0.16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: `radial-gradient(60% 44% at 50% 78%, ${b.color}, transparent 70%)`, opacity: o, mixBlendMode: 'screen'}} />;
};

const Scrim: React.FC = () => {
  const f = useCurrentFrame();
  let idx = 0;
  for (let i = 0; i < BEATS.length; i++) if (f >= START[i]) idx = i;
  const b = BEATS[idx], start = START[idx], end = start + b.dur;
  const o = interpolate(f, [start + 28, start + 50, end - 16, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * 0.5;
  return <AbsoluteFill style={{background: '#0a0e14', opacity: o}} />;
};

const AnnoCard: React.FC = () => {
  const f = useCurrentFrame();
  let idx = 0;
  for (let i = 0; i < BEATS.length; i++) if (f >= START[i]) idx = i;
  const b = BEATS[idx], start = START[idx], end = start + b.dur, lf = f - start;
  const o = interpolate(f, [start + 12, start + 26, end - 12, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ty = interpolate(lf, [10, 28], [40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const sc = interpolate(lf, [10, 24, 32], [0.9, 1.025, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <div style={{position: 'absolute', left: 46, right: 46, bottom: 350, opacity: o, transform: `translateY(${ty}px) scale(${sc})`, transformOrigin: '50% 100%'}}>
      <div style={{background: 'rgba(11,14,20,0.96)', border: `1px solid ${A(b.color, '77')}`, borderLeft: `8px solid ${b.color}`,
        borderRadius: 26, padding: '46px 46px 48px', boxShadow: `0 26px 72px rgba(0,0,0,0.58), 0 0 52px ${A(b.color, '38')}`}}>
        <div style={{fontSize: 27, fontWeight: 800, color: b.color, letterSpacing: 1}}>{b.tag}</div>
        <div style={{fontSize: 55, fontWeight: 850, color: '#fff', marginTop: 18, lineHeight: 1.22, letterSpacing: -1}}>{b.title}</div>
        <div style={{marginTop: 10}}><Viz b={b} lf={lf} /></div>
        <div style={{fontSize: 28, fontWeight: 500, color: '#c2c9d6', marginTop: 28}}>{b.sub}</div>
      </div>
    </div>
  );
};

export const ReportWalk2: React.FC = () => {
  const f = useCurrentFrame();
  const cf: number[] = [], cy: number[] = [], cs: number[] = [];
  BEATS.forEach((b, i) => {
    if (i === 0) { cf.push(0); cy.push(b.cy); cs.push(b.s); }
    else {
      cf.push(START[i]); cy.push(BEATS[i - 1].cy); cs.push(BEATS[i - 1].s);
      cf.push(START[i] + 40); cy.push(b.cy); cs.push(b.s);
    }
  });
  cf.push(TOTAL); cy.push(BEATS[BEATS.length - 1].cy); cs.push(BEATS[BEATS.length - 1].s);
  const s = interpolate(f, cf, cs, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const ccy = interpolate(f, cf, cy, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  // 聚焦放大:镜头到位后,在讲解停留期朝高亮中心再推进一档,讲完退回
  let bi = 0;
  for (let i = 0; i < BEATS.length; i++) if (f >= START[i]) bi = i;
  const cb = BEATS[bi], cs0 = START[bi], ce0 = cs0 + cb.dur;
  const fz = interpolate(f, [cs0 + 46, cs0 + 70, ce0 - 18, ce0], [1, 1.16, 1.16, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const S = s * fz;
  const kf = (fz - 1) / 0.16; // 聚焦进度 0..1
  const hcx = cb.hl ? cb.hl.x + cb.hl.w / 2 : IMG_W / 2;
  const hcy = cb.hl ? cb.hl.y + cb.hl.h / 2 : ccy;
  const cx = IMG_W / 2 + (hcx - IMG_W / 2) * kf * 0.55;
  const cyf = ccy + (hcy - ccy) * kf * 0.35;
  const tx = FW / 2 - cx * S;
  const ty = FH / 2 - cyf * S;
  const prog = interpolate(f, [0, TOTAL], [4, 100]);
  const T = `translate(${tx}px,${ty}px) scale(${S})`;
  return (
    <AbsoluteFill style={{background: '#ffffff', fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: IMG_W, height: IMG_H, transform: T, transformOrigin: '0 0'}}>
        <Img src={staticFile('report-tall-w.png')} style={{position: 'absolute', left: 0, top: 0, width: IMG_W, height: IMG_H}} />
      </div>
      <Scrim />
      <div style={{position: 'absolute', left: 0, top: 0, width: IMG_W, height: IMG_H, transform: T, transformOrigin: '0 0'}}>
        {BEATS.map((b, i) => <Highlighter key={b.id} b={b} start={START[i]} />)}
      </div>
      <BeatFlash />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 172, background: 'linear-gradient(#ffffffde,#ffffffb0 46%,transparent)'}} />
      <div style={{position: 'absolute', top: 150, left: 60, right: 60, height: 5, background: '#dfe3ea', borderRadius: 3}}>
        <div style={{height: '100%', width: `${prog}%`, background: '#6f9bd8', borderRadius: 3}} />
      </div>
      <div style={{position: 'absolute', top: 116, left: 60, fontSize: 22, fontWeight: 700, color: '#4d7cb5'}}>测试报告解读 · 走查</div>
      <AnnoCard />
    </AbsoluteFill>
  );
};
