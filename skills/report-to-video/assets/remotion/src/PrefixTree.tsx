import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Bg} from './Bg';
import {C, PREFIX} from './theme';

const eo = Easing.out(Easing.cubic);

const BLOCKS = ['系统提示', '检索文档', '对话历史', '本轮提问'];
const HASHES = ['a91f', '7c3e', 'd028', 'b4f6'];
// 累积 XOR 后的 key 序列（示意）
const KEYS = ['a91f', 'd5e1', '05c9', 'b13f'];

const Eyebrow: React.FC<{op: number}> = ({op}) => (
  <>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.violet, opacity: op}}>
      <span style={{width: 11, height: 11, borderRadius: 6, background: C.violet, boxShadow: `0 0 14px ${C.violet}66`}} />
      机制 · Redis 全局前缀树
    </div>
    <div style={{fontSize: 52, fontWeight: 800, marginTop: 12, letterSpacing: -1, opacity: op}}>
      分块 → 哈希 → <span style={{color: C.violet}}>最长前缀匹配</span>
    </div>
  </>
);

export const PrefixTree: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const land = width > height;
  const intro = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});

  // 阶段：blocks 出现 → hash 翻转 → key 链构建 → token 走到最长匹配 → pod 命中
  const blockIn = (i: number) => interpolate(frame, [30 + i * 10, 50 + i * 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const hashIn = (i: number) => interpolate(frame, [85 + i * 8, 100 + i * 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const keyIn = (i: number) => interpolate(frame, [135 + i * 12, 152 + i * 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  // token 走到第 3 个 key（index 2）= 最长匹配
  const matchProg = interpolate(frame, [195, 285], [0, 3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: eo});
  const podIn = spring({frame: frame - 290, fps, config: {damping: 200}});
  const fallbackIn = interpolate(frame, [320, 345], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // 一个 key 是否已被匹配点亮（前 3 个匹配，第 4 个未命中）
  const litLevel = (i: number) => (i < 3 ? interpolate(matchProg, [i, i + 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0);

  const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: C.panel,
    border: `2px solid ${C.line2}`,
    borderRadius: 16,
    boxShadow: C.shadow,
    ...extra,
  });

  // 区块行
  const Blocks = (
    <div style={{display: 'flex', gap: 14, justifyContent: 'center'}}>
      {BLOCKS.map((b, i) => (
        <div key={i} style={{textAlign: 'center', opacity: blockIn(i), transform: `translateY(${(1 - blockIn(i)) * 16}px)`}}>
          <div style={{...card({padding: '16px 14px', borderColor: `${PREFIX[i]}88`}), color: C.ink}}>
            <div style={{fontSize: land ? 20 : 22, fontWeight: 800}}>b{i + 1}</div>
            <div style={{fontSize: 15, color: C.ink3, marginTop: 4}}>{b}</div>
          </div>
          <div style={{marginTop: 8, fontSize: 16, fontFamily: 'ui-monospace,monospace', color: PREFIX[i], opacity: hashIn(i), fontWeight: 700}}>
            sha1·{HASHES[i]}
          </div>
        </div>
      ))}
    </div>
  );

  // key 链（横向，token 沿链点亮）
  const KeyChain = (
    <div style={{display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap'}}>
      {KEYS.map((k, i) => {
        const lit = litLevel(i);
        const isMiss = i === 3;
        const on = lit > 0.5;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                ...card({
                  padding: land ? '16px 18px' : '18px 22px',
                  borderColor: on ? `${C.green}` : isMiss && frame > 290 ? `${C.off}` : C.line2,
                }),
                opacity: keyIn(i),
                boxShadow: on ? `0 0 ${26 * lit}px ${C.green}66, ${C.shadow}` : C.shadow,
                position: 'relative',
              }}
            >
              <div style={{fontSize: 14, color: C.ink4, fontWeight: 600}}>{i === 0 ? 'K1' : `K${i + 1}=K${i}⊕`}</div>
              <div style={{fontSize: land ? 26 : 30, fontWeight: 850, fontFamily: 'ui-monospace,monospace', color: on ? C.green : C.ink2}}>
                {k}
              </div>
              {on && (
                <div style={{position: 'absolute', top: -14, right: -10, fontSize: 22, color: C.green}}>✓</div>
              )}
            </div>
            {i < KEYS.length - 1 && (
              <div style={{fontSize: 26, color: litLevel(i + 1) > 0.1 ? C.green : C.ink4}}>▸</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const MatchLabel = (
    <div style={{textAlign: 'center', opacity: podIn}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 14}}>
        <span style={{fontSize: 22, fontWeight: 800, color: C.green, background: `${C.green}1f`, border: `1px solid ${C.green}55`, borderRadius: 999, padding: '10px 22px'}}>
          最长匹配 = K3
        </span>
        <span style={{fontSize: 30, color: C.ink3}}>→</span>
        <span style={{...card({padding: '14px 24px', borderColor: `${C.green}88`}), boxShadow: `0 0 ${30 * podIn}px ${C.green}55, ${C.shadow}`}}>
          <span style={{fontSize: 24, fontWeight: 850}}>P2</span>
          <span style={{fontSize: 18, color: C.green, fontWeight: 700, marginLeft: 10}}>✓ 命中 APC</span>
        </span>
      </div>
    </div>
  );

  const Fallback = (
    <div style={{textAlign: 'center', opacity: fallbackIn, fontSize: land ? 19 : 21, color: C.ink3, fontWeight: 600}}>
      <b style={{color: C.off}}>b4 未命中</b> → 回退 global_least_request,并把本次「前缀 → Pod」<b style={{color: C.ink2}}>回写 Redis</b>
    </div>
  );

  if (land) {
    return (
      <Bg>
        <AbsoluteFill style={{opacity: intro, padding: '70px 80px 130px', display: 'flex', flexDirection: 'column'}}>
          <Eyebrow op={1} />
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 44}}>
            {Blocks}
            {KeyChain}
            {MatchLabel}
            {Fallback}
          </div>
        </AbsoluteFill>
      </Bg>
    );
  }

  return (
    <Bg>
      <AbsoluteFill style={{opacity: intro, padding: '210px 60px 500px', display: 'flex', flexDirection: 'column'}}>
        <Eyebrow op={1} />
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
          <div>
            <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginBottom: 16}}>① prompt 分块 + 逐块 SHA-1</div>
            {Blocks}
          </div>
          <div>
            <div style={{fontSize: 22, color: C.ink3, fontWeight: 600, marginBottom: 16}}>② 累积 XOR 生成 key 序列 → 最长前缀匹配</div>
            {KeyChain}
          </div>
          {MatchLabel}
          {Fallback}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
