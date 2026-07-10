import {chromium} from 'playwright-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = '/private/tmp/claude-501/-Users-fangyong-articles/d9f008b4-9d6c-4705-b32b-60b2ffff57fc/scratchpad/tour';
fs.rmSync(OUT, {recursive: true, force: true}); fs.mkdirSync(OUT, {recursive: true});
const W = 1080, H = 1440;

// 9 类榜首(按分类顺序):榜单动画后切到该类第一名的实操
const SITES = [
  {url: 'https://arena.ai/leaderboard',          settle: 3500, scroll: 420}, // 综合
  {url: 'https://www.superclueai.com/homepage',  settle: 3200, scroll: 360}, // 中文
  {url: 'https://artificialanalysis.ai/',        settle: 3600, scroll: 420}, // 选型
  {url: 'https://www.swebench.com/',             settle: 3000, scroll: 380}, // 垂直
  {url: 'https://aireleasetracker.com/',         settle: 3000, scroll: 320}, // 发布追踪
  {url: 'https://openrouter.ai/rankings',        settle: 3400, scroll: 260}, // API 聚合
  {url: 'https://huggingface.co/models',         settle: 3000, scroll: 300}, // 模型仓库
  {url: 'https://recipes.mcpinfra.net/',         settle: 3200, scroll: 380}, // 部署
  {url: 'https://epoch.ai/trends',               settle: 4000, scroll: 300}, // 趋势
];

const browser = await chromium.launch({executablePath: CHROME, headless: true, args: ['--no-sandbox', '--force-color-profile=srgb']});
const ctx = await browser.newContext({
  viewport: {width: W, height: H}, deviceScaleFactor: 2,
  recordVideo: {dir: OUT, size: {width: W, height: H}},
});
const page = await ctx.newPage();
const t0 = Date.now();
const beats = [], path = [];
let cur = {x: W / 2, y: 300};
const now = () => Date.now() - t0;
const rec = (x, y) => path.push([now(), Math.round(x), Math.round(y)]);
const wait = (ms) => page.waitForTimeout(ms);

async function glide(x, y, ms = 700) {
  const steps = Math.max(16, Math.round(ms / 16));
  for (let i = 1; i <= steps; i++) {
    const k = i / steps, e = 1 - Math.pow(1 - k, 3);
    const mx = cur.x + (x - cur.x) * e, my = cur.y + (y - cur.y) * e;
    await page.mouse.move(mx, my); rec(mx, my); await wait(ms / steps);
  }
  cur = {x, y};
}
async function dismissCookies() {
  try {
    await page.evaluate(() => {
      const rx = /^(accept|accept all|agree|got it|i agree|同意|接受|允许)/i;
      const els = [...document.querySelectorAll('button, a, [role=button]')];
      const b = els.find(x => rx.test((x.textContent || '').trim()));
      if (b) b.click();
    });
  } catch (e) {}
}

// gentle scroll that also records cursor drift (keeps motion alive)
async function softScroll(dy) {
  const half = Math.round(dy / 2);
  await page.mouse.wheel(0, half); await wait(700);
  await page.mouse.wheel(0, dy - half); await wait(700);
}

for (let i = 0; i < SITES.length; i++) {
  const s = SITES[i];
  try {
    await page.goto(s.url, {waitUntil: 'domcontentloaded', timeout: 30000});
  } catch (e) { console.log('GOTO-ERR', s.url, e.message.split('\n')[0]); }
  await wait(s.settle);
  await dismissCookies();
  await wait(400);
  // mark the beat AFTER the site has settled (callout/narration anchor)
  beats.push({i, url: s.url, t: now() / 1000});
  console.log('SHOW', i, s.url, (now() / 1000).toFixed(1));
  // deliberate ~6.5s viewing window (gets kept; load gaps get trimmed)
  await glide(W / 2 + (i % 2 ? 200 : -200), 340 + (i % 3) * 50, 700);
  await wait(650);
  await softScroll(s.scroll);          // 1.4s
  await wait(800);
  await glide(W / 2 + (i % 2 ? -160 : 160), 560, 650);
  await wait(600);
  await softScroll(Math.round(s.scroll * 0.55)); // 1.4s
  await wait(850);
}
await wait(600);

fs.writeFileSync(OUT + '/beats.json', JSON.stringify(beats, null, 2));
fs.writeFileSync(OUT + '/path.json', JSON.stringify({path}));
await ctx.close();
await browser.close();
console.log('BEATS', JSON.stringify(beats.map(b => [b.t.toFixed(1), b.url])));
console.log('VIDEO', fs.readdirSync(OUT).filter(f => f.endsWith('.webm')).join(','));
console.log('DUR', (Date.now() - t0) / 1000);
