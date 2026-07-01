import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {Panel, Down, rv, Board} from './layer';

// 方案三 · 管控算力一体:主集群既路由又自己跑模型(回环 + 破环)
export const Unified: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const PAD = 50, W = 980, CX = 540;
  const loop = rv(frame, 96); // 回环腿动画

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}><Board land={land}>
        <div style={{position: 'absolute', left: PAD, top: 222, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{fontSize: 18, fontWeight: 850, color: '#0c0c18', background: C.amber, borderRadius: 7, padding: '5px 14px'}}>方案三</span>
          <span style={{fontSize: 38, fontWeight: 850, letterSpacing: -1}}>管控算力一体</span>
          <span style={{fontSize: 19, color: C.ink3, fontWeight: 600}}>算力复用</span>
        </div>

        <Panel frame={frame} delay={14} left={PAD} top={290} width={W} color={C.amber}
          title={<span style={{color: C.amber}}>客户端 → F5 GSLB</span>} sub="进主集群" />
        <Down frame={frame} delay={28} x={CX} y={378} h={26} />

        <Panel frame={frame} delay={32} left={PAD} top={406} width={W} color={C.amber} accent
          title="主集群 Higress · 路由 + 算力(回环)"
          sub="跨集群上游池端点【包含主集群自身】→ 请求回环打回本地 ai-provider"
          chips={['治理插件链', '跨集群上游池 SE + DR', '本地 serving']} />
        <Down frame={frame} delay={66} x={CX} y={600} h={30} color={C.amber} label="分发(含回环腿)" />

        {/* 回环腿(主集群自身) + 子集群 */}
        {[
          {t: '主集群自身', d: '回环 serving · w30', c: C.amber, loopback: true},
          {t: '子集群', d: 'higress serving · w70', c: C.green, loopback: false},
        ].map((b, i) => {
          const bw = 470, x = PAD + i * (bw + 40);
          const o = rv(frame, 72 + i * 8);
          return (
            <div key={i} style={{position: 'absolute', left: x, top: 638, width: bw, minHeight: 150, background: b.loopback ? `linear-gradient(180deg,${b.c}1c,${C.panel})` : C.panel, border: `2px solid ${b.c}88`, borderRadius: 18, padding: '18px 22px', boxShadow: `0 0 22px ${b.c}22, ${C.shadow}`, opacity: o, transform: `translateY(${(1 - o) * 18}px)`}}>
              <div style={{fontSize: 27, fontWeight: 850, color: b.loopback ? b.c : C.ink}}>{b.t}</div>
              <div style={{fontSize: 16, color: C.ink3, marginTop: 6, fontWeight: 600}}>{b.d}</div>
              {b.loopback && (
                <div style={{marginTop: 12, fontSize: 16, fontWeight: 800, color: b.c, background: `${b.c}1f`, border: `1px solid ${b.c}66`, borderRadius: 9, padding: '8px 12px', opacity: loop}}>
                  ↺ model 改写破环 · 治理再过一遍
                </div>
              )}
            </div>
          );
        })}

        {/* 破环说明 */}
        <div style={{position: 'absolute', left: PAD, top: 838, width: W, background: '#0c1118', border: `2px solid ${C.amber}55`, borderRadius: 16, padding: '18px 22px', fontFamily: 'ui-monospace,monospace', boxShadow: C.shadow, opacity: rv(frame, 104)}}>
          <div style={{fontSize: 16, color: C.amber, fontWeight: 800, marginBottom: 10, fontFamily: 'inherit'}}>破环 · 入口匹配名 ≠ 本地别名匹配名</div>
          <div style={{fontSize: 18, color: C.ink2, lineHeight: 1.7}}>
            入口匹配 <span style={{color: C.cyan}}>Qwen-demo</span> → model-mapper 改成 <span style={{color: C.green}}>Qwen-test</span><br />
            回环腿带 <span style={{color: C.green}}>Qwen-test</span> 只命中本地别名 → <span style={{color: C.green}}>不死循环</span>
          </div>
        </div>

        <div style={{position: 'absolute', left: PAD, right: PAD, top: 1010, textAlign: 'center', fontSize: 23, fontWeight: 700, color: C.ink2, opacity: rv(frame, 118)}}>
          省一组子集群 · 复用主集群算力
        </div>
        <div style={{position: 'absolute', left: PAD, right: PAD, top: 1052, textAlign: 'center', fontSize: 20, fontWeight: 600, color: C.ink3, opacity: rv(frame, 126)}}>
          代价:<span style={{color: C.amber}}>破环 + 双重治理</span> 的复杂度
        </div>
      </Board></AbsoluteFill>
    </Bg>
  );
};
