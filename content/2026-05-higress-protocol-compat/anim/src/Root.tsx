import React from 'react';
import {Composition} from 'remotion';
import {Hook} from './Hook';
import {Hero} from './Hero';
import {DualEntry} from './DualEntry';
import {Compare} from './Compare';
import {ZeroLoss} from './ZeroLoss';
import {ModelFit} from './ModelFit';
import {Outro} from './Outro';
import {HookEN} from './HookEN';
import {HeroEN} from './HeroEN';
import {CompareEN} from './CompareEN';
import {ZeroLossEN} from './ZeroLossEN';
import {OutroEN} from './OutroEN';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hook', comp: Hook, dur: 90},
  {id: 'Hero', comp: Hero, dur: 480},
  {id: 'DualEntry', comp: DualEntry, dur: 470},
  {id: 'Compare', comp: Compare, dur: 460},
  {id: 'ZeroLoss', comp: ZeroLoss, dur: 440},
  {id: 'ModelFit', comp: ModelFit, dur: 470},
  {id: 'Outro', comp: Outro, dur: 380},
  {id: 'HookEN', comp: HookEN, dur: 90},
  {id: 'HeroEN', comp: HeroEN, dur: 480},
  {id: 'CompareEN', comp: CompareEN, dur: 460},
  {id: 'ZeroLossEN', comp: ZeroLossEN, dur: 440},
  {id: 'OutroEN', comp: OutroEN, dur: 380},
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
