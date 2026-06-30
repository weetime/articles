import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type Lang = 'zh' | 'en';
const TXT = {
  zh: {kicker: '结论', l1a: '这套昇腾栈上,', l1b: 'vLLM-Ascend', l2: '是唯一全场景默认推荐',
    cta: ['完整', '对齐参数', '与', '全量数据', '见公众号原文 · 扫码关注查看'],
    qrcap: ['扫码关注 · ', 'vLLM 生产工程'], brand: '面向私有化、多引擎推理的可观测与压测工具箱'},
  en: {kicker: 'Conclusion', l1a: 'On this Ascend stack, ', l1b: 'vLLM-Ascend', l2: 'is the only across-the-board default',
    cta: ['Full ', 'config', ' & ', 'complete data', 'in the description'],
    qrcap: ['ModelDoctor · ', 'mcpinfra.net'], brand: 'observability & load-testing for private, multi-engine inference'},
};

export const Outro: React.FC<{lang?: Lang}> = ({lang = 'zh'}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const S = TXT[lang];
  const l1 = interpolate(frame, [8, 34], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const l2 = interpolate(frame, [26, 52], [0, 1], {extrapolateRight: 'clamp', easing: eo});
  const line = interpolate(frame, [50, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const qr = spring({frame: frame - 84, fps, config: {damping: 200}});
  const brand = interpolate(frame, [100, 124], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <Bg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: land ? '0 80px' : '0 80px 330px'}}>
        <div style={{fontSize: 26, fontWeight: 700, color: C.violet, opacity: l1, marginBottom: 28}}>{S.kicker}</div>
        <div style={{fontSize: 54, fontWeight: 850, lineHeight: 1.26, textAlign: 'center', letterSpacing: -1, opacity: l1, transform: `translateY(${(1 - l1) * 24}px)`}}>
          {S.l1a}<span style={{color: C.violet}}>{S.l1b}</span>
        </div>
        <div style={{fontSize: 54, fontWeight: 850, lineHeight: 1.26, textAlign: 'center', letterSpacing: -1, marginTop: 6, opacity: l2, transform: `translateY(${(1 - l2) * 24}px)`}}>
          {S.l2}
        </div>

        <div style={{width: interpolate(line, [0, 1], [0, 440]), height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#8b6dff,#2bc4e6)', margin: '42px 0'}} />

        <div style={{fontSize: 28, color: C.ink2, fontWeight: 600, textAlign: 'center', opacity: line, lineHeight: 1.5}}>
          {S.cta[0]}<b style={{color: C.ink}}>{S.cta[1]}</b>{S.cta[2]}<b style={{color: C.ink}}>{S.cta[3]}</b><br />{S.cta[4]}
        </div>

        <div style={{marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: qr, transform: `scale(${0.85 + qr * 0.15})`}}>
          <div style={{padding: 16, background: '#fff', borderRadius: 24, border: `2px solid ${C.line2}`, boxShadow: '0 10px 30px #6d4bff1a'}}>
            <Img src={staticFile('qrcode.png')} style={{width: 240, height: 240, borderRadius: 12}} />
          </div>
          <div style={{marginTop: 22, fontSize: 26, fontWeight: 700, color: C.ink, opacity: brand}}>
            {S.qrcap[0]}<span style={{color: C.violet}}>{S.qrcap[1]}</span>
          </div>
        </div>

        <div style={{position: 'absolute', bottom: land ? 70 : 540, fontSize: 20, color: C.ink3, fontWeight: 600, opacity: brand}}>
          <b style={{color: C.ink}}>ModelDoctor</b> · {S.brand}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
