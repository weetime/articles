import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Layer: React.FC<{title: string; sub: string; val: number; color: string; delay: number; verdict: string}> =
({title, sub, val, color, delay, verdict}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [delay, delay + 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const badge = spring({frame: frame - (delay + 40), fps, config: {damping: 200}});
  const w = val * t;
  return (
    <div style={{background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 22, padding: '26px 30px', boxShadow: C.shadow}}>
      <div style={{display: 'flex', alignItems: 'baseline'}}>
        <div style={{fontSize: 30, fontWeight: 800, color: C.ink}}>{title}</div>
        <div style={{marginLeft: 'auto', fontSize: 24, fontWeight: 850, color, opacity: badge, padding: '5px 16px', borderRadius: 999, background: `${color}1f`, border: `1px solid ${color}55`}}>{verdict}</div>
      </div>
      <div style={{fontSize: 21, color: C.ink3, fontWeight: 600, marginTop: 4}}>{sub}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 16}}>
        <div style={{flex: 1, height: 34, background: C.track, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.line}`}}>
          <div style={{height: '100%', width: `${w}%`, background: `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 11}} />
        </div>
        <div style={{fontSize: 44, fontWeight: 850, color, letterSpacing: -1, width: 130, textAlign: 'right'}}>{w.toFixed(0)}%</div>
      </div>
    </div>
  );
};

export const TalkVsDo: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const head = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const cntO = interpolate(frame, [120, 144], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{padding: land ? '70px 90px 120px' : '224px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: head}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
            <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
            实测 · 失分结构
          </div>
          <div style={{fontSize: land ? 54 : 62, fontWeight: 850, marginTop: 12, letterSpacing: -1.5}}>
            会说话 ≠ 会办事
          </div>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
          <Layer title="自然语言层" sub="核身份 · 讲政策 · 报「已处理」" val={93.9} color={C.green} delay={16} verdict="近乎全过" />
          <Layer title="后端数据库层" sub="工具参数 / 写入实体是否正确" val={51.5} color={C.rose} delay={40} verdict="大面积挂" />
        </div>

        <div style={{opacity: cntO, display: 'flex', flexDirection: 'column', gap: 10}}>
          <div style={{display: 'flex', gap: 12}}>
            <div style={{flex: 1, background: `${C.rose}12`, border: `1px solid ${C.rose}44`, borderRadius: 14, padding: '16px 18px', textAlign: 'center'}}>
              <div style={{fontSize: 34, fontWeight: 850, color: C.rose}}>87 / 103</div>
              <div style={{fontSize: 19, fontWeight: 600, color: C.ink3, marginTop: 4}}>airline 失败:沟通过·DB 挂</div>
            </div>
            <div style={{flex: 1, background: `${C.rose}12`, border: `1px solid ${C.rose}44`, borderRadius: 14, padding: '16px 18px', textAlign: 'center'}}>
              <div style={{fontSize: 34, fontWeight: 850, color: C.rose}}>110 / 110</div>
              <div style={{fontSize: 19, fontWeight: 600, color: C.ink3, marginTop: 4}}>retail 失败:全过语言检查</div>
            </div>
          </div>
          <div style={{fontSize: 24, fontWeight: 800, color: C.ink2, textAlign: 'center'}}>
            只看沟通 / 只用 LLM 判分 → <span style={{color: C.rose}}>严重高估模型</span>
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
