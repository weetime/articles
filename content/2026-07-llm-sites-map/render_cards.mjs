import {chromium} from 'playwright-core';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const b=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--force-color-profile=srgb']});
const ctx=await b.newContext({viewport:{width:1120,height:1400},deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto('file://'+process.cwd()+'/cards.html',{waitUntil:'networkidle'});
await p.waitForTimeout(400);
const slides=await p.$$('.slide');
console.log('slides',slides.length);
for(let i=0;i<slides.length;i++){
  const f=`cards/card-${String(i).padStart(2,'0')}.png`;
  await slides[i].screenshot({path:f});
  const box=await slides[i].boundingBox();
  console.log(f, Math.round(box.width)+'x'+Math.round(box.height));
}
await b.close();
