import React from 'react';
import {Composition} from 'remotion';
import {Intro} from './Intro';
import {Setup} from './Setup';
import {ChatWall} from './ChatWall';
import {LowConc} from './LowConc';
import {Agent} from './Agent';
import {Context} from './Context';
import {HowRead} from './HowRead';
import {Outro} from './Outro';
import {ReportWalk} from './ReportWalk';
import {ReportWalk2} from './ReportWalk2';

const P = {fps: 30, width: 1080, height: 1920} as const; // 竖屏 9:16

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Intro', comp: Intro, dur: 495},
  {id: 'Setup', comp: Setup, dur: 562},
  {id: 'ChatWall', comp: ChatWall, dur: 718},
  {id: 'LowConc', comp: LowConc, dur: 532},
  {id: 'Agent', comp: Agent, dur: 732},
  {id: 'Context', comp: Context, dur: 570},
  {id: 'HowRead', comp: HowRead, dur: 562},
  {id: 'Outro', comp: Outro, dur: 331},
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {SCENES.map(({id, comp, dur}) => (
        <Composition key={id} id={id} component={comp} durationInFrames={dur} {...P} />
      ))}
      <Composition id="ReportWalk" component={ReportWalk} durationInFrames={840} {...P} />
      <Composition id="ReportWalk2" component={ReportWalk2} durationInFrames={3112} {...P} />
    </>
  );
};
