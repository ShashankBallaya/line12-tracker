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
let p = await page({ width: 1440, height: 900, scheme: 'dark', reduced: true });
await p.screenshot({ path: `${OUT}/desktop.png`, fullPage: true });
await p.close();

p = await page({ width: 390, height: 844, scheme: 'light', reduced: true, mobile: true });
await p.screenshot({ path: `${OUT}/mobile.png`, fullPage: true });
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

await browser.close();
console.log(`Captured into ${OUT}`);
