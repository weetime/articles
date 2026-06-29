import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {Topology} from './Topology';
import {PrefixTree} from './PrefixTree';
import {RunData} from './RunData';
import {BarRace} from './BarRace';
import {NoHotspot} from './NoHotspot';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hero', comp: Hero, dur: 480},
  {id: 'Topology', comp: Topology, dur: 500},
  {id: 'PrefixTree', comp: PrefixTree, dur: 400},
  {id: 'RunData', comp: RunData, dur: 400},
  {id: 'BarRace', comp: BarRace, dur: 410},
  {id: 'NoHotspot', comp: NoHotspot, dur: 410},
  {id: 'Outro', comp: Outro, dur: 370},
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
