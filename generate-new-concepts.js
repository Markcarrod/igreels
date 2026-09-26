// ─────────────────────────────────────────────────────────────────────────────
//  generate-new-concepts.js
//  Renders 6 brand new unique viral concepts to high-res 1080x1920 PNG images.
// ─────────────────────────────────────────────────────────────────────────────

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH  = 1080;
const HEIGHT = 1920;

const coverPath = path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/SpotifyVisualizer/bin/Release/net8.0/Assets/COVER.png");
const outDir = path.resolve(__dirname, 'NewTemplatesPreview');
fs.mkdirSync(outDir, { recursive: true });

const ext = coverPath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
const coverDataUrl = `data:image/${ext};base64,` + fs.readFileSync(coverPath).toString('base64');

const SONG = {
  title: 'Group Chat',
  artist: 'Famous Pluto, Muyeez',
  duration: '2:21',
  elapsed: '1:18',
  remaining: '-1:03',
  progressPct: 55.3,
};

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 1: iPhone Lock Screen (iOS 18 Dynamic Island & Live Activity)
// ─────────────────────────────────────────────────────────────────────────────
function htmlLockScreen() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#000;position:relative;color:#fff;}
.bg{position:absolute;inset:-30px;background:url('${coverDataUrl}') center/cover;filter:blur(70px) brightness(0.35) saturate(1.8);transform:scale(1.15);}
.overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 30%,rgba(0,0,0,0.6) 75%,rgba(0,0,0,0.92) 100%);}
.container{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:55px 50px 70px;align-items:center;}
/* Dynamic Island */
.island{width:360px;height:70px;background:#000;border-radius:40px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border:1px solid rgba(255,255,255,0.08);}
.i-left{width:42px;height:42px;border-radius:50%;overflow:hidden;}
.i-left img{width:100%;height:100%;object-fit:cover;}
.i-wave{display:flex;align-items:center;gap:4px;height:24px;}
.i-bar{width:4px;background:#30d158;border-radius:2px;}
/* Clock */
.clock-box{text-align:center;margin-top:20px;}
.date{font-size:32px;font-weight:600;color:rgba(255,255,255,0.85);margin-bottom:6px;letter-spacing:0.02em;}
.clock{font-size:160px;font-weight:700;line-height:0.95;letter-spacing:-0.04em;}
/* iOS 18 Live Activity Card */
.media-card{width:100%;background:rgba(28,28,34,0.72);backdrop-filter:blur(50px);border:1px solid rgba(255,255,255,0.14);border-radius:44px;padding:36px;box-shadow:0 30px 90px rgba(0,0,0,0.75);}
.card-top{display:flex;align-items:center;gap:28px;}
.card-art{width:160px;height:160px;border-radius:24px;overflow:hidden;flex-shrink:0;box-shadow:0 12px 30px rgba(0,0,0,0.6);}
.card-art img{width:100%;height:100%;object-fit:cover;}
.card-title{font-size:42px;font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.card-artist{font-size:32px;color:rgba(255,255,255,0.65);margin-top:6px;}
.card-progress{margin-top:28px;}
.c-track{width:100%;height:8px;background:rgba(255,255,255,0.22);border-radius:4px;}
.c-fill{width:${SONG.progressPct}%;height:100%;background:#fff;border-radius:4px;}
.c-times{display:flex;justify-content:space-between;margin-top:10px;font-size:22px;color:rgba(255,255,255,0.5);}
.card-ctrls{display:flex;justify-content:center;align-items:center;gap:90px;margin-top:20px;}
/* Lockscreen Bottom Icons */
.bot-row{width:100%;display:flex;justify-content:space-between;align-items:center;padding:0 20px;}
.round-btn{width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.18);backdrop-filter:blur(30px);display:flex;align-items:center;justify-content:center;}
.home-pill{width:280px;height:8px;background:#fff;border-radius:4px;margin-top:30px;}
</style></head><body>
<div class="bg"></div><div class="overlay"></div>
<div class="container">
  <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
    <div class="island">
      <div class="i-left"><img src="${coverDataUrl}" /></div>
      <div class="i-wave">
        <div class="i-bar" style="height:14px;"></div>
        <div class="i-bar" style="height:22px;"></div>
        <div class="i-bar" style="height:10px;"></div>
        <div class="i-bar" style="height:18px;"></div>
      </div>
    </div>
    <div class="clock-box">
      <div class="date">Saturday, September 26</div>
      <div class="clock">12:34</div>
    </div>
  </div>
  <div style="width:100%;display:flex;flex-direction:column;align-items:center;">
    <div class="media-card">
      <div class="card-top">
        <div class="card-art"><img src="${coverDataUrl}" /></div>
        <div style="flex:1;min-width:0;">
          <div class="card-title">${SONG.title}</div>
          <div class="card-artist">${SONG.artist}</div>
        </div>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>
      </div>
      <div class="card-progress">
        <div class="c-track"><div class="c-fill"></div></div>
        <div class="c-times"><span>${SONG.elapsed}</span><span>${SONG.remaining}</span></div>
      </div>
      <div class="card-ctrls">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="white" stroke-width="2.5"/></svg>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="white"><rect x="5" y="3" width="5" height="18" rx="2"/><rect x="14" y="3" width="5" height="18" rx="2"/></svg>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="white" stroke-width="2.5"/></svg>
      </div>
    </div>
    <div class="bot-row" style="margin-top:50px;">
      <div class="round-btn">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M18 6l-3-4H9L6 6H4v3l2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V11l2-2V6h-2z"/></svg>
      </div>
      <div class="round-btn">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      </div>
    </div>
    <div class="home-pill"></div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 2: iPod Classic (2004 Click Wheel)
// ─────────────────────────────────────────────────────────────────────────────
function htmlIPod() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#0d0d10;color:#fff;display:flex;justify-content:center;align-items:center;}
/* iPod Body Shell */
.ipod{width:940px;height:1800px;background:#e5e5ea;border-radius:70px;box-shadow:0 50px 140px rgba(0,0,0,0.9),inset 0 0 30px rgba(0,0,0,0.15);padding:60px 50px;display:flex;flex-direction:column;align-items:center;border:6px solid #d1d1d6;position:relative;}
/* TFT Screen */
.screen{width:100%;height:820px;background:linear-gradient(180deg,#cbe2f8 0%,#b2d2f2 100%);border-radius:24px;border:8px solid #1a1a1a;box-shadow:inset 0 4px 15px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;padding:24px 30px;color:#111;overflow:hidden;}
.s-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(0,0,0,0.25);padding-bottom:12px;font-weight:700;font-size:26px;}
.s-body{display:flex;gap:36px;align-items:center;margin:30px 0;}
.s-cover{width:460px;height:460px;border-radius:12px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.35);flex-shrink:0;}
.s-cover img{width:100%;height:100%;object-fit:cover;display:block;}
.s-info{flex:1;min-width:0;}
.s-title{font-size:46px;font-weight:800;line-height:1.15;margin-bottom:12px;color:#000;}
.s-artist{font-size:32px;font-weight:600;color:#333;margin-bottom:8px;}
.s-album{font-size:26px;color:#555;}
/* Diamond Scrubber */
.s-scrub{margin-top:20px;}
.scrub-track{width:100%;height:12px;background:#8caecc;border-radius:6px;position:relative;border:1px solid rgba(0,0,0,0.2);}
.scrub-fill{width:${SONG.progressPct}%;height:100%;background:#0a4b8c;border-radius:6px;}
.diamond{position:absolute;top:50%;left:${SONG.progressPct}%;transform:translate(-50%,-50%) rotate(45deg);width:26px;height:26px;background:#fff;border:3px solid #0a4b8c;}
.scrub-times{display:flex;justify-content:space-between;margin-top:14px;font-size:24px;font-weight:700;color:#222;}
/* Legendary Click Wheel */
.wheel-wrap{flex:1;display:flex;align-items:center;justify-content:center;}
.wheel{width:680px;height:680px;border-radius:50%;background:#f2f2f7;border:4px solid #d1d1d6;box-shadow:inset 0 0 25px rgba(0,0,0,0.12),0 15px 35px rgba(0,0,0,0.15);position:relative;display:flex;align-items:center;justify-content:center;}
.w-btn{position:absolute;font-size:32px;font-weight:800;color:#8e8e93;letter-spacing:0.05em;text-transform:uppercase;}
.w-top{top:45px;}
.w-bot{bottom:45px;}
.w-left{left:45px;}
.w-right{right:45px;}
.center-btn{width:260px;height:260px;border-radius:50%;background:#e5e5ea;border:3px solid #d1d1d6;box-shadow:0 6px 15px rgba(0,0,0,0.12);}
</style></head><body>
<div class="ipod">
  <div class="screen">
    <div class="s-header">
      <span>▶ Now Playing</span>
      <span>1 of 1 · [■■■■]</span>
    </div>
    <div class="s-body">
      <div class="s-cover"><img src="${coverDataUrl}" /></div>
      <div class="s-info">
        <div class="s-title">${SONG.title}</div>
        <div class="s-artist">${SONG.artist}</div>
        <div class="s-album">Special Single</div>
      </div>
    </div>
    <div class="s-scrub">
      <div class="scrub-track"><div class="scrub-fill"></div><div class="diamond"></div></div>
      <div class="scrub-times"><span>${SONG.elapsed}</span><span>${SONG.remaining}</span></div>
    </div>
  </div>
  <div class="wheel-wrap">
    <div class="wheel">
      <div class="w-btn w-top">MENU</div>
      <div class="w-btn w-left">|◀◀</div>
      <div class="w-btn w-right">▶▶|</div>
      <div class="w-btn w-bot">▶||</div>
      <div class="center-btn"></div>
    </div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 3: Incoming Call ("Famous Pluto is Calling...")
// ─────────────────────────────────────────────────────────────────────────────
function htmlIncomingCall() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#050507;color:#fff;}
.bg{position:absolute;inset:-30px;background:url('${coverDataUrl}') center/cover;filter:blur(80px) brightness(0.28) saturate(1.8);transform:scale(1.2);}
.overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.6) 50%,#000 100%);}
.wrap{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:100px 70px 100px;}
.top-meta{text-align:center;}
.call-badge{font-size:32px;color:rgba(255,255,255,0.7);margin-bottom:14px;letter-spacing:0.05em;}
.caller-name{font-size:72px;font-weight:800;letter-spacing:-0.03em;margin-bottom:12px;line-height:1.1;}
.call-type{font-size:36px;color:#30d158;font-weight:600;}
/* Poster Cover Art */
.poster-art{width:780px;height:780px;border-radius:50%;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.85);border:6px solid rgba(255,255,255,0.2);}
.poster-art img{width:100%;height:100%;object-fit:cover;}
/* Middle Actions */
.mid-actions{width:100%;display:flex;justify-content:space-around;padding:0 40px;}
.act-btn{display:flex;flex-direction:column;align-items:center;gap:12px;color:rgba(255,255,255,0.75);font-size:26px;}
/* Call Buttons */
.call-row{width:100%;display:flex;justify-content:space-around;align-items:center;}
.btn-circle{width:170px;height:170px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 15px 40px rgba(0,0,0,0.5);}
.btn-decline{background:#ff453a;}
.btn-accept{background:#30d158;box-shadow:0 0 50px rgba(48,209,88,0.5);}
.btn-label{margin-top:16px;font-size:28px;font-weight:600;text-align:center;}
</style></head><body>
<div class="bg"></div><div class="overlay"></div>
<div class="wrap">
  <div class="top-meta">
    <div class="call-badge">Incoming Audio Call...</div>
    <div class="caller-name">${SONG.artist}</div>
    <div class="call-type">${SONG.title} (Single)</div>
  </div>
  <div class="poster-art"><img src="${coverDataUrl}" /></div>
  <div class="mid-actions">
    <div class="act-btn">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span>Remind Me</span>
    </div>
    <div class="act-btn">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Message</span>
    </div>
  </div>
  <div class="call-row">
    <div>
      <div class="btn-circle btn-decline">
        <svg width="70" height="70" viewBox="0 0 24 24" fill="white"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 11.36 11.36 0 0 0 3.56.57 2 2 0 0 1 2 2V20a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2h3.28a2 2 0 0 1 2 2 11.36 11.36 0 0 0 .57 3.56 2 2 0 0 1-.45 2.11z" transform="rotate(135 12 12)"/></svg>
      </div>
      <div class="btn-label" style="color:#ff453a;">Decline</div>
    </div>
    <div>
      <div class="btn-circle btn-accept">
        <svg width="70" height="70" viewBox="0 0 24 24" fill="white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </div>
      <div class="btn-label" style="color:#30d158;">Accept</div>
    </div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 4: 1995 VHS Camcorder Tape
// ─────────────────────────────────────────────────────────────────────────────
function htmlVHS() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'VT323',monospace;background:#050508;color:#e6e6e6;padding:80px 70px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
/* Scanlines */
.scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.3) 0px,rgba(0,0,0,0.3) 2px,transparent 2px,transparent 6px);pointer-events:none;z-index:10;}
.v-top{display:flex;justify-content:space-between;align-items:flex-start;font-size:52px;letter-spacing:0.08em;color:#00ff66;text-shadow:0 0 12px rgba(0,255,102,0.8);}
.rec-pulse{display:flex;align-items:center;gap:12px;color:#ff3333;text-shadow:0 0 12px rgba(255,51,51,0.8);}
.art-frame{width:940px;height:940px;margin:20px auto;border:4px solid rgba(255,255,255,0.25);position:relative;overflow:hidden;box-shadow:0 0 50px rgba(0,0,0,0.9);}
.art-frame img{width:100%;height:100%;object-fit:cover;filter:contrast(1.1) saturate(1.2);}
.vhs-noise{position:absolute;bottom:0;width:100%;height:40px;background:repeating-linear-gradient(90deg,#fff 0px,#000 4px,#fff 8px);opacity:0.25;}
.track-sec{margin:20px 0;}
.v-title{font-size:78px;letter-spacing:0.04em;line-height:1;margin-bottom:8px;color:#fff;}
.v-artist{font-size:52px;color:#aaa;}
.v-bot{display:flex;justify-content:space-between;align-items:flex-end;font-size:54px;color:#ffcc00;text-shadow:0 0 10px rgba(255,204,0,0.6);}
</style></head><body>
<div class="scanlines"></div>
<div class="v-top">
  <div>PLAY ▶ SP</div>
  <div class="rec-pulse">● REC 00:01:18</div>
</div>
<div class="art-frame">
  <img src="${coverDataUrl}" />
  <div class="vhs-noise"></div>
</div>
<div class="track-sec">
  <div class="v-title">${SONG.title}</div>
  <div class="v-artist">${SONG.artist}</div>
</div>
<div class="v-bot">
  <div>OCT. 24 1995<br/>11:42:08 PM</div>
  <div style="text-align:right;">CH-1 STEREO<br/>TAPE HI-FI</div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 5: Winamp / Windows 98 Retro
// ─────────────────────────────────────────────────────────────────────────────
function htmlWinamp() {
  const bars = [80,95,70,85,60,90,100,75,85,65,90,70,80,60,95,85];
  const eqHtml = bars.map(h => `<div style="flex:1;height:${h}%;background:linear-gradient(0deg,#00ff00 60%,#ffff00 85%,#ff0000 100%);"></div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Silkscreen&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Silkscreen',monospace;background:#008080;display:flex;justify-content:center;align-items:center;}
/* Classic Windows 98 Beveled Window */
.win{width:980px;background:#c0c0c0;border:4px solid #fff;border-right-color:#000;border-bottom-color:#000;box-shadow:0 40px 100px rgba(0,0,0,0.6);padding:6px;}
.title-bar{background:linear-gradient(90deg,#000080,#1084d0);padding:8px 12px;color:#fff;font-size:24px;display:flex;justify-content:space-between;align-items:center;font-weight:700;}
.win-btns{display:flex;gap:4px;}
.win-btn{width:28px;height:26px;background:#c0c0c0;border:2px solid #fff;border-right-color:#000;border-bottom-color:#000;color:#000;font-size:18px;display:flex;align-items:center;justify-content:center;}
/* Winamp Body */
.winamp{background:#1a1a24;border:3px solid #808080;border-right-color:#fff;border-bottom-color:#fff;padding:24px;color:#00ff00;margin-top:6px;}
.lcd-box{display:flex;justify-content:space-between;background:#000;border:2px solid #333;padding:16px 20px;border-radius:4px;margin-bottom:24px;}
.lcd-time{font-family:'VT323',monospace;font-size:72px;line-height:1;color:#00ff44;}
.lcd-spec{font-size:16px;color:#00bb22;line-height:1.4;text-align:right;}
.art-box{width:100%;height:780px;border:3px solid #00ff44;margin-bottom:24px;overflow:hidden;}
.art-box img{width:100%;height:100%;object-fit:cover;}
.eq-box{width:100%;height:90px;display:flex;align-items:flex-end;gap:6px;background:#000;padding:10px 16px;border:2px solid #333;margin-bottom:24px;}
.meta{font-size:24px;color:#fff;margin-bottom:20px;}
.btn-row{display:flex;justify-content:space-between;gap:8px;}
.w-btn-ctrl{flex:1;background:#c0c0c0;border:3px solid #fff;border-right-color:#000;border-bottom-color:#000;padding:16px 0;text-align:center;font-size:22px;color:#000;font-weight:700;}
</style></head><body>
<div class="win">
  <div class="title-bar">
    <span>WINAMP - ${SONG.artist} - ${SONG.title}</span>
    <div class="win-btns">
      <div class="win-btn">_</div>
      <div class="win-btn">□</div>
      <div class="win-btn">×</div>
    </div>
  </div>
  <div class="winamp">
    <div class="lcd-box">
      <div class="lcd-time">01:18</div>
      <div class="lcd-spec">320 KBPS<br/>44.1 KHZ<br/>STEREO</div>
    </div>
    <div class="art-box"><img src="${coverDataUrl}" /></div>
    <div class="eq-box">${eqHtml}</div>
    <div class="meta">
      <div style="color:#00ff44;margin-bottom:6px;">▶ 1. ${SONG.title}</div>
      <div style="color:#aaa;">ARTIST: ${SONG.artist}</div>
    </div>
    <div class="btn-row">
      <div class="w-btn-ctrl">|◀◀</div>
      <div class="w-btn-ctrl">▶</div>
      <div class="w-btn-ctrl">||</div>
      <div class="w-btn-ctrl">■</div>
      <div class="w-btn-ctrl">▶▶|</div>
      <div class="w-btn-ctrl">▲</div>
    </div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 6: Vinyl Record Store Receipt Slip
// ─────────────────────────────────────────────────────────────────────────────
function htmlReceipt() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=VT323&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Mono',monospace;background:#18181c;display:flex;justify-content:center;align-items:center;}
/* Thermal Paper Slip */
.receipt{width:920px;background:#f8f6f0;color:#111;padding:60px 50px;box-shadow:0 30px 100px rgba(0,0,0,0.85);border-radius:4px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.receipt-header{text-align:center;border-bottom:3px dashed #111;padding-bottom:28px;}
.r-store{font-size:36px;font-weight:700;letter-spacing:0.12em;}
.r-sub{font-size:22px;color:#555;margin-top:6px;}
.r-art{width:820px;height:820px;margin:30px auto;border:3px solid #111;overflow:hidden;}
.r-art img{width:100%;height:100%;object-fit:cover;display:block;}
.r-table{width:100%;border-top:3px dashed #111;border-bottom:3px dashed #111;padding:24px 0;margin:20px 0;}
.r-row{display:flex;justify-content:space-between;font-size:26px;margin:8px 0;}
.r-title{font-size:42px;font-weight:700;margin:12px 0 6px;}
.r-total{display:flex;justify-content:space-between;font-size:34px;font-weight:700;margin-top:16px;border-top:2px solid #111;padding-top:14px;}
.r-footer{text-align:center;margin-top:20px;}
.r-barcode{font-size:26px;letter-spacing:0.25em;font-weight:700;margin-top:14px;}
</style></head><body>
<div class="receipt">
  <div class="receipt-header">
    <div class="r-store">★ SOUND & VINYL ARCHIVE ★</div>
    <div class="r-sub">DIGITAL SINGLE RECEIPT // SLIP № 84920</div>
    <div style="font-size:20px;color:#666;margin-top:4px;">SATURDAY 26 SEP 2026 · 16:42 PM</div>
  </div>

  <div class="r-art"><img src="${coverDataUrl}" /></div>

  <div style="text-align:left;">
    <div style="font-size:22px;color:#666;">NOW PLAYING:</div>
    <div class="r-title">${SONG.title}</div>
    <div style="font-size:28px;color:#333;">${SONG.artist}</div>
  </div>

  <div class="r-table">
    <div class="r-row"><span>TRACK LENGTH</span><span>${SONG.duration}</span></div>
    <div class="r-row"><span>PLAYHEAD TIMECODE</span><span>${SONG.elapsed}</span></div>
    <div class="r-row"><span>MASTER AUDIO</span><span>24-BIT 96kHz</span></div>
    <div class="r-row"><span>GENRE</span><span>ALTERNATIVE / RAP</span></div>
    <div class="r-total"><span>TOTAL CHARGES</span><span>$0.00 (STREAM)</span></div>
  </div>

  <div class="r-footer">
    <div style="font-size:24px;font-weight:700;">*** THANK YOU FOR SUPPORTING MUSIC ***</div>
    <div class="r-barcode">|||| ||| ||||||| ||||| |||| ||||||</div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 7: 1980s Vintage Boombox / Ghetto Blaster
// ─────────────────────────────────────────────────────────────────────────────
function htmlBoombox() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Space+Grotesk:wght@700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:radial-gradient(circle at 50% 35%,#1c1c22 0%,#09090c 70%,#020203 100%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;}
.boombox{width:1000px;background:linear-gradient(180deg,#383842 0%,#1f1f26 40%,#121216 100%);border-radius:40px;border:6px solid #5a5a66;box-shadow:0 50px 140px rgba(0,0,0,0.95),inset 0 2px 10px rgba(255,255,255,0.25);padding:40px 36px;display:flex;flex-direction:column;align-items:center;}
/* Handle */
.handle{width:620px;height:70px;border:18px solid #4a4a56;border-bottom:none;border-radius:30px 30px 0 0;margin-bottom:-6px;box-shadow:0 -6px 20px rgba(0,0,0,0.5);}
/* Top Control Strip */
.top-strip{width:100%;display:flex;justify-content:space-between;align-items:center;background:#18181f;border:3px solid #333;border-radius:16px;padding:16px 28px;margin-bottom:30px;}
.knobs{display:flex;gap:20px;}
.knob{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,#888,#222);border:2px solid #aaa;box-shadow:0 4px 10px rgba(0,0,0,0.6);}
.led-disp{font-family:'VT323',monospace;font-size:38px;color:#ff3333;text-shadow:0 0 10px rgba(255,51,51,0.8);background:#000;padding:6px 20px;border-radius:8px;border:2px solid #444;}
/* Dual Analog VU Meters */
.meters-row{width:100%;display:flex;justify-content:space-around;margin-bottom:30px;}
.vu-meter{width:420px;height:140px;background:#fffae0;border:4px solid #222;border-radius:12px;box-shadow:inset 0 0 20px rgba(0,0,0,0.3);position:relative;overflow:hidden;padding:12px;}
.vu-scale{display:flex;justify-content:space-between;font-size:18px;color:#222;font-weight:800;}
.vu-needle{position:absolute;bottom:-30px;left:50%;width:4px;height:160px;background:#cc1111;transform-origin:bottom center;transform:rotate(18deg);box-shadow:0 0 6px rgba(0,0,0,0.5);}
/* Center Tape Deck with Cover Art & Speakers */
.speaker-stage{width:100%;display:flex;justify-content:space-between;align-items:center;}
.speaker{width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,#111 25%,#2a2a35 60%,#0a0a0f 100%);border:12px solid #3a3a46;box-shadow:inset 0 0 30px rgba(0,0,0,0.9),0 10px 25px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;}
.speaker-core{width:80px;height:80px;border-radius:50%;background:#000;border:3px solid #555;}
/* Deck Door with Cover Art */
.deck-door{width:400px;height:400px;background:#111;border:4px solid #4a4a58;border-radius:20px;box-shadow:inset 0 0 30px rgba(0,0,0,0.8);overflow:hidden;position:relative;}
.deck-door img{width:100%;height:100%;object-fit:cover;}
/* Info */
.info-box{margin-top:40px;text-align:center;}
.b-title{font-size:62px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;}
.b-artist{font-size:36px;color:#ffcc00;text-transform:uppercase;letter-spacing:0.1em;}
</style></head><body>
<div class="handle"></div>
<div class="boombox">
  <div class="top-strip">
    <div class="knobs"><div class="knob"></div><div class="knob"></div><div class="knob"></div></div>
    <div class="led-disp">FM 104.5 MHz • TAPE PLAY</div>
    <div class="led-disp" style="color:#00ff66;text-shadow:0 0 10px rgba(0,255,102,0.8);">01:18</div>
  </div>
  <div class="meters-row">
    <div class="vu-meter">
      <div class="vu-scale"><span>-20</span><span>-10</span><span>-5</span><span>0</span><span style="color:#cc1111;">+3dB</span></div>
      <div class="vu-needle"></div>
    </div>
    <div class="vu-meter">
      <div class="vu-scale"><span>-20</span><span>-10</span><span>-5</span><span>0</span><span style="color:#cc1111;">+3dB</span></div>
      <div class="vu-needle" style="transform:rotate(12deg);"></div>
    </div>
  </div>
  <div class="speaker-stage">
    <div class="speaker"><div class="speaker-core"></div></div>
    <div class="deck-door"><img src="${coverDataUrl}" /></div>
    <div class="speaker"><div class="speaker-core"></div></div>
  </div>
  <div class="info-box">
    <div class="b-title">${SONG.title}</div>
    <div class="b-artist">${SONG.artist}</div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 8: GameBoy Color / 8-Bit Pixel Player
// ─────────────────────────────────────────────────────────────────────────────
function htmlGameBoy() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Press Start 2P',monospace;background:#0d0d12;display:flex;justify-content:center;align-items:center;}
/* Atomic Purple Translucent Shell */
.gb-body{width:960px;height:1780px;background:linear-gradient(180deg,#6b3ba7 0%,#4a237a 60%,#341559 100%);border-radius:60px 60px 140px 60px;box-shadow:0 50px 140px rgba(0,0,0,0.9),inset 0 0 40px rgba(255,255,255,0.25);border:6px solid #824ec9;padding:60px 50px;display:flex;flex-direction:column;align-items:center;position:relative;}
/* Screen Bezel */
.screen-bezel{width:100%;height:840px;background:#2b2933;border-radius:30px 30px 80px 30px;box-shadow:inset 0 4px 15px rgba(0,0,0,0.8);padding:30px 40px;display:flex;flex-direction:column;align-items:center;}
.bezel-top{width:100%;display:flex;justify-content:space-between;align-items:center;font-size:18px;color:#8a8894;margin-bottom:20px;}
.batt-led{width:14px;height:14px;border-radius:50%;background:#ff2a2a;box-shadow:0 0 10px #ff2a2a;display:inline-block;margin-right:8px;}
/* Color LCD Screen */
.lcd-screen{width:760px;height:660px;background:#8fa876;border:6px solid #1a1a20;box-shadow:inset 0 0 20px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:24px 20px;color:#1a280c;}
.lcd-title{font-size:22px;line-height:1.4;text-align:center;}
.lcd-art{width:380px;height:380px;border:4px solid #1a280c;overflow:hidden;}
.lcd-art img{width:100%;height:100%;object-fit:cover;filter:contrast(1.2) brightness(0.9);}
.lcd-bar{width:100%;height:14px;background:#768d5f;border:2px solid #1a280c;border-radius:2px;}
.lcd-fill{width:${SONG.progressPct}%;height:100%;background:#1a280c;}
/* Controls Stage */
.controls-stage{width:100%;flex:1;display:flex;justify-content:space-between;align-items:center;padding:0 40px;margin-top:40px;}
/* D-Pad */
.d-pad{width:220px;height:220px;position:relative;}
.d-btn{background:#111;position:absolute;box-shadow:0 6px 15px rgba(0,0,0,0.6);}
.d-horiz{width:220px;height:72px;top:74px;border-radius:8px;}
.d-vert{width:72px;height:220px;left:74px;border-radius:8px;}
/* A/B Buttons */
.ab-btns{display:flex;gap:36px;transform:rotate(-25deg);margin-top:-30px;}
.round-action{width:110px;height:110px;border-radius:50%;background:#a81552;box-shadow:0 8px 20px rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;}
</style></head><body>
<div class="gb-body">
  <div class="screen-bezel">
    <div class="bezel-top">
      <div><span class="batt-led"></span>BATTERY</div>
      <div style="font-family:'Space Grotesk';font-weight:700;letter-spacing:0.1em;color:#f5a623;">COLOR</div>
    </div>
    <div class="lcd-screen">
      <div class="lcd-title">▶ NOW PLAYING</div>
      <div class="lcd-art"><img src="${coverDataUrl}" /></div>
      <div style="font-size:18px;text-align:center;">${SONG.title}<br/><span style="font-size:14px;opacity:0.8;">${SONG.artist}</span></div>
      <div class="lcd-bar"><div class="lcd-fill"></div></div>
      <div style="width:100%;display:flex;justify-content:space-between;font-size:14px;">
        <span>${SONG.elapsed}</span><span>${SONG.remaining}</span>
      </div>
    </div>
  </div>
  <div class="controls-stage">
    <div class="d-pad"><div class="d-btn d-horiz"></div><div class="d-btn d-vert"></div></div>
    <div class="ab-btns"><div class="round-action">B</div><div class="round-action">A</div></div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 9: Studio DAW / FL Studio & Ableton Mixer
// ─────────────────────────────────────────────────────────────────────────────
function htmlDAW() {
  const bars = [90,80,65,85,95,70,80,90,75,60,85,95,100,70,80,90];
  const meterHtml = bars.map(h => `<div style="flex:1;height:${h}%;background:linear-gradient(0deg,#22c55e 60%,#eab308 85%,#ef4444 100%);border-radius:2px;"></div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&family=Inter:wght@600;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'JetBrains Mono',monospace;background:#14171d;color:#e2e8f0;padding:70px 50px;display:flex;flex-direction:column;justify-content:space-between;}
.daw-header{display:flex;justify-content:space-between;align-items:center;background:#1e232d;border:2px solid #2d3545;border-radius:16px;padding:20px 28px;}
.daw-bpm{font-size:32px;font-weight:800;color:#38bdf8;}
.daw-art{width:980px;height:840px;border-radius:20px;overflow:hidden;border:3px solid #334155;box-shadow:0 30px 90px rgba(0,0,0,0.8);position:relative;}
.daw-art img{width:100%;height:100%;object-fit:cover;}
.daw-meta{margin:24px 0;}
.d-title{font-size:62px;font-weight:800;color:#fff;letter-spacing:-0.03em;margin-bottom:8px;}
.d-artist{font-size:36px;color:#94a3b8;}
/* Master Channel Peak Meter */
.meter-strip{width:100%;background:#1e232d;border:2px solid #2d3545;border-radius:18px;padding:24px 30px;}
.meter-top{display:flex;justify-content:space-between;font-size:22px;color:#94a3b8;margin-bottom:14px;font-weight:700;}
.meter-bars{width:100%;height:90px;display:flex;gap:6px;align-items:flex-end;background:#0f1319;border-radius:10px;padding:8px 12px;}
.spec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px;}
.spec-card{background:#1e232d;border:2px solid #2d3545;border-radius:12px;padding:16px;text-align:center;}
</style></head><body>
<div class="daw-header">
  <div class="daw-bpm">● 128.00 BPM · 4/4</div>
  <div style="font-size:24px;color:#22c55e;">MASTER: 0.0 dB</div>
</div>
<div class="daw-art"><img src="${coverDataUrl}" /></div>
<div class="daw-meta">
  <div class="d-title">${SONG.title}</div>
  <div class="d-artist">${SONG.artist}</div>
</div>
<div class="meter-strip">
  <div class="meter-top"><span>MASTER AUDIO SPECTRUM</span><span>${SONG.elapsed} / ${SONG.duration}</span></div>
  <div class="meter-bars">${meterHtml}</div>
</div>
<div class="spec-grid">
  <div class="spec-card"><div style="font-size:16px;color:#64748b;">FORMAT</div><div style="font-size:22px;font-weight:700;">32-BIT WAV</div></div>
  <div class="spec-card"><div style="font-size:16px;color:#64748b;">RATE</div><div style="font-size:22px;font-weight:700;">96.0 kHz</div></div>
  <div class="spec-card"><div style="font-size:16px;color:#64748b;">LATENCY</div><div style="font-size:22px;font-weight:700;">1.4 ms</div></div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Run Batch Renderer (All 9 Brand New Unique Concepts)
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Rendering ALL 9 Brand New Unique Concepts to 1080x1920 PNGs...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${WIDTH},${HEIGHT}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const concepts = [
    { name: '01_iphone_lockscreen.png', html: htmlLockScreen() },
    { name: '02_ipod_classic.png',      html: htmlIPod() },
    { name: '03_incoming_call.png',     html: htmlIncomingCall() },
    { name: '04_vhs_camcorder.png',     html: htmlVHS() },
    { name: '05_winamp_retro.png',      html: htmlWinamp() },
    { name: '06_vinyl_receipt.png',     html: htmlReceipt() },
    { name: '07_vintage_boombox.png',   html: htmlBoombox() },
    { name: '08_gameboy_color.png',     html: htmlGameBoy() },
    { name: '09_studio_daw.png',        html: htmlDAW() }
  ];

  for (const c of concepts) {
    const outPath = path.join(outDir, c.name);
    process.stdout.write(`  Rendering ${c.name}... `);
    await page.setContent(c.html, { waitUntil: 'domcontentloaded' });
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: outPath, type: 'png' });
    console.log('✓');
  }

  await browser.close();
  console.log('\nAll 9 concept images created in: ' + outDir);
}

main().catch(err => { console.error(err); process.exit(1); });
