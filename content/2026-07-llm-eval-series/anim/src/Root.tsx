import React from 'react';
import {Composition} from 'remotion';
import {Hook} from './Hook';
import {Steps} from './Steps';
import {OneWrong} from './OneWrong';
import {PassK} from './PassK';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hook', comp: Hook, dur: 360},
  {id: 'Steps', comp: Steps, dur: 390},
  {id: 'OneWrong', comp: OneWrong, dur: 300},
  {id: 'PassK', comp: PassK, dur: 420},
  {id: 'Outro', comp: Outro, dur: 350},
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
