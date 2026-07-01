import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';
import {Panel, Down, rv, Board} from './layer';

// 方案四 · 去中心:每集群全量 + 全套 Higress,F5 直连就近,策略下沉
export const Decentral: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const PAD = 50, W = 980, CX = 540;
  const regions = ['华东', '华北', '华南'];

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro}}><Board land={land}>
        <div style={{position: 'absolute', left: PAD, top: 222, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{fontSize: 18, fontWeight: 850, color: '#0c0c18', background: C.rose, borderRadius: 7, padding: '5px 14px'}}>方案四</span>
          <span style={{fontSize: 38, fontWeight: 850, letterSpacing: -1}}>去中心</span>
          <span style={{fontSize: 19, color: C.ink3, fontWeight: 600}}>跨地域全量</span>
        </div>

        <Panel frame={frame} delay={14} left={PAD} top={296} width={W} color={C.rose}
          title={<span style={{color: C.rose}}>客户端 → F5 直连就近</span>} sub="各集群上报健康 / 容量 · 无中心路由跳" />

        {/* 三向分发 */}
        <div style={{position: 'absolute', left: 0, top: 404, width: 1080, height: 70, opacity: rv(frame, 30)}}>
          {[0, 1, 2].map((i) => {
            const tx = PAD + 155 + i * 310;
            return <div key={i} style={{position: 'absolute', left: CX, top: 6, width: 3, height: 56, background: `linear-gradient(${C.rose},${C.rose}44)`, transformOrigin: 'top', transform: `rotate(${(i - 1) * 26}deg)`}} />;
          })}
          <div style={{position: 'absolute', left: CX - 90, top: 30, fontSize: 17, fontWeight: 700, color: C.rose, opacity: rv(frame, 38)}}>↓ ↓ ↓ 就近落地</div>
        </div>

        {/* 三个对等全量集群 */}
        {regions.map((r, i) => {
          const bw = 308, gap = 16, x = PAD + i * (bw + gap);
          const o = rv(frame, 40 + i * 8);
          return (
            <div key={r} style={{position: 'absolute', left: x, top: 486, width: bw, minHeight: 200, background: `linear-gradient(180deg,${C.rose}16,${C.panel})`, border: `2px solid ${C.rose}77`, borderRadius: 18, padding: '18px 18px', boxShadow: `0 0 22px ${C.rose}22, ${C.shadow}`, opacity: o, transform: `translateY(${(1 - o) * 18}px)`}}>
              <div style={{fontSize: 16, fontWeight: 700, color: C.rose}}>地域 · {r}</div>
              <div style={{fontSize: 25, fontWeight: 850, marginTop: 6}}>集群 {String.fromCharCode(65 + i)}</div>
              <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7}}>
                {['全量模型', '全套 Higress', '策略下沉 · 自治'].map((t, k) => (
                  <div key={t} style={{fontSize: 15, fontWeight: 700, color: C.ink2, background: C.track, border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 10px', textAlign: 'center', opacity: rv(frame, 46 + i * 8 + k * 3)}}>{t}</div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 集群间互转兜底 */}
        <div style={{position: 'absolute', left: PAD, top: 710, width: W, textAlign: 'center', fontSize: 18, fontWeight: 700, color: C.ink3, opacity: rv(frame, 80)}}>
          ⇄ 集群间仅本地异常 / 溢出时作兜底互转
        </div>

        {/* 取舍 */}
        <div style={{position: 'absolute', left: PAD, top: 770, width: W, display: 'flex', gap: 16, opacity: rv(frame, 90)}}>
          {[
            {t: '最低延迟', d: '就近本地直接服务', c: C.green},
            {t: '任一独立可用', d: '无中心单点', c: C.cyan},
            {t: '代价:全量复制', d: '存储 / 一致性成本最高', c: C.rose},
          ].map((b) => (
            <div key={b.t} style={{flex: 1, background: C.panel, border: `2px solid ${b.c}55`, borderRadius: 14, padding: '16px 16px', boxShadow: C.shadow}}>
              <div style={{fontSize: 21, fontWeight: 850, color: b.c}}>{b.t}</div>
              <div style={{fontSize: 15, color: C.ink3, marginTop: 6, fontWeight: 600}}>{b.d}</div>
            </div>
          ))}
        </div>

        <div style={{position: 'absolute', left: PAD, right: PAD, top: 980, textAlign: 'center', fontSize: 23, fontWeight: 700, color: C.ink2, opacity: rv(frame, 104)}}>
          多地域就近 + 全量容灾 · <span style={{color: C.rose}}>ai-route 策略全在各集群</span>
        </div>
      </Board></AbsoluteFill>
    </Bg>
  );
};
