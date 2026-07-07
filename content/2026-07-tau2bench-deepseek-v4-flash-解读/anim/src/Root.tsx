import React from 'react';
import {Composition} from 'remotion';
// 科技风(旧版)
import {Hook} from './Hook';
import {Setup} from './Setup';
import {Verdict} from './Verdict';
import {Compare} from './Compare';
import {Flaky} from './Flaky';
import {Scissors} from './Scissors';
import {Grid} from './Grid';
import {VsPro} from './VsPro';
import {Outro} from './Outro';
// 水墨手绘风(新版)
import {InkHook} from './InkHook';
import {InkSetup} from './InkSetup';
import {InkVerdict} from './InkVerdict';
import {InkCompare} from './InkCompare';
import {InkFlaky} from './InkFlaky';
import {InkScissors} from './InkScissors';
import {InkGrid} from './InkGrid';
import {InkVsPro} from './InkVsPro';
import {InkOutro} from './InkOutro';

const P = {fps: 30, width: 1080, height: 1920} as const;
const L = {fps: 30, width: 1920, height: 1080} as const;

const TECH: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'Hook', comp: Hook, dur: 190},
  {id: 'Setup', comp: Setup, dur: 200},
  {id: 'Verdict', comp: Verdict, dur: 230},
  {id: 'Compare', comp: Compare, dur: 210},
  {id: 'Flaky', comp: Flaky, dur: 210},
  {id: 'Scissors', comp: Scissors, dur: 220},
  {id: 'Grid', comp: Grid, dur: 200},
  {id: 'VsPro', comp: VsPro, dur: 210},
  {id: 'Outro', comp: Outro, dur: 200},
];

const INK: {id: string; comp: React.FC; dur: number}[] = [
  {id: 'InkHook', comp: InkHook, dur: 200},
  {id: 'InkSetup', comp: InkSetup, dur: 200},
  {id: 'InkVerdict', comp: InkVerdict, dur: 230},
  {id: 'InkCompare', comp: InkCompare, dur: 210},
  {id: 'InkFlaky', comp: InkFlaky, dur: 210},
  {id: 'InkScissors', comp: InkScissors, dur: 220},
  {id: 'InkGrid', comp: InkGrid, dur: 200},
  {id: 'InkVsPro', comp: InkVsPro, dur: 210},
  {id: 'InkOutro', comp: InkOutro, dur: 210},
];

export const RemotionRoot: React.FC = () => (
  <>
    {[...TECH, ...INK].map(({id, comp, dur}) => (
      <React.Fragment key={id}>
        <Composition id={id} component={comp} durationInFrames={dur} {...P} />
        <Composition id={`${id}L`} component={comp} durationInFrames={dur} {...L} />
      </React.Fragment>
    ))}
  </>
);
