import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C} from './theme';

const eo = Easing.out(Easing.cubic);

// 竖屏内容板:竖屏原样;横屏时把竖版内容按高度缩放居中(保证不裁切、细节完整)
export const Board: React.FC<{land: boolean; children: React.ReactNode; boardH?: number}> = ({land, children, boardH = 1440}) => {
  if (!land) return <>{children}</>;
  const SC = 1030 / boardH;
  const w = 1080 * SC;
  return (
    <div style={{position: 'absolute', left: (1920 - w) / 2, top: (1080 - boardH * SC) / 2, width: 1080, height: boardH, transformOrigin: 'top left', transform: `scale(${SC})`}}>
      {children}
    </div>
  );
};
export const rv = (frame: number, d: number, span = 14) =>
  interpolate(frame, [d, d + span], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});

// 进度揭示的标签卡(progressive reveal)
export const Panel: React.FC<{
  frame: number; delay: number; color?: string; title: React.ReactNode; sub?: React.ReactNode;
  chips?: string[]; left: number; top: number; width: number; minH?: number; accent?: boolean; mono?: boolean;
}> = ({frame, delay, color = C.violet, title, sub, chips, left, top, width, minH, accent, mono}) => {
  const o = rv(frame, delay);
  return (
    <div style={{
      position: 'absolute', left, top, width, minHeight: minH,
      background: accent ? `linear-gradient(180deg,${color}1c,${C.panel})` : C.panel,
      border: `2px solid ${accent ? color + '88' : C.line2}`, borderRadius: 18, padding: '16px 22px',
      boxShadow: accent ? `0 0 26px ${color}33, ${C.shadow}` : C.shadow,
      opacity: o, transform: `translateY(${(1 - o) * 22}px)`,
      fontFamily: mono ? 'ui-monospace,monospace' : undefined,
    }}>
      <div style={{fontSize: 28, fontWeight: 850, color: accent ? color : C.ink, letterSpacing: -0.5}}>{title}</div>
      {sub && <div style={{fontSize: 18, color: C.ink3, marginTop: 5, fontWeight: 600, lineHeight: 1.4}}>{sub}</div>}
      {chips && (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 11}}>
          {chips.map((c, i) => (
            <span key={i} style={{fontSize: 16, fontWeight: 600, color: C.ink2, background: C.track, border: `1px solid ${C.line}`, borderRadius: 8, padding: '5px 11px', opacity: rv(frame, delay + 4 + i * 2)}}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// 竖向连接箭头(在两层之间画下来)
export const Down: React.FC<{frame: number; delay: number; x: number; y: number; h: number; color?: string; label?: string}> = ({frame, delay, x, y, h, color = C.violet, label}) => {
  const o = rv(frame, delay, 10);
  return (
    <>
      <div style={{position: 'absolute', left: x - 1.5, top: y, width: 3, height: h * o, background: `linear-gradient(${color},${color}44)`}} />
      <div style={{position: 'absolute', left: x - 7, top: y + h * o - 4, width: 14, height: 14, opacity: o, color, fontSize: 18, transform: 'translateX(-1px)'}}>▼</div>
      {label && <div style={{position: 'absolute', left: x + 16, top: y + h / 2 - 12, fontSize: 17, fontWeight: 700, color, opacity: o}}>{label}</div>}
    </>
  );
};
