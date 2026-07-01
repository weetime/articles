import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Hero';
import {FullStack} from './FullStack';
import {Split} from './Split';
import {Cluster} from './Cluster';
import {Swap} from './Swap';
import {Failover} from './Failover';
import {Unified} from './Unified';
import {Decentral} from './Decentral';
import {Mechanism} from './Mechanism';
import {Impl} from './Impl';
import {Outro} from './Outro';

const P = {fps: 30, width: 1080, height: 1920} as const;   // 竖屏 9:16
const L = {fps: 30, width: 1920, height: 1080} as const;   // 横屏 16:9

const SCENES: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hero', comp: Hero, dur: 350},
  {id: 'FullStack', comp: FullStack, dur: 520},
  {id: 'Split', comp: Split, dur: 580},
  {id: 'Cluster', comp: Cluster, dur: 410},
  {id: 'Swap', comp: Swap, dur: 600},
  {id: 'Failover', comp: Failover, dur: 420},
  {id: 'Unified', comp: Unified, dur: 440},
  {id: 'Decentral', comp: Decentral, dur: 420},
  {id: 'Mechanism', comp: Mechanism, dur: 770},
  {id: 'Impl', comp: Impl, dur: 430},
  {id: 'Outro', comp: Outro, dur: 340},
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
