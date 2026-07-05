import React from 'react';
import {Composition} from 'remotion';
import {Intro} from './Intro';
import {Model} from './Model';
import {Recipe} from './Recipe';
import {Method} from './Method';
import {ChatWall} from './ChatWall';
import {LowConc} from './LowConc';
import {Mtp} from './Mtp';
import {Roadmap} from './Roadmap';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const; // 竖屏 9:16

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Intro', comp: Intro, dur: 200},
  {id: 'Model', comp: Model, dur: 250},
  {id: 'Recipe', comp: Recipe, dur: 340},
  {id: 'Method', comp: Method, dur: 200},
  {id: 'ChatWall', comp: ChatWall, dur: 320},
  {id: 'LowConc', comp: LowConc, dur: 180},
  {id: 'Mtp', comp: Mtp, dur: 200},
  {id: 'Roadmap', comp: Roadmap, dur: 190},
  {id: 'Outro', comp: Outro, dur: 270},
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {SCENES.map(({id, comp, dur}) => (
        <Composition key={id} id={id} component={comp} durationInFrames={dur} {...P} />
      ))}
    </>
  );
};
