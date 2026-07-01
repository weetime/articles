import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {rv, Board} from './layer';

const CRs = [
  {n: '① ServiceEntry', role: '加权池 · 权重分配', c: C.cyan, lines: [['hosts: [ qwen-pool.internal ]', C.ink3], ['endpoints:', C.ink2], ['  - { address: <主集群网关>, weight: 30 }', C.cyan], ['  - { address: <子集群网关>, weight: 70 }', C.green]]},
  {n: '② DestinationRule', role: 'outlier · 故障转移', c: C.rose, lines: [['trafficPolicy:', C.ink2], ['  loadBalancer: { simple: ROUND_ROBIN }', C.ink3], ['  outlierDetection:', C.rose], ['    consecutiveErrors: 3 → 摘除 · 探活回填', C.rose]]},
  {n: '③ Ingress', role: 'HA 入口 + 破环', c: C.amber, lines: [['match: model == Qwen-demo', C.ink3], ['model-mapper: Qwen-demo → Qwen-test', C.amber], ['# 回环腿只命中本地别名 · 不死循环', C.ink4]]},
];

export const Impl: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const PAD = 50, W = 980;

  const measure = [
    {t: '正常', v: '30 / 70', c: C.green, d: 100},
    {t: '子集群挂', v: '100 / 0', c: C.rose, d: 116},
    {t: '恢复回填', v: '~30 / 70', c: C.green, d: 132},
  ];

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}><Board land={land}>
        <div style={{position: 'absolute', left: PAD, top: 222}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 23, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            落地 · 已实测
          </div>
          <div style={{fontSize: 52, fontWeight: 850, marginTop: 10, letterSpacing: -1.5}}>三个 CR · <span style={{color: C.green}}>零 EnvoyFilter</span></div>
        </div>

        {CRs.map((cr, i) => {
          const top = 350 + i * 196;
          const o = rv(frame, 16 + i * 18);
          return (
            <div key={cr.n} style={{position: 'absolute', left: PAD, top, width: W, background: '#0c1118', border: `2px solid ${cr.c}66`, borderRadius: 16, padding: '16px 22px', boxShadow: `0 0 22px ${cr.c}1f, ${C.shadow}`, opacity: o, transform: `translateX(${(1 - o) * 40}px)`}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <span style={{fontSize: 24, fontWeight: 850, color: cr.c}}>{cr.n}</span>
                <span style={{fontSize: 17, color: C.ink3, fontWeight: 700}}>{cr.role}</span>
              </div>
              <div style={{marginTop: 10, fontFamily: 'ui-monospace,monospace', fontSize: 17.5, lineHeight: 1.65}}>
                {cr.lines.map((ln, k) => <div key={k} style={{color: ln[1] as string, opacity: rv(frame, 22 + i * 18 + k * 2)}}>{ln[0]}</div>)}
              </div>
            </div>
          );
        })}

        {/* 实测 */}
        <div style={{position: 'absolute', left: PAD, top: 968, width: W, opacity: rv(frame, 94)}}>
          <div style={{fontSize: 22, fontWeight: 800, color: C.ink2, marginBottom: 12}}>实测 · 主集群 + 子集群 · 真实 vLLM</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            {measure.map((m, i) => {
              const o = rv(frame, m.d);
              return (
                <React.Fragment key={m.t}>
                  <div style={{flex: 1, background: `linear-gradient(180deg,${m.c}1c,${C.panel})`, border: `2px solid ${m.c}77`, borderRadius: 14, padding: '16px 8px', textAlign: 'center', opacity: o, transform: `scale(${0.9 + o * 0.1})`}}>
                    <div style={{fontSize: 17, color: C.ink3, fontWeight: 700}}>{m.t}</div>
                    <div style={{fontSize: 34, fontWeight: 850, color: m.c, marginTop: 4, letterSpacing: -1}}>{m.v}</div>
                  </div>
                  {i < 2 && <span style={{fontSize: 26, fontWeight: 900, color: C.ink4, opacity: rv(frame, m.d + 6)}}>→</span>}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{fontSize: 17, color: C.ink3, fontWeight: 600, marginTop: 12, textAlign: 'center', opacity: rv(frame, 146)}}>
            outlier 自动摘除 / 探活回填 · 全程 0 死循环
          </div>
        </div>

        <div style={{position: 'absolute', left: PAD, right: PAD, top: 1212, textAlign: 'center', fontSize: 20, fontWeight: 600, color: C.ink3, opacity: rv(frame, 156)}}>
          装 Istio CRD(含 v1)+ 重启 higress-controller · <span style={{color: C.ink2}}>enableIstioAPI 默认开</span>
        </div>
      </Board></AbsoluteFill>
    </Bg>
  );
};
