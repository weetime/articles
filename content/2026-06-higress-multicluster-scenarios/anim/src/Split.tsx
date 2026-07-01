import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {Panel, Down, rv, Board} from './layer';

// 方案二 · 管控算力分离:主集群纯路由,子集群跑模型(跨集群加权 + outlier)
export const Split: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const PAD = 50, W = 980, CX = 540;

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}><Board land={land}>
        <div style={{position: 'absolute', left: PAD, top: 222, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{fontSize: 18, fontWeight: 850, color: '#0c0c18', background: C.green, borderRadius: 7, padding: '5px 14px'}}>方案二</span>
          <span style={{fontSize: 38, fontWeight: 850, letterSpacing: -1}}>管控算力分离</span>
          <span style={{fontSize: 17, fontWeight: 800, color: '#0c0c18', background: C.green2, borderRadius: 999, padding: '4px 13px'}}>★ 推荐</span>
        </div>

        <Panel frame={frame} delay={14} left={PAD} top={284} width={W} color={C.amber}
          title={<span style={{color: C.amber}}>客户端 → F5 GSLB</span>} sub="就近 / 健康 LB 到主集群 · active-active 多站点" />
        <Down frame={frame} delay={28} x={CX} y={372} h={26} />

        {/* 主集群:纯路由 + 主备HA + 插件链 + 上游池 */}
        <div style={{position: 'absolute', left: PAD, top: 400, width: W, background: `linear-gradient(180deg,${C.green}1c,${C.panel})`, border: `2px solid ${C.green}88`, borderRadius: 20, padding: '20px 24px', boxShadow: `0 0 28px ${C.green}33, ${C.shadow}`, opacity: rv(frame, 32), transform: `translateY(${(1 - rv(frame, 32)) * 22}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{fontSize: 30, fontWeight: 850, color: C.green}}>主集群 Higress · 纯路由</span>
            <span style={{marginLeft: 'auto', fontSize: 16, fontWeight: 800, color: C.cyan, background: `${C.cyan}1f`, border: `1px solid ${C.cyan}66`, borderRadius: 999, padding: '4px 12px', opacity: rv(frame, 40)}}>不 serving</span>
          </div>
          {/* 主备 HA */}
          <div style={{display: 'flex', gap: 12, marginTop: 14, opacity: rv(frame, 44)}}>
            {[{t: '主 primary', d: 'active · 收 F5 流量', c: C.green}, {t: '备 standby', d: 'hot standby · 主挂即接', c: C.ink3}].map((h) => (
              <div key={h.t} style={{flex: 1, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 12, padding: '12px 16px'}}>
                <div style={{fontSize: 20, fontWeight: 800}}>{h.t}</div>
                <div style={{fontSize: 15, color: C.ink3, marginTop: 3}}>{h.d}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize: 16, color: C.ink3, marginTop: 12, fontWeight: 600, opacity: rv(frame, 50)}}>⇄ 主备同步:CR 配置 + 共享 Redis 运行态 · 切换不丢配置/缓存</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, opacity: rv(frame, 56)}}>
            {['治理插件链(只跑一次)', '跨集群上游池 SE + DR'].map((c) => (
              <span key={c} style={{fontSize: 16, fontWeight: 700, color: C.ink2, background: C.track, border: `1px solid ${C.line}`, borderRadius: 8, padding: '6px 12px'}}>{c}</span>
            ))}
          </div>
        </div>
        <Down frame={frame} delay={70} x={CX} y={668} h={34} color={C.green} label="加权 / 健康 / 会话分发" />

        {/* 子集群 A / B */}
        {[0, 1].map((i) => {
          const bw = 470, x = PAD + i * (bw + 40);
          const o = rv(frame, 76 + i * 8);
          const col = i === 0 ? C.cyan : C.green;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: 716, width: bw, minHeight: 150, background: C.panel, border: `2px solid ${col}66`, borderRadius: 18, padding: '18px 22px', boxShadow: `0 0 22px ${col}1f, ${C.shadow}`, opacity: o, transform: `translateY(${(1 - o) * 18}px)`}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
                <span style={{fontSize: 28, fontWeight: 850}}>子集群 {i === 0 ? 'A' : 'B'}</span>
                <span style={{marginLeft: 'auto', fontSize: 26, fontWeight: 850, color: col}}>w {i === 0 ? 30 : 70}</span>
              </div>
              <div style={{fontSize: 16, color: C.ink3, marginTop: 6, fontWeight: 600}}>higress · vLLM serving · 多副本 ×N</div>
              <div style={{marginTop: 12, fontSize: 15, color: C.ink2, background: C.track, borderRadius: 9, padding: '9px 12px', lineHeight: 1.4}}>内部 = 方案一全栈<br />ai-route → provider → PD → KV</div>
            </div>
          );
        })}
        <Down frame={frame} delay={92} x={CX} y={1014} h={24} color={C.amber} />

        {/* 配置示例:SE 权重 + DR outlier */}
        <div style={{position: 'absolute', left: PAD, top: 1042, width: W, background: '#0c1118', border: `2px solid ${C.amber}55`, borderRadius: 16, padding: '18px 22px', fontFamily: 'ui-monospace,monospace', boxShadow: C.shadow, opacity: rv(frame, 96)}}>
          <div style={{fontSize: 16, color: C.amber, fontWeight: 800, marginBottom: 10, fontFamily: 'inherit'}}>实现 · 零 EnvoyFilter</div>
          <div style={{fontSize: 18, color: C.ink2, lineHeight: 1.7}}>
            <span style={{color: C.cyan}}>ServiceEntry</span>  endpoints: [ <span style={{color: C.cyan}}>w30</span>, <span style={{color: C.green}}>w70</span> ]   <span style={{color: C.ink4}}># 权重分配</span><br />
            <span style={{color: C.rose}}>DestinationRule</span>  outlierDetection: {'{ 连续失败→摘除 }'}   <span style={{color: C.ink4}}># 故障转移</span>
          </div>
        </div>

        <div style={{position: 'absolute', left: PAD, right: PAD, top: 1356, textAlign: 'center', fontSize: 22, fontWeight: 700, color: C.ink3, opacity: rv(frame, 110)}}>
          主集群不 serving → <span style={{color: C.green}}>无回环 · 无需破环</span>
        </div>
      </Board></AbsoluteFill>
    </Bg>
  );
};
