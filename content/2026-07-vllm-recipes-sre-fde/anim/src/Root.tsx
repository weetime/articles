import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {Run} from './Run';
import {Perf} from './Perf';
import {Scene} from './Scene';
import {Stable} from './Stable';
import {Domestic} from './Domestic';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hero', comp: Hero, dur: 270},
  {id: 'Run', comp: Run, dur: 270},
  {id: 'Perf', comp: Perf, dur: 285},
  {id: 'Scene', comp: Scene, dur: 270},
  {id: 'Stable', comp: Stable, dur: 285},
  {id: 'Domestic', comp: Domestic, dur: 260},
  {id: 'Outro', comp: Outro, dur: 240},
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {SCENES.map(({id, comp, dur}) => (
        <React.Fragment key={id}>
          <Composition id={id} component={comp} durationInFrames={dur} {...P} />
          <Composition id={`${id}L`} component={comp} durationInFrames={dur} {...L} />
        </React.Fragment>
      ))}
    </>
  );
};
