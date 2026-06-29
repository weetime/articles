import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Pill: React.FC<{label: string; val: string; color: string; delay: number}> = ({label, val, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 140}});
  return (
    <div style={{flex: 1, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 18, padding: '20px 6px', textAlign: 'center', boxShadow: C.shadow, opacity: s, transform: `translateY(${(1 - s) * 22}px)`}}>
      <div style={{fontSize: 38, fontWeight: 850, color, letterSpacing: -1}}>{val}</div>
      <div style={{fontSize: 17, color: C.ink3, fontWeight: 600, marginTop: 6}}>{label}</div>
    </div>
  );
};

const Chip: React.FC<{children: React.ReactNode; delay: number}> = ({children, delay}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 9, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '13px 18px', fontSize: 19, fontWeight: 600, color: C.ink2, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, boxShadow: C.shadow}}>
      <span style={{width: 7, height: 7, borderRadius: 2, background: C.violet}} />
      {children}
    </div>
  );
};

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const t1 = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const t2 = interpolate(frame, [12, 30], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const oa = interpolate(frame, [40, 90], [0, 304.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const an = interpolate(frame, [48, 98], [0, 297.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const eq = interpolate(frame, [98, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const badge = interpolate(frame, [116, 134], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = frame > 116 ? 1 + 0.02 * Math.sin((frame - 116) / 16) : 1;

  const titleBlock = (
    <div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet, opacity: t1}}>
        <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
        ModelDoctor · 双协议兼容实测
      </div>
      <div style={{fontSize: land ? 66 : 74, fontWeight: 850, lineHeight: 1.06, letterSpacing: -2, marginTop: 20, opacity: t1, transform: `translateY(${(1 - t1) * 18}px)`}}>
        同一网关，承载两种协议
      </div>
      <div style={{fontSize: land ? 50 : 58, fontWeight: 850, letterSpacing: -1.5, marginTop: 8, opacity: t2, transform: `translateY(${(1 - t2) * 18}px)`, background: 'linear-gradient(100deg,#7d68ff,#2bc4e6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        转换零可测损耗
      </div>
    </div>
  );

  const statBlock = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 22, color: C.cyan, fontWeight: 700, marginBottom: 6}}>OpenAI</div>
          <div style={{fontSize: land ? 84 : 96, fontWeight: 850, color: C.cyan, letterSpacing: -3}}>{Math.round(oa)}<span style={{fontSize: 34}}>ms</span></div>
          <div style={{fontSize: 17, color: C.ink3, fontWeight: 600, marginTop: 4}}>/v1/chat/completions</div>
        </div>
        <div style={{fontSize: land ? 80 : 96, fontWeight: 850, color: C.green, opacity: eq, transform: `scale(${0.6 + eq * 0.4}) translateY(${eq * Math.sin(frame / 16) * 6}px)`}}>≈</div>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 22, color: C.violet, fontWeight: 700, marginBottom: 6}}>Anthropic</div>
          <div style={{fontSize: land ? 84 : 96, fontWeight: 850, color: C.violet, letterSpacing: -3, transform: `scale(${pulse})`}}>{Math.round(an)}<span style={{fontSize: 34}}>ms</span></div>
          <div style={{fontSize: 17, color: C.ink3, fontWeight: 600, marginTop: 4}}>/v1/messages</div>
        </div>
      </div>
      <span style={{marginTop: 26, fontSize: 27, fontWeight: 800, color: C.green, background: `${C.green}1f`, border: `1px solid ${C.green}55`, borderRadius: 999, padding: '11px 28px', opacity: badge, transform: `scale(${0.8 + badge * 0.2})`}}>
        TTFT P50 差 6.6 ms · 2.2% · 实质持平
      </span>
    </div>
  );

  const pillsRow = (
    <div style={{display: 'flex', gap: 13}}>
      <Pill label="总时延 P50 差" val="0.1%" color={C.green} delay={138} />
      <Pill label="客户接入改造" val="0 行" color={C.violet} delay={148} />
      <Pill label="调用成功率" val="100%" color={C.cyan} delay={158} />
      <Pill label="实测样本" val="80 次" color={C.ink2} delay={168} />
    </div>
  );

  const chipsRow = (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: land ? 'flex-start' : 'center'}}>
      <Chip delay={176}>后端 <b style={{color: C.ink}}>Qwen3-32B</b></Chip>
      <Chip delay={186}>Higress · <b style={{color: C.ink}}>ai-proxy 1.0.0</b></Chip>
      <Chip delay={196}><b style={{color: C.ink}}>Tukey 1.5·IQR</b> 滤波</Chip>
    </div>
  );

  if (land) {
    return (
      <Bg>
        <AbsoluteFill style={{padding: '90px 90px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 50}}>
            {titleBlock}
            {chipsRow}
          </div>
          <div style={{flex: 1.1, display: 'flex', flexDirection: 'column', gap: 56}}>
            {statBlock}
            {pillsRow}
          </div>
        </AbsoluteFill>
      </Bg>
    );
  }

  return (
    <Bg>
      <AbsoluteFill style={{padding: '220px 60px 510px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        {titleBlock}
        {statBlock}
        {pillsRow}
        {chipsRow}
      </AbsoluteFill>
    </Bg>
  );
};
