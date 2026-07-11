import {chromium} from 'playwright-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR='/Users/fangyong/articles/content/2026-07-tau-bench-解读/figs';
const NAMES=['fig-0-pipeline','fig-1-domains','fig-2-judge','fig-3-embed','fig-4-funnel','fig-5-concurrency','fig-6-metrics','fig-7-params','fig-8-runbook'];
const b=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--force-color-profile=srgb']});
const ctx=await b.newContext({viewport:{width:1960,height:1400},deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto('file://'+DIR+'/figs.html',{waitUntil:'networkidle'});
await p.waitForTimeout(400);
const posters=await p.$$('.poster');
console.log('posters',posters.length);
for(let i=0;i<posters.length;i++){
  const f=`${DIR}/${NAMES[i]}.png`;
  await posters[i].screenshot({path:f});
  const box=await posters[i].boundingBox();
  console.log(NAMES[i], Math.round(box.width)+'x'+Math.round(box.height));
}
const cov=await p.$('#cover');
await cov.screenshot({path:DIR+'/../cover.png'});
await b.close();
