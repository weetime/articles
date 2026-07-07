import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
import {Scene, Head, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
const DOMS = [
  {name: 'airline', ours: 81.5, v32: 63.8, lb: [50, 60]},
  {name: 'retail', ours: 85.7, v32: 81.1, lb: [60, 75]},
];

export const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [30, 96], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [110, 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const H = 560, base = 40;
  const y = (v: number) => (v / 100) * (H - base);

  const bar = (v: number, color: string, delay: number, label: string, glow = false) => {
    const g = interpolate(grow, [delay, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
        <div style={{fontFamily: MONO, fontSize: 32, fontWeight: 800, color, marginBottom: 10, opacity: g, textShadow: glow ? `0 0 20px ${color}66` : 'none'}}>{v}</div>
        <div style={{width: '64%', height: y(v) * g, background: color, borderRadius: '8px 8px 0 0', boxShadow: glow ? `0 0 26px ${color}44` : 'none'}} />
        <div style={{fontSize: 19, color: C.ink3, fontWeight: 600, marginTop: 14, textAlign: 'center'}}>{label}</div>
      </div>
    );
  };

  return (
    <Scene>
      <Head eyebrow="好不好?放进参照系"
        title={<>比上一代官方<span style={{color: C.cyan}}>更高</span></>} />
      <div style={{flex: 1, display: 'flex', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 56, width: '100%', height: H, alignItems: 'flex-end'}}>
          {DOMS.map((d) => (
            <div key={d.name} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.ink, marginBottom: 18}}>{d.name}</div>
              <div style={{position: 'relative', display: 'flex', gap: 18, width: '100%', height: H - 56, alignItems: 'flex-end'}}>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: y(d.lb[0]), height: y(d.lb[1]) - y(d.lb[0]),
                  background: `${C.off}22`, border: `1px dashed ${C.off}66`, borderRadius: 6, opacity: grow}} />
                {bar(d.ours, C.violet2, 0, '本评测', true)}
                {bar(d.v32, C.off, 0.1, 'DeepSeek-V3.2')}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display: 'flex', gap: 30, justifyContent: 'center'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: C.ink2, fontWeight: 600}}><span style={{width: 20, height: 20, borderRadius: 4, background: C.violet2}} />本评测 V4-Flash</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: C.ink2, fontWeight: 600}}><span style={{width: 20, height: 20, borderRadius: 4, background: C.off}} />上一代 DeepSeek-V3.2</span>
      </div>
      <div style={{fontSize: 25, color: C.ink2, marginTop: 20, fontWeight: 600, textAlign: 'center', opacity: note}}>
        虚线框 = 公开榜典型区间,我们都在<b style={{color: C.cyan}}>它之上</b>
      </div>
    </Scene>
  );
};
