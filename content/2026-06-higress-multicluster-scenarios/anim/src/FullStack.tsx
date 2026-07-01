import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {Panel, Down, rv, Board} from './layer';

// 方案一 · 单集群:治理 + serving 同体,完整能力栈逐层揭示
export const FullStack: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const PAD = 50, W = 980, CX = 540;

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}><Board land={land}>
        <div style={{position: 'absolute', left: PAD, top: 222, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{fontSize: 18, fontWeight: 850, color: '#0c0c18', background: C.violet, borderRadius: 7, padding: '5px 14px'}}>方案一</span>
          <span style={{fontSize: 38, fontWeight: 850, letterSpacing: -1}}>单集群 · <span style={{color: C.violet}}>全栈架构</span></span>
          <span style={{fontSize: 19, color: C.ink3, fontWeight: 600}}>管控 + 算力同体</span>
        </div>

        {/* L1 客户端 */}
        <Panel frame={frame} delay={14} left={PAD} top={288} width={W} color={C.violet}
          title="客户端 / Agent" sub="OpenAI · Anthropic 双协议 · api-key → consumer(个人 / 组织 / 租户三级归属)" />
        <Down frame={frame} delay={26} x={CX} y={392} h={28} />

        {/* L2 Higress 治理+serving + 插件链 */}
        <Panel frame={frame} delay={30} left={PAD} top={424} width={W} color={C.violet} accent
          title="主集群 Higress · 治理 + serving 一体"
          sub="ai-route 匹配 model · 治理插件全挂在它上面"
          chips={['ai-proxy 协议', 'key-auth 认证', 'ai-route-auth 鉴权', 'ai-quota 配额', 'rate-limit 限流', 'ai-statistics 计费']} />
        <Down frame={frame} delay={62} x={CX} y={600} h={28} color={C.green} label="路由到 ai-provider" />

        {/* L3 ai-provider */}
        <Panel frame={frame} delay={66} left={PAD} top={632} width={W} color={C.green}
          title={<span style={{color: C.green}}>ai-provider · 本地 LLM 服务来源</span>}
          sub="本地 vLLM · headless 直连 pod · 上游经 ai-LB + EPP 选 pod" />
        <Down frame={frame} delay={80} x={CX} y={740} h={26} color={C.cyan} />

        {/* L4 ai-LB + EPP */}
        <Panel frame={frame} delay={84} left={PAD} top={768} width={W} color={C.cyan} mono
          title={<span style={{fontSize: 23}}>ai-LB( prefix_cache / global_least_request ) + EPP</span>}
          sub="prefix-cache-scorer + load 打分 · 选 pod / 副本" />
        <Down frame={frame} delay={98} x={CX} y={870} h={24} label="InferencePool · 后端形态三选一" />

        {/* L5 后端形态三选一 */}
        {[
          {t: '单卡多 pod', d: 'MIG / 时分', c: C.amber},
          {t: '单机多卡 · TP', d: '整机张量并行', c: C.cyan},
          {t: 'LWS 多机 · TP+PP', d: '一副本跨节点', c: C.rose},
        ].map((b, i) => {
          const bw = 308, gap = 16, x = PAD + i * (bw + gap);
          const o = rv(frame, 102 + i * 8);
          return (
            <div key={i} style={{position: 'absolute', left: x, top: 898, width: bw, minHeight: 130, background: C.panel, border: `2px solid ${b.c}66`, borderRadius: 16, padding: '16px 18px', boxShadow: C.shadow, opacity: o, transform: `translateY(${(1 - o) * 18}px)`}}>
              <div style={{fontSize: 24, fontWeight: 850, color: b.c}}>{b.t}</div>
              <div style={{fontSize: 16, color: C.ink3, marginTop: 6, fontWeight: 600}}>{b.d}</div>
              <div style={{display: 'flex', gap: 6, marginTop: 12}}>
                {[0, 1, 2].map((k) => <span key={k} style={{flex: 1, height: 30, borderRadius: 7, background: C.track, border: `1px solid ${b.c}55`}} />)}
              </div>
            </div>
          );
        })}
        <Down frame={frame} delay={128} x={CX} y={1044} h={26} color={C.green} />

        {/* L6 PD 分离 */}
        <Panel frame={frame} delay={132} left={PAD} top={1072} width={W} color={C.green} mono
          title={<span style={{fontSize: 22, color: C.green}}>PD 分离 xPyD · Prefill 池 → KV·NIXL/RDMA → Decode 池</span>}
          sub="引擎 vLLM / SGLang · 两池独立扩缩" />
        <Down frame={frame} delay={146} x={CX} y={1168} h={24} color={C.rose} />

        {/* L7 分层 KV */}
        <div style={{position: 'absolute', left: PAD, top: 1196, width: W, opacity: rv(frame, 150)}}>
          <div style={{fontSize: 22, fontWeight: 850, color: C.rose, marginBottom: 10}}>分层 KV-Cache</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            {['HBM 每副本', 'LMCache Host', 'Mooncake 前缀池'].map((t, i) => (
              <React.Fragment key={t}>
                <div style={{flex: 1, textAlign: 'center', fontSize: 19, fontWeight: 800, color: C.ink2, background: C.panel, border: `2px solid ${C.rose}55`, borderRadius: 14, padding: '16px 8px', boxShadow: C.shadow, opacity: rv(frame, 152 + i * 6)}}>{t}</div>
                {i < 2 && <span style={{color: C.amber, fontSize: 26, fontWeight: 900, opacity: rv(frame, 155 + i * 6)}}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{position: 'absolute', left: PAD, right: PAD, top: 1356, textAlign: 'center', fontSize: 22, fontWeight: 700, color: C.ink3, opacity: rv(frame, 168)}}>
          无跨集群 · 无回环 · 所有方案的地基
        </div>
      </Board></AbsoluteFill>
    </Bg>
  );
};
