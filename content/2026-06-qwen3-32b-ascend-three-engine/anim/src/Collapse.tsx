import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

const Diag: React.FC<{
  eng: string; engColor: string; accent: string; sym: string;
  bigNode: React.ReactNode; rootK: string; rootNum: React.ReactNode; why: React.ReactNode; delay: number;
}> = ({eng, engColor, accent, sym, bigNode, rootK, rootNum, why, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  const causeT = interpolate(frame, [delay + 26, delay + 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <div style={{flex: 1, background: C.panel, border: `2px solid ${C.line2}`, borderRadius: 24, padding: '26px 28px', boxShadow: C.shadow, opacity: s, transform: `translateY(${(1 - s) * 26}px)`, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 5, background: accent}} />
      <div style={{fontSize: 27, fontWeight: 850, color: engColor}}>{eng}</div>
      <div style={{fontSize: 18, color: C.ink3, fontWeight: 600, marginTop: 4}}>{sym}</div>
      <div style={{marginTop: 10}}>{bigNode}</div>
      <div style={{marginTop: 18, borderTop: `1px dashed ${C.line2}`, paddingTop: 16, opacity: causeT, transform: `translateY(${(1 - causeT) * 10}px)`}}>
        <div style={{fontSize: 16, fontWeight: 800, color: C.violet, letterSpacing: 0.5}}>{rootK}</div>
        <div style={{marginTop: 8}}>{rootNum}</div>
        <div style={{fontSize: 18, color: C.ink2, marginTop: 10, lineHeight: 1.5}}>{why}</div>
      </div>
    </div>
  );
};

type Lang = 'zh' | 'en';
const TXT = {
  zh: {eyebrow: '引擎内部归因 · Prometheus', t1: '两处性能拐点,', t2: '归因到引擎内部',
    sub: '客户端指标只反映结果,KV-cache 与调度排队深度才能定位根因。',
    mEng: 'MindIE · 首字延迟劣化', mSym: 'c128 TTFT p50', mUnit: 's', mof: ['是 vLLM(1.2s)的 ', '21 倍'],
    mRootK: '根因 · 调度排队', mQ: 'waiting 队列深度 · vLLM 仅 3',
    mWhy: ['请求积压在队列里进不了 batch。KV 仅 ', '51.9%', ',瓶颈在调度准入,不在显存。'],
    sEng: 'SGLang · 吞吐回退', sSym: 'c128 输出吞吐(vs c64)',
    sRootK: '根因 · 显存撞墙', sKv: 'KV-cache 峰值打满 · 均值 73.7%',
    sWhy: ['KV 打满后无法继续扩 batch,ITL 同时翻倍到 ', '202ms', '。'],
    hLab: 'vLLM · 仍有余量', hTxt: ['同档排队深度仅 ', '3.1', '、KV 均值 ', '44.6%', ' —— 连续批处理 + KV 分页仍有余量。'],
    foot: '根因归因'},
  en: {eyebrow: 'Engine-internal attribution · Prometheus', t1: 'Two inflection points, ', t2: 'traced inside the engine',
    sub: 'Client metrics show the result; KV-cache usage and queue depth locate the root cause.',
    mEng: 'MindIE · TTFT degradation', mSym: 'c128 TTFT p50', mUnit: 's', mof: ['', '21× of vLLM (1.2s)'],
    mRootK: 'Root cause · scheduling queue', mQ: 'waiting queue depth · vLLM only 3',
    mWhy: ['Requests stall in the queue. KV only ', '51.9%', ' — the bottleneck is admission, not memory.'],
    sEng: 'SGLang · throughput regression', sSym: 'c128 throughput (vs c64)',
    sRootK: 'Root cause · memory wall', sKv: 'KV-cache peak saturated · avg 73.7%',
    sWhy: ['Once KV is full, batches can’t grow; ITL doubles to ', '202ms', '.'],
    hLab: 'vLLM · headroom remains', hTxt: ['queue ', '3.1', ', KV avg ', '44.6%', ' — continuous batching + paged KV still have headroom.'],
    foot: 'root-cause attribution'},
};

export const Collapse: React.FC<{lang?: Lang}> = ({lang = 'zh'}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const S = TXT[lang];
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  // count-ups
  const ttft = interpolate(frame, [30, 64], [0, 25.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const queue = Math.round(interpolate(frame, [56, 80], [0, 34], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo}));
  const kv = Math.round(interpolate(frame, [44, 78], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo}));
  const hold = interpolate(frame, [104, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px 120px' : '220px 56px 500px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          {S.eyebrow}
        </div>
        <div style={{fontSize: land ? 50 : 56, fontWeight: 850, marginTop: 14, letterSpacing: -1.2}}>
          {S.t1}<span style={{color: C.violet}}>{S.t2}</span>
        </div>
        <div style={{fontSize: 21, color: C.ink3, fontWeight: 600, marginTop: 12, lineHeight: 1.45}}>
          {S.sub}
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20}}>
          <div style={{display: 'flex', gap: 20}}>
            <Diag
              eng={S.mEng} engColor={C.amber} accent={C.amber} sym={S.mSym}
              bigNode={<span style={{fontSize: 58, fontWeight: 850, color: C.amber, letterSpacing: -1}}>{ttft.toFixed(1)}<span style={{fontSize: 32}}>{S.mUnit}</span></span>}
              rootK={S.mRootK}
              rootNum={<span><span style={{fontSize: 42, fontWeight: 850, color: C.amber}}>{queue}</span><span style={{fontSize: 18, color: C.ink3, fontWeight: 600, marginLeft: 10}}>{S.mQ}</span></span>}
              why={<>{S.mWhy[0]}<b style={{color: C.ink}}>{S.mWhy[1]}</b>{S.mWhy[2]}</>}
              delay={20}
            />
            <Diag
              eng={S.sEng} engColor={C.ink2} accent={C.off} sym={S.sSym}
              bigNode={<span style={{fontSize: 54, fontWeight: 850, color: C.ink2, letterSpacing: -1}}>721<span style={{fontSize: 30, color: C.ink3}}> → </span>550</span>}
              rootK={S.sRootK}
              rootNum={<span><span style={{fontSize: 42, fontWeight: 850, color: C.ink2}}>{kv}%</span><span style={{fontSize: 18, color: C.ink3, fontWeight: 600, marginLeft: 10}}>{S.sKv}</span></span>}
              why={<>{S.sWhy[0]}<b style={{color: C.ink}}>{S.sWhy[1]}</b>{S.sWhy[2]}</>}
              delay={30}
            />
          </div>

          <div style={{background: `linear-gradient(100deg,${C.violet}1c,${C.cyan}14)`, border: `1px solid ${C.violet}44`, borderRadius: 20, padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 20, opacity: hold, transform: `translateY(${(1 - hold) * 12}px)`}}>
            <span style={{fontSize: 24, fontWeight: 850, color: C.violet, whiteSpace: 'nowrap'}}>{S.hLab}</span>
            <span style={{fontSize: 20, color: C.ink2, lineHeight: 1.45}}>{S.hTxt[0]}<b style={{color: C.ink}}>{S.hTxt[1]}</b>{S.hTxt[2]}<b style={{color: C.ink}}>{S.hTxt[3]}</b>{S.hTxt[4]}</span>
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
