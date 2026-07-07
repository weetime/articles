import {chromium} from 'playwright-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'https://recipes.mcpinfra.net';
const OUT = '/private/tmp/claude-501/-Users-fangyong-articles/f744d5c5-dc03-4917-b213-752401878e18/scratchpad/tour';
fs.rmSync(OUT, {recursive: true, force: true}); fs.mkdirSync(OUT, {recursive: true});
const W = 1080, H = 1440;

const browser = await chromium.launch({executablePath: CHROME, headless: true, args: ['--no-sandbox', '--force-color-profile=srgb']});
const ctx = await browser.newContext({
  viewport: {width: W, height: H}, deviceScaleFactor: 2,
  recordVideo: {dir: OUT, size: {width: W, height: H}},
});
await ctx.addInitScript(() => {
  try { localStorage.setItem('theme', 'dark'); } catch (e) {}
  document.documentElement.classList.add('dark');
});

const page = await ctx.newPage();
const t0 = Date.now();
const beats = [], path = [], clicks = [];
let cur = {x: W / 2, y: 260};
const now = () => Date.now() - t0;
const rec = (x, y) => path.push([now(), Math.round(x), Math.round(y)]);
const wait = (ms) => page.waitForTimeout(ms);
async function glide(x, y, ms = 600) {
  const steps = Math.max(14, Math.round(ms / 16));
  for (let i = 1; i <= steps; i++) {
    const k = i / steps, e = 1 - Math.pow(1 - k, 3);
    const mx = cur.x + (x - cur.x) * e, my = cur.y + (y - cur.y) * e;
    await page.mouse.move(mx, my); rec(mx, my); await wait(ms / steps);
  }
  cur = {x, y};
}
async function tap(loc, {pause = 1100, nav = false} = {}) {
  await loc.scrollIntoViewIfNeeded({timeout: 3000}).catch(() => {});
  await wait(220);
  const b = await loc.boundingBox();
  if (!b) throw new Error('no boundingBox');
  const x = b.x + b.width / 2, y = Math.min(H - 14, Math.max(14, b.y + b.height / 2));
  await glide(x, y); await wait(300);
  rec(x, y); clicks.push([now(), Math.round(x), Math.round(y)]);
  if (nav) { await Promise.all([page.waitForLoadState('domcontentloaded').catch(() => {}), page.mouse.click(x, y)]); }
  else { await page.mouse.click(x, y); }
  rec(x, y); await wait(pause);
}
async function navClick(loc, urlPart, pause = 1600) {
  const ok = await loc.isVisible({timeout: 1500}).catch(() => false);
  if (ok) { try { await tap(loc, {nav: true, pause: 300}); } catch (e) {} }
  if (!page.url().includes(urlPart)) { await page.goto(BASE + urlPart, {waitUntil: 'networkidle'}); }
  await wait(pause);
}
// glide to an element and pulse it WITHOUT clicking (keeps you on the page)
async function point(loc, {pause = 1400} = {}) {
  await loc.scrollIntoViewIfNeeded({timeout: 3000}).catch(() => {});
  await wait(220);
  const b = await loc.boundingBox();
  if (!b) throw new Error('no boundingBox');
  const x = b.x + b.width / 2, y = Math.min(H - 14, Math.max(14, b.y + b.height / 2));
  await glide(x, y); await wait(200);
  rec(x, y); clicks.push([now(), Math.round(x), Math.round(y)]);
  await wait(pause);
}
async function wheel(dy, pause = 900) { await page.mouse.wheel(0, dy); await wait(pause); }
async function step(name, fn) {
  const st = now() / 1000;
  try { await fn(); beats.push({name, t: st}); console.log('OK  ', name, st.toFixed(1)); }
  catch (e) { beats.push({name: name + ' (skip)', t: st}); console.log('SKIP', name, e.message.split('\n')[0]); }
}
const byText = (t) => page.getByText(t, {exact: false}).first();
const byBtn = (t) => page.getByRole('button', {name: t}).first();

// ---------- COMPREHENSIVE TOUR ----------
await page.goto(BASE + '/', {waitUntil: 'networkidle'});
if (!(await page.evaluate(() => document.documentElement.classList.contains('dark')))) {
  await page.getByRole('button', {name: /dark mode/i}).click().catch(() => {});
}
await wait(2000);

await step('home→deepseek', () => navClick(page.locator('a[href="/deepseek-ai"]').first(), '/deepseek-ai', 1400));
await step('open V3.2', () => navClick(page.locator('a[href="/deepseek-ai/DeepSeek-V3.2"]').first(), 'DeepSeek-V3.2', 1900));
await step('hw MI300X', () => tap(byText('MI300X'), {pause: 1600}));
await step('hw B200', () => tap(byText('B200'), {pause: 1400}));
await step('variant NVFP4', () => tap(byText('NVFP4'), {pause: 1600}));
await step('strategy DEP', () => tap(byText('Data + Expert Parallel'), {pause: 1500}));
await step('multi-node', () => tap(byText('Multi-node'), {pause: 2000}));
await step('engine SGLang', () => tap(byBtn('SGLang'), {pause: 1700}));
await step('feature Reasoning', () => tap(byBtn('Reasoning'), {pause: 1300}));
await step('copy cmd', () => tap(page.getByRole('button', {name: /^Copy$/}).first(), {pause: 1500}));
await step('JSON API point', () => point(page.getByRole('link', {name: 'JSON API'}).first(), {pause: 1900}));
await step('nav Browse', () => navClick(page.getByRole('link', {name: 'Browse'}).first(), '/browse', 1200));
await step('expand Filter', async () => {
  try { await tap(page.getByRole('button', {name: /Filter/}).first(), {pause: 700}); } catch (e) {}
  if (!page.url().includes('panel=open')) { await page.goto(BASE + '/browse?panel=open', {waitUntil: 'networkidle'}); await wait(500); }
  await wait(1600);
});
await step('point 国产卡', () => point(byText('ASCEND 910B'), {pause: 2400}));
await step('nav ImageSelector', () => navClick(page.getByRole('link', {name: 'Image Selector'}).first(), '/image-selector', 2200));
await step('scroll imgsel', async () => { await wheel(300, 2200); });
await wait(700);

fs.writeFileSync(OUT + '/beats.json', JSON.stringify(beats, null, 2));
fs.writeFileSync(OUT + '/path.json', JSON.stringify({path, clicks}));
await ctx.close();
await browser.close();
console.log('CLICKS', JSON.stringify(clicks.map((c) => [(c[0] / 1000).toFixed(1), c[1], c[2]])));
console.log('VIDEO', fs.readdirSync(OUT).filter((f) => f.endsWith('.webm')).join(','));
console.log('DUR', (Date.now() - t0) / 1000);
