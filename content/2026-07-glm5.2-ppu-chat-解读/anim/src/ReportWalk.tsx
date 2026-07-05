import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';

// 竖屏走查真实报告长图:镜头下滚 + 关键处微放大 + 下沉式浮层批注。
// 图: public/report-tall-p.png  (1080 × 4973)
const IMG_W = 1080, IMG_H = 4973, FW = 1080, FH = 1920;
const ease = Easing.inOut(Easing.cubic);

// 镜头关键帧: f=帧, cy=对准的图像纵坐标(居中), s=缩放
const CAM = [
  {f: 0,   cy: 940,  s: 1.00},   // 片头:标题 + 结论卡片
  {f: 205, cy: 940,  s: 1.00},
  {f: 250, cy: 1859, s: 1.06},   // ChatWall 吞吐柱图
  {f: 430, cy: 1859, s: 1.06},
  {f: 475, cy: 3690, s: 1.06},   // Agent 过载图
  {f: 645, cy: 3690, s: 1.06},
  {f: 690, cy: 4120, s: 1.02},   // 建议表 / 收尾
  {f: 840, cy: 4120, s: 1.02},
];
const kf = (frame: number, key: 'cy' | 's') =>
  interpolate(frame, CAM.map((c) => c.f), CAM.map((c) => c[key]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// 下沉式批注(lower-third):停在安全区,分节切换
const NOTES: {in: number; out: number; tag: string; big: string; sub: string; color: string}[] = [
  {in: 8,   out: 205, tag: '实测报告', big: '默认参数,够用吗?', sub: '8 卡国产卡 · DeepSeek-V4 · SGLang', color: '#6f9bd8'},
  {in: 255, out: 430, tag: 'Chat 并发', big: '吞吐 823 · 甜点 96', sub: '再往上撞「显存墙」,只多 2%', color: '#2e7d5b'},
  {in: 480, out: 645, tag: 'Agent 场景', big: '首字 108 秒 · 过载 2–7×', sub: '长输入 prefill 重,单机救不了', color: '#c1443c'},
  {in: 695, out: 838, tag: '完整解读', big: '怎么调 · 怎么读 · 卡在哪', sub: '完整实测报告,见下方图文', color: '#6f9bd8'},
];

const Note: React.FC<{n: typeof NOTES[0]}> = ({n}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [n.in, n.in + 12, n.out - 10, n.out], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ty = interpolate(f, [n.in, n.in + 14], [26, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 470, opacity: o, transform: `translateY(${ty}px)`}}>
      <div style={{background: 'rgba(14,17,22,0.93)', border: `1px solid ${n.color}66`, borderLeft: `5px solid ${n.color}`,
        borderRadius: 20, padding: '30px 34px', boxShadow: '0 18px 50px rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)'}}>
        <div style={{fontSize: 22, fontWeight: 800, color: n.color, letterSpacing: 1}}>{n.tag}</div>
        <div style={{fontSize: 52, fontWeight: 850, color: '#fff', marginTop: 10, lineHeight: 1.12, letterSpacing: -1}}>{n.big}</div>
        <div style={{fontSize: 26, fontWeight: 500, color: '#c2c9d6', marginTop: 12}}>{n.sub}</div>
      </div>
    </div>
  );
};

export const ReportWalk: React.FC = () => {
  const f = useCurrentFrame();
  const s = kf(f, 's'), cy = kf(f, 'cy');
  const tx = (FW - IMG_W * s) / 2;
  const ty = FH / 2 - cy * s;
  return (
    <AbsoluteFill style={{background: '#ffffff', fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif', overflow: 'hidden'}}>
      <Img src={staticFile('report-tall-p.png')}
        style={{position: 'absolute', width: IMG_W, height: IMG_H, left: 0, top: 0,
          transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: '0 0'}} />
      {/* 顶/底渐变:柔化滚动边缘 + 避开视频号/抖音 UI 区 */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 210,
        background: 'linear-gradient(#ffffff,#ffffffee 40%,transparent)'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 520,
        background: 'linear-gradient(transparent,#ffffffd9 42%,#ffffff)'}} />
      {/* 顶部进度条 */}
      <div style={{position: 'absolute', top: 150, left: 60, right: 60, height: 5, background: '#e2e3ed', borderRadius: 3}}>
        <div style={{height: '100%', width: `${interpolate(f, [0, 840], [6, 100])}%`, background: '#6f9bd8', borderRadius: 3}} />
      </div>
      <div style={{position: 'absolute', top: 120, left: 60, fontSize: 22, fontWeight: 700, color: '#6f9bd8'}}>测试报告解读 · 走查</div>
      {NOTES.map((n, i) => <Note key={i} n={n} />)}
    </AbsoluteFill>
  );
};
