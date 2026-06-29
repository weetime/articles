import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

type Row = {h: string; d: string};
const YES: Row[] = [
  {h: '文本 / 对话类 LLM', d: 'Qwen · DeepSeek · Llama 等兼容后端'},
  {h: '视觉输入多模态 LLM', d: 'image block ↔ image_url 双向映射'},
  {h: '工具调用 / 推理模型', d: 'tool_use ↔ tool_calls · thinking ↔ reasoning'},
];
const NO: Row[] = [
  {h: '文本嵌入 / 重排序', d: '输出为向量,schema 无对应字段'},
  {h: '图像生成 / 扩散模型', d: '输出为图像而非 token 流'},
  {h: '语音(TTS / ASR)· 视频', d: '转换器无 audio / video 分支'},
];

const Item: React.FC<{r: Row; color: string; delay: number}> = ({r, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 130}});
  return (
    <div style={{marginTop: 18, opacity: s, transform: `translateX(${(1 - s) * 18}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{color, fontSize: 22, fontWeight: 900}}>{color === C.green ? '✓' : '✗'}</span>
        <span style={{fontSize: 26, fontWeight: 800, color: C.ink}}>{r.h}</span>
      </div>
      <div style={{fontSize: 19, color: C.ink3, fontWeight: 600, marginTop: 5, paddingLeft: 32, lineHeight: 1.4}}>{r.d}</div>
    </div>
  );
};

const Col: React.FC<{title: string; rows: Row[]; color: string; bg: string; border: string; base: number}> = ({title, rows, color, bg, border, base}) => (
  <div style={{flex: 1, background: bg, border: `2px solid ${border}`, borderRadius: 24, padding: '26px 26px', boxShadow: C.shadow}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 27, fontWeight: 850, color, paddingBottom: 14, borderBottom: `1px solid ${C.line}`}}>
      <span style={{width: 34, height: 34, borderRadius: 9, background: color, color: '#0a0d14', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 900}}>{color === C.green ? '✓' : '✗'}</span>
      {title}
    </div>
    {rows.map((r, i) => (<Item key={i} r={r} color={color} delay={base + i * 12} />))}
  </div>
);

export const ModelFit: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});
  const note = interpolate(frame, [150, 178], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: land ? '70px 90px' : '220px 50px 510px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet}}>
          <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
          转换适用范围 · 按模型类型
        </div>
        <div style={{fontSize: land ? 50 : 56, fontWeight: 850, marginTop: 12, letterSpacing: -1}}>
          哪些模型可经 <span style={{color: C.violet}}>Anthropic 协议</span>接入
        </div>
        <div style={{fontSize: 21, color: C.ink3, marginTop: 12, lineHeight: 1.5}}>
          转换仅在两种协议存在结构等价表示时成立。Messages 仅建模文本、图像、工具调用类交互。
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26}}>
          <div style={{display: 'flex', gap: 22}}>
            <Col title="适用 · 无损耗" rows={YES} color={C.green} bg={`${C.green}14`} border={`${C.green}55`} base={30} />
            <Col title="不适用 · 走原生端点" rows={NO} color={C.rose} bg={`${C.rose}12`} border={`${C.rose}44`} base={90} />
          </div>
          <div style={{fontSize: 23, fontWeight: 700, color: C.ink, textAlign: 'center', background: `${C.violet}1a`, border: `1px solid ${C.violet}44`, borderRadius: 18, padding: '20px 26px', lineHeight: 1.5, opacity: note, transform: `translateY(${(1 - note) * 16}px)`}}>
            schema 内的交互<b style={{color: C.green}}>可无损耗互转</b>;schema 外(向量 / 图像 / 音视频)<b style={{color: C.rose}}>无转换路径</b>。
          </div>
        </div>

        <div style={{fontSize: 20, color: C.ink3, fontWeight: 600, textAlign: 'center'}}>
          源码依据:<b style={{color: C.ink2}}>ai-proxy DefaultCapabilities</b>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
