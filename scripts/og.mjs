// Captures the Open Graph card (src/pages/og) into public/og.png.
// Needs `npm run build && npm run preview` on :4321 and a local Chrome.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await p.goto('http://localhost:4321/og/', { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og.png', type: 'png' });
await b.close();
console.log('Wrote public/og.png');
