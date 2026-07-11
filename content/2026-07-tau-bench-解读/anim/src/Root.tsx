import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {Mechanism} from './Mechanism';
import {Evolution} from './Evolution';
import {PassK} from './PassK';
import {TalkVsDo} from './TalkVsDo';
import {Cliff} from './Cliff';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hero', comp: Hero, dur: 500},
  {id: 'Mechanism', comp: Mechanism, dur: 620},
  {id: 'Evolution', comp: Evolution, dur: 600},
  {id: 'PassK', comp: PassK, dur: 580},
  {id: 'TalkVsDo', comp: TalkVsDo, dur: 690},
  {id: 'Cliff', comp: Cliff, dur: 690},
  {id: 'Outro', comp: Outro, dur: 600},
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
