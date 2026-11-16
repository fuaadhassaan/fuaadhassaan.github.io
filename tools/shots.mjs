// Captures the project screenshots used on the site (headless Chrome). Run: node tools/shots.mjs
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { spawn } from 'node:child_process';
const OUT = path.resolve('assets');
const SITES = [
  ['elrc', 'https://elrcweb.vercel.app/', 4000],
  ['dticket', 'https://dticket.vercel.app/', 5000],
  ['pushtipath', 'https://pushtipath.web.app/', 12000],
  ['wpm', 'https://iubacmwpm.vercel.app/', 4000],
];
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'shots-'));
const chrome = spawn('C:/Users/fuaad/AppData/Local/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=9801', `--user-data-dir=${prof}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms)); await sleep(2500);
const t = (await (await fetch('http://localhost:9801/json/list')).json()).find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
for (const [name, url, wait] of SITES) {
  await send('Page.navigate', { url }); await sleep(wait);
  const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 82 });
  fs.writeFileSync(path.join(OUT, `${name}.webp`), Buffer.from(shot.result.data, 'base64'));
  const png = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(os.tmpdir(), `shot-${name}.png`), Buffer.from(png.result.data, 'base64'));
  console.log(name, 'ok');
}
ws.close(); chrome.kill(); process.exit(0);
