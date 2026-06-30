import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {Scaling} from './Scaling';
import {Collapse} from './Collapse';
import {Latency} from './Latency';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC<{lang?: 'zh' | 'en'}>; dur: number; durEn: number}[] = [
  {id: 'Hero', comp: Hero, dur: 300, durEn: 420},
  {id: 'Scaling', comp: Scaling, dur: 320, durEn: 320},
  {id: 'Collapse', comp: Collapse, dur: 400, durEn: 390},
  {id: 'Latency', comp: Latency, dur: 300, durEn: 195},
  {id: 'Outro', comp: Outro, dur: 300, durEn: 195},
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {SCENES.map(({id, comp, dur, durEn}) => (
        <React.Fragment key={id}>
          <Composition id={id} component={comp} durationInFrames={dur} {...P} />
          <Composition id={`${id}L`} component={comp} durationInFrames={dur} {...L} />
          <Composition id={`${id}EN`} component={comp} durationInFrames={durEn} defaultProps={{lang: 'en'}} {...P} />
        </React.Fragment>
      ))}
    </>
  );
};
