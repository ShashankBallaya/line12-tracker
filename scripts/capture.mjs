// Dev-only review captures. Needs `npm run build && npm run preview` running on :4321
// and a local Chrome. Usage: node scripts/capture.mjs [outDir]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] ?? '.impeccable/review';
const URL = 'http://localhost:4321/';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page({ width, height, scheme, reduced, mobile = false }) {
  const p = await browser.newPage();
  await p.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await p.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: scheme },
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
  ]);
  await p.goto(URL, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await sleep(1500);
  return p;
}

// Full pages, static (reduced motion shows every section in its complete base state).
// Chrome repeats content in single captures taller than ~16k px, so long pages are
// captured in slices: name.png, name-2.png, name-3.png ... top to bottom, no overlap.
async function fullPageSlices(p, name, width) {
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  const SLICE = 8000;
  for (let y = 0, i = 1; y < total; y += SLICE, i++) {
    const height = Math.min(SLICE, total - y);
    await p.screenshot({ path: `${OUT}/${name}${i === 1 ? '' : `-${i}`}.png`, clip: { x: 0, y, width, height }, captureBeyondViewport: true });
  }
  return total;
}

let p = await page({ width: 1440, height: 900, scheme: 'dark', reduced: true });
console.log('desktop height', await fullPageSlices(p, 'desktop', 1440));
await p.close();

p = await page({ width: 390, height: 844, scheme: 'light', reduced: true, mobile: true });
console.log('mobile height', await fullPageSlices(p, 'mobile', 390));
await p.close();

// Motion on: first viewport, the ride mid-way, the timeline mid-scrub.
p = await page({ width: 1440, height: 900, scheme: 'dark', reduced: false });
await sleep(1200);
await p.screenshot({ path: `${OUT}/desktop-first.png` });
const at = async (sel, extra) => {
  await p.evaluate(
    (s, e) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + window.scrollY + e),
    sel,
    extra,
  );
  await sleep(1400);
};
await at('[data-ride-stage]', 900 * 0.55 * 6);
await p.screenshot({ path: `${OUT}/desktop-ride.png` });
await at('[data-timeline]', 1600);
await p.screenshot({ path: `${OUT}/desktop-timeline.png` });
await p.close();

p = await page({ width: 1440, height: 900, scheme: 'light', reduced: false });
await sleep(1200);
await p.screenshot({ path: `${OUT}/desktop-first-light.png` });
await p.close();

// Phase 3 sections: map (after tiles load) and before/after, desktop and mobile.
for (const [w, h, scheme, name] of [[1440, 900, 'dark', 'desktop'], [390, 844, 'light', 'mobile']]) {
  p = await page({ width: w, height: h, scheme, reduced: true, mobile: w < 500 });
  for (const id of ['map', 'before-after']) {
    await p.evaluate((i) => document.getElementById(i).scrollIntoView(), id);
    await sleep(id === 'map' ? 6000 : 3000);
    await p.screenshot({ path: `${OUT}/${name}-${id}.png` });
  }
  await p.close();
}

// Phase 4 scenes, motion on: hero, station mid-flight, train.
p = await page({ width: 1440, height: 900, scheme: 'dark', reduced: false });
await sleep(3500);
await p.screenshot({ path: `${OUT}/desktop-3d-hero.png` });
// Arrive at the station section first (so the lazy scene loads), then scroll into the pin.
const stepTo = async (y) => {
  const from = await p.evaluate(() => window.scrollY);
  for (let i = 1; i <= 12; i++) {
    await p.evaluate((v) => window.scrollTo(0, v), from + ((y - from) * i) / 12);
    await sleep(80);
  }
};
const stationTop = await p.evaluate(() => document.getElementById('station').getBoundingClientRect().top + window.scrollY);
await stepTo(stationTop);
await sleep(3000);
const stageTop = await p.evaluate(() => document.querySelector('[data-stm-stage]').getBoundingClientRect().top + window.scrollY);
await stepTo(stageTop + 900 * 0.5);
await sleep(2500);
await p.screenshot({ path: `${OUT}/desktop-3d-station-start.png` });
await stepTo(stageTop + 900 * 1.6);
await sleep(2500);
await p.screenshot({ path: `${OUT}/desktop-3d-station-mid.png` });
await stepTo(stageTop + 900 * 2.9);
await sleep(2500);
await p.screenshot({ path: `${OUT}/desktop-3d-station-end.png` });
const trainTop = await p.evaluate(() => document.getElementById('trains').getBoundingClientRect().top + window.scrollY);
await stepTo(trainTop + 150);
await sleep(3500);
await p.screenshot({ path: `${OUT}/desktop-3d-train.png` });
await p.close();
p = await page({ width: 390, height: 844, scheme: 'light', reduced: false, mobile: true });
await p.evaluate(() => document.getElementById('station').scrollIntoView());
await sleep(3000);
await p.evaluate(() => window.scrollBy(0, 844 * 1.8));
await sleep(3000);
await p.screenshot({ path: `${OUT}/mobile-3d-station.png` });
await p.close();

await browser.close();
console.log(`Captured into ${OUT}`);
