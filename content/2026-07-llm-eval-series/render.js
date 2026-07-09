const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR = __dirname;
const jobs = [
  ['cover.html', '.cover', 'cover.png'],
  ['final-1-hero.html', '.poster', 'final-1.png'],
  ['final-2-curve.html', '.poster', 'final-2.png'],
  ['final-3-prefill-decode.html', '.poster', 'final-3.png'],
  ['final-4-scenarios.html', '.poster', 'final-4.png'],
  ['final-5-passk.html', '.poster', 'final-5.png'],
  ['final-6-metrics.html', '.poster', 'final-6.png'],
  ['final-7-tools.html', '.poster', 'final-7.png'],
  ['footer-card.html', '.card', 'footer-card.png'],
];
(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=2', '--hide-scrollbars'],
  });
  for (const [html, sel, out] of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1400, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(DIR, html), { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 250));
    const el = await page.$(sel);
    const box = await el.boundingBox();
    await el.screenshot({ path: path.join(DIR, out) });
    console.log(out, '->', Math.round(box.width) + 'x' + Math.round(box.height));
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
