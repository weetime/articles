import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene, MONO} from './ui';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);
// 官方 agentic 基准(Max):Flash vs Pro,几乎打平
const B = [
  {k: 'SWE-Verified', f: 80.6, p: 80.6},
  {k: 'Terminal-Bench', f: 68.5, p: 67.9},
  {k: 'BrowseComp', f: 85.9, p: 83.4},
];

export const VsPro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eye = interpolate(frame, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const q = interpolate(frame, [12, 36], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const ans = spring({frame: frame - 44, fps, config: {damping: 12, stiffness: 120}});
  const grow = interpolate(frame, [70, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const note = interpolate(frame, [150, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const maxH = 250;

  return (
    <Scene>
      <div style={{fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.amber, letterSpacing: 1, opacity: eye}}>等一下……</div>
      <div style={{fontSize: 58, fontWeight: 800, marginTop: 16, opacity: q, lineHeight: 1.25}}>
        <span style={{color: C.ink2}}>「Flash」是</span><span style={{color: C.amber}}>阉割版</span><span style={{color: C.ink2}}>吗?</span>
      </div>
      <div style={{fontSize: 72, fontWeight: 850, letterSpacing: -2, marginTop: 12, opacity: ans, transform: `scale(${0.85 + ans * 0.15})`, transformOrigin: 'left center', color: C.green, textShadow: `0 0 26px ${C.green}55`}}>
        当然不是!
      </div>

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24}}>
        <div style={{textAlign: 'center', fontSize: 28, color: C.ink2, fontWeight: 600}}>官方基准上,和旗舰 <b style={{color: C.ink}}>Pro 几乎打平</b>:</div>
        <div style={{display: 'flex', gap: 44, height: maxH + 90, alignItems: 'flex-end', justifyContent: 'center', padding: '0 20px'}}>
          {B.map((b, i) => (
            <div key={b.k} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{display: 'flex', gap: 12, width: '100%', height: maxH, alignItems: 'flex-end', justifyContent: 'center'}}>
                {[['Flash', b.f, C.violet2], ['Pro', b.p, C.off]].map(([name, v, color]: any, j) => {
                  const g = interpolate(grow, [i * 0.12 + j * 0.04, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
                  return (
                    <div key={name} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 800, color, marginBottom: 8, opacity: g}}>{v}</div>
                      <div style={{width: '78%', height: (v / 100) * maxH * g, background: color, borderRadius: '6px 6px 0 0', boxShadow: name === 'Flash' ? `0 0 20px ${color}44` : 'none'}} />
                    </div>
                  );
                })}
              </div>
              <div style={{fontFamily: MONO, fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 16, textAlign: 'center'}}>{b.k}</div>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', gap: 34, justifyContent: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: C.ink2, fontWeight: 700}}><span style={{width: 20, height: 20, borderRadius: 5, background: C.violet2}} /> V4-Flash</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: C.ink2, fontWeight: 700}}><span style={{width: 20, height: 20, borderRadius: 5, background: C.off}} /> V4-Pro(旗舰)</span>
        </div>
      </div>

      <div style={{fontSize: 27, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: note}}>
        国产卡跑的,是<b style={{color: C.green}}>接近旗舰的强模型</b> · <span style={{fontFamily: MONO, fontSize: 22, color: C.ink3}}>官方数据</span>
      </div>
    </Scene>
  );
};
