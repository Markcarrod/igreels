// ─────────────────────────────────────────────────────────────────────────────
//  generate-extra-previews.js
//  Renders 3 brand new unique concepts with ZERO lyrics to 1080x1920 PNGs:
//    1. tachometer - Supercar Cockpit / Night Drift Dashboard
//    2. billboard  - 3D Cyber Times Square / Shibuya Curved LED Billboard
//    3. arcade     - Japanese Rhythm Game / Beatmania Cabinet
// ─────────────────────────────────────────────────────────────────────────────

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH  = 1080;
const HEIGHT = 1920;

const coverPath = path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/SpotifyVisualizer/bin/Release/net8.0/Assets/COVER.png");
const outDir = path.resolve(__dirname, 'ExtraTemplatesPreview');
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
//  CONCEPT 1: Supercar Cockpit / Night Drift Dashboard (Tachometer)
// ─────────────────────────────────────────────────────────────────────────────
function htmlTachometer() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Space+Grotesk:wght@500;700;800&family=JetBrains+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:#06070a;color:#fff;padding:60px 48px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}

/* Carbon-fiber subtle background */
.bg-grid{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(255,42,75,0.12) 0%,transparent 60%),radial-gradient(circle at 50% 80%,rgba(0,180,255,0.08) 0%,transparent 50%),repeating-linear-gradient(45deg,#07080c 0px,#07080c 4px,#0c0e14 4px,#0c0e14 8px);pointer-events:none;}

/* Top HUD telemetry bar */
.top-hud{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;background:rgba(18,22,30,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:18px 28px;font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:0.06em;}
.mode-badge{background:#ff2a4b;color:#fff;padding:4px 14px;border-radius:8px;font-weight:800;font-size:18px;box-shadow:0 0 16px rgba(255,42,75,0.6);}

/* Tachometer Gauge Section */
.tacho-wrap{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;margin-top:10px;}
.shift-lights{display:flex;gap:12px;margin-bottom:20px;}
.s-led{width:36px;height:12px;border-radius:4px;background:#222;}
.s-green{background:#00ff66;box-shadow:0 0 14px #00ff66;}
.s-amber{background:#ffbb00;box-shadow:0 0 14px #ffbb00;}
.s-red{background:#ff2a4b;box-shadow:0 0 18px #ff2a4b;}

.dial{width:680px;height:680px;border-radius:50%;background:radial-gradient(circle at center,#0c0f16 0%,#131824 60%,#090b10 100%);border:8px solid #202738;box-shadow:0 0 80px rgba(0,0,0,0.9),inset 0 0 40px rgba(0,0,0,0.8),0 0 30px rgba(255,42,75,0.25);position:relative;display:flex;align-items:center;justify-content:center;}
.dial-rim{position:absolute;inset:20px;border-radius:50%;border:2px dashed rgba(255,255,255,0.18);}

/* Radial numbers around tachometer */
.dial-scale{position:absolute;inset:36px;font-family:'Orbitron',sans-serif;font-weight:800;font-size:28px;}
.d-0{position:absolute;bottom:40px;left:70px;color:rgba(255,255,255,0.7);}
.d-2{position:absolute;top:160px;left:35px;color:rgba(255,255,255,0.7);}
.d-4{position:absolute;top:35px;left:180px;color:rgba(255,255,255,0.9);}
.d-6{position:absolute;top:35px;right:180px;color:rgba(255,255,255,0.9);}
.d-7{position:absolute;top:160px;right:35px;color:#ffbb00;}
.d-8{position:absolute;bottom:130px;right:45px;color:#ff2a4b;text-shadow:0 0 10px #ff2a4b;}
.d-9{position:absolute;bottom:40px;right:80px;color:#ff2a4b;text-shadow:0 0 10px #ff2a4b;}

/* Needle pointing to 7,400 RPM */
.needle{position:absolute;bottom:50%;left:50%;width:8px;height:270px;background:linear-gradient(180deg,#ff2a4b,#ff7b00);border-radius:4px;transform-origin:bottom center;transform:rotate(54deg);box-shadow:0 0 25px rgba(255,42,75,0.9);z-index:5;}

.dial-center{position:relative;z-index:6;width:260px;height:260px;border-radius:50%;background:#090b10;border:6px solid #283144;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,0.8);}
.gear{font-family:'Orbitron',sans-serif;font-size:68px;font-weight:900;color:#ff2a4b;line-height:1;text-shadow:0 0 20px rgba(255,42,75,0.7);}
.rpm-val{font-family:'Orbitron',sans-serif;font-size:30px;font-weight:700;color:#fff;margin-top:6px;}
.rpm-lbl{font-size:16px;color:#667085;letter-spacing:0.15em;font-weight:700;}

/* Infotainment Supercar Screen */
.info-card{position:relative;z-index:2;background:rgba(18,22,32,0.85);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.12);border-radius:32px;padding:32px 36px;box-shadow:0 30px 90px rgba(0,0,0,0.85);}
.info-row{display:flex;gap:30px;align-items:center;}
.info-art{width:220px;height:220px;border-radius:20px;overflow:hidden;border:2px solid rgba(255,255,255,0.2);box-shadow:0 15px 40px rgba(0,0,0,0.7);flex-shrink:0;}
.info-art img{width:100%;height:100%;object-fit:cover;display:block;}
.meta-box{flex:1;min-width:0;}
.song-title{font-size:46px;font-weight:800;letter-spacing:-0.02em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.song-artist{font-size:30px;color:rgba(255,255,255,0.65);margin-top:8px;}
.speed-pill{display:inline-flex;align-items:center;gap:10px;background:rgba(255,42,75,0.15);border:1px solid rgba(255,42,75,0.4);padding:6px 18px;border-radius:12px;margin-top:16px;font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;color:#ff2a4b;}

/* Lap Telemetry Progress Bar */
.prog-sec{margin-top:24px;}
.p-track{width:100%;height:10px;background:rgba(255,255,255,0.12);border-radius:5px;}
.p-fill{width:${SONG.progressPct}%;height:100%;background:linear-gradient(90deg,#ff7b00,#ff2a4b);border-radius:5px;box-shadow:0 0 16px rgba(255,42,75,0.8);}
.p-times{display:flex;justify-content:space-between;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:22px;color:rgba(255,255,255,0.55);}
</style></head><body>
<div class="bg-grid"></div>

<div class="top-hud">
  <div style="display:flex;align-items:center;gap:14px;">
    <span class="mode-badge">SPORT+</span>
    <span>TRACTION: TRACK</span>
  </div>
  <div>OIL: 215°F · BOOST: 1.45 BAR</div>
</div>

<div class="tacho-wrap">
  <div class="shift-lights">
    <div class="s-led s-green"></div>
    <div class="s-led s-green"></div>
    <div class="s-led s-green"></div>
    <div class="s-led s-amber"></div>
    <div class="s-led s-amber"></div>
    <div class="s-led s-red"></div>
    <div class="s-led s-red"></div>
  </div>

  <div class="dial">
    <div class="dial-rim"></div>
    <div class="dial-scale">
      <div class="d-0">0</div>
      <div class="d-2">2</div>
      <div class="d-4">4</div>
      <div class="d-6">6</div>
      <div class="d-7">7</div>
      <div class="d-8">8</div>
      <div class="d-9">9</div>
    </div>
    <div class="needle"></div>
    <div class="dial-center">
      <div class="gear">M6</div>
      <div class="rpm-val">7,420</div>
      <div class="rpm-lbl">RPM x1000</div>
    </div>
  </div>
</div>

<div class="info-card">
  <div class="info-row">
    <div class="info-art"><img src="${coverDataUrl}" /></div>
    <div class="meta-box">
      <div class="song-title">${SONG.title}</div>
      <div class="song-artist">${SONG.artist}</div>
      <div class="speed-pill">⚡ 185 MPH · V-MAX ACTIVE</div>
    </div>
  </div>
  <div class="prog-sec">
    <div class="p-track"><div class="p-fill"></div></div>
    <div class="p-times"><span>${SONG.elapsed}</span><span>${SONG.remaining}</span></div>
  </div>
</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 2: 3D Cyber Times Square / Shibuya Billboard
// ─────────────────────────────────────────────────────────────────────────────
function htmlBillboard() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&family=Inter:wght@600;700;800;900&family=Space+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#030408;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:70px 48px 60px;position:relative;}

/* Metropolis night city silhouette & atmospheric rain haze */
.bg-city{position:absolute;inset:0;background:radial-gradient(circle at 50% 20%,rgba(60,120,255,0.18) 0%,transparent 65%),radial-gradient(circle at 80% 80%,rgba(255,50,150,0.15) 0%,transparent 60%),linear-gradient(180deg,#020306 0%,#080d18 50%,#03050a 100%);pointer-events:none;}
.city-lights{position:absolute;bottom:0;width:100%;height:300px;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 20px,transparent 20px,transparent 40px);pointer-events:none;}

/* Billboard structural scaffold top bar */
.scaffold-top{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,0.15);padding-bottom:18px;}
.billboard-id{font-family:'Space Mono',monospace;font-size:22px;color:rgba(255,255,255,0.6);letter-spacing:0.15em;}
.beacon{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:700;color:#ff3b30;}
.beacon-dot{width:14px;height:14px;border-radius:50%;background:#ff3b30;box-shadow:0 0 14px #ff3b30;}

/* Massive Curved Anamorphic LED Billboard Screen */
.billboard-frame{position:relative;z-index:2;width:100%;height:1360px;border-radius:36px;border:8px solid #1a202c;background:#080b12;box-shadow:0 50px 160px rgba(0,0,0,0.95),0 0 80px rgba(79,172,254,0.25);overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;position:relative;}

/* LED screen background art */
.led-bg{position:absolute;inset:0;background:url('${coverDataUrl}') center/cover;filter:brightness(0.85) contrast(1.15);transform:scale(1.05);}
.led-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.3) 0px,rgba(0,0,0,0.3) 2px,transparent 2px,transparent 4px);pointer-events:none;}
.led-gradient{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.7) 75%,rgba(0,0,0,0.96) 100%);pointer-events:none;}

/* Anamorphic glass light sweep */
.light-sweep{position:absolute;inset:0;background:linear-gradient(135deg,transparent 0%,rgba(255,255,255,0.18) 35%,transparent 60%);pointer-events:none;}

/* Billboard on-screen branding */
.b-top-tag{position:relative;z-index:3;padding:40px 45px 0;}
.tag-badge{display:inline-block;background:#ffdd00;color:#000;font-weight:900;font-size:24px;padding:8px 24px;border-radius:8px;letter-spacing:0.1em;text-transform:uppercase;box-shadow:0 0 25px rgba(255,221,0,0.5);}

.b-center-content{position:relative;z-index:3;padding:0 45px 30px;}
.b-super-title{font-family:'Syne',sans-serif;font-size:82px;font-weight:900;letter-spacing:-0.03em;line-height:0.95;text-transform:uppercase;color:#fff;text-shadow:0 10px 40px rgba(0,0,0,0.9);}
.b-super-artist{font-size:42px;font-weight:800;color:#ffdd00;margin-top:14px;letter-spacing:0.02em;text-shadow:0 4px 20px rgba(0,0,0,0.9);}

.b-platforms{display:flex;gap:18px;margin-top:24px;}
.platform-pill{background:rgba(255,255,255,0.18);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.25);padding:10px 22px;border-radius:30px;font-size:20px;font-weight:700;}

/* Bottom Scrolling Marquee LED Ticker */
.ticker-strip{position:relative;z-index:3;background:#0d1117;border-top:3px solid #ffdd00;padding:20px 0;overflow:hidden;white-space:nowrap;}
.ticker-text{font-family:'Space Mono',monospace;font-size:26px;font-weight:700;color:#ffdd00;letter-spacing:0.12em;display:inline-block;}

/* Bottom ground view branding */
.bot-info{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:0 10px;font-size:22px;color:rgba(255,255,255,0.5);font-family:'Space Mono',monospace;}
</style></head><body>
<div class="bg-city"></div>
<div class="city-lights"></div>

<div class="scaffold-top">
  <div class="billboard-id">NYC TIMES SQUARE // SCREEN 04-A</div>
  <div class="beacon"><span class="beacon-dot"></span>LIVE BROADCAST</div>
</div>

<div class="billboard-frame">
  <div class="led-bg"></div>
  <div class="led-scanlines"></div>
  <div class="led-gradient"></div>
  <div class="light-sweep"></div>

  <div class="b-top-tag">
    <div class="tag-badge">★ WORLDWIDE PREMIERE ★</div>
  </div>

  <div class="b-center-content">
    <div class="b-super-title">${SONG.title}</div>
    <div class="b-super-artist">${SONG.artist}</div>
    <div class="b-platforms">
      <div class="platform-pill">SPOTIFY</div>
      <div class="platform-pill">APPLE MUSIC</div>
      <div class="platform-pill">YOUTUBE MUSIC</div>
    </div>
  </div>

  <div class="ticker-strip">
    <div class="ticker-text">
      ● STREAMING WORLDWIDE ON ALL MAJOR PLATFORMS • OVER 1.4M STREAMS • #1 NEW MUSIC TRENDING • ${SONG.artist} - ${SONG.title} • OUT NOW EVERYWHERE •
    </div>
  </div>
</div>

<div class="bot-info">
  <div>ANAMORPHIC 3D LED // 4K 120HZ</div>
  <div>GLOBAL MUSIC CAMPAIGN 2026</div>
</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONCEPT 3: Japanese Arcade Rhythm Game Cabinet (Beatmania Style)
// ─────────────────────────────────────────────────────────────────────────────
function htmlArcade() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@700;800;900&family=JetBrains+Mono:wght@800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:#06040a;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:50px 44px;position:relative;}

/* Arcade Neon Cabinet Outer Housing */
.arcade-body{position:relative;z-index:2;width:100%;height:100%;background:#100d18;border-radius:40px;border:8px solid #281e3d;box-shadow:0 0 100px rgba(180,0,255,0.35),inset 0 0 30px rgba(0,0,0,0.9);padding:30px;display:flex;flex-direction:column;justify-content:space-between;}

/* Cabinet Marquee Header */
.marquee-header{background:linear-gradient(90deg,#ff0077,#7700ff,#00f0ff);border-radius:18px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 0 30px rgba(255,0,119,0.5);border:3px solid #fff;}
.m-title{font-family:'Press Start 2P',monospace;font-size:22px;color:#fff;text-shadow:2px 2px 0px #000;}
.m-badge{background:#000;color:#00f0ff;padding:6px 14px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:20px;}

/* Main Screen Stage */
.screen-stage{width:100%;height:1240px;background:#05030a;border:6px solid #3d2b60;border-radius:24px;box-shadow:inset 0 0 50px rgba(0,0,0,0.9);overflow:hidden;padding:26px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}

/* Track Upper Card */
.track-card{display:flex;gap:26px;align-items:center;background:rgba(30,20,50,0.65);border:2px solid rgba(255,255,255,0.15);border-radius:20px;padding:18px;}
.art-thumb{width:180px;height:180px;border-radius:14px;overflow:hidden;border:3px solid #00f0ff;box-shadow:0 0 25px rgba(0,240,255,0.4);flex-shrink:0;}
.art-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.track-meta{flex:1;min-width:0;}
.t-title{font-size:42px;font-weight:900;line-height:1.15;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.t-artist{font-size:28px;color:#00f0ff;font-weight:700;margin-top:6px;}
.bpm-pill{display:inline-block;background:#ff0077;color:#fff;font-family:'JetBrains Mono';font-size:18px;font-weight:800;padding:4px 12px;border-radius:6px;margin-top:10px;}

/* Score & Combo HUD */
.score-hud{display:flex;justify-content:space-between;align-items:center;margin:15px 0;}
.combo-box{text-align:center;}
.perfect-tag{font-family:'Press Start 2P',monospace;font-size:32px;color:#ffdd00;text-shadow:0 0 20px #ffdd00;}
.combo-num{font-family:'Press Start 2P',monospace;font-size:44px;color:#fff;margin-top:8px;text-shadow:0 0 25px rgba(255,255,255,0.8);}
.score-box{text-align:right;}
.score-num{font-family:'Press Start 2P',monospace;font-size:28px;color:#00f0ff;text-shadow:0 0 15px #00f0ff;}

/* 3D Rhythm Highway */
.highway-wrap{flex:1;position:relative;perspective:400px;display:flex;justify-content:center;align-items:flex-end;overflow:hidden;border-bottom:4px solid #ff0077;margin-bottom:10px;}
.highway{width:860px;height:100%;transform:rotateX(30deg);transform-origin:bottom center;display:flex;border-left:4px solid #00f0ff;border-right:4px solid #00f0ff;background:linear-gradient(180deg,rgba(20,5,40,0.2) 0%,rgba(40,10,80,0.8) 100%);position:relative;}
.lane{flex:1;border-right:2px dashed rgba(255,255,255,0.18);position:relative;}
.lane:last-child{border-right:none;}

/* Falling Beat Notes */
.note-cyan{position:absolute;width:85%;height:32px;background:#00f0ff;border-radius:6px;left:7.5%;box-shadow:0 0 20px #00f0ff;}
.note-pink{position:absolute;width:85%;height:32px;background:#ff0077;border-radius:6px;left:7.5%;box-shadow:0 0 20px #ff0077;}
.note-yellow{position:absolute;width:85%;height:32px;background:#ffdd00;border-radius:6px;left:7.5%;box-shadow:0 0 20px #ffdd00;}

/* Glowing Strike / Hit Line */
.strike-line{position:absolute;bottom:10px;width:100%;height:10px;background:#fff;box-shadow:0 0 30px #fff,0 0 60px #ff0077;}

/* Arcade Mechanical Controls */
.controls-panel{background:#181324;border:3px solid #3d2b60;border-radius:20px;padding:24px 40px;display:flex;justify-content:space-between;align-items:center;}
.arcade-btn{width:90px;height:90px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.8),inset 0 4px 10px rgba(255,255,255,0.4);border:4px solid #fff;}
.btn-pink{background:#ff0077;box-shadow:0 0 30px #ff0077;}
.btn-blue{background:#00f0ff;box-shadow:0 0 30px #00f0ff;}
.btn-yellow{background:#ffdd00;box-shadow:0 0 30px #ffdd00;}
</style></head><body>
<div class="arcade-body">
  <div class="marquee-header">
    <div class="m-title">BEAT REVOLUTION</div>
    <div class="m-badge">STAGE 01 // EXTREME</div>
  </div>

  <div class="screen-stage">
    <div class="track-card">
      <div class="art-thumb"><img src="${coverDataUrl}" /></div>
      <div class="track-meta">
        <div class="t-title">${SONG.title}</div>
        <div class="t-artist">${SONG.artist}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
          <div class="bpm-pill">BPM 128.00</div>
          <div style="font-family:'JetBrains Mono';font-size:18px;color:#00f0ff;font-weight:700;">${SONG.elapsed} / ${SONG.duration}</div>
        </div>
        <div style="width:100%;height:6px;background:rgba(255,255,255,0.15);border-radius:3px;margin-top:10px;">
          <div style="width:${SONG.progressPct}%;height:100%;background:#00f0ff;border-radius:3px;box-shadow:0 0 10px #00f0ff;"></div>
        </div>
      </div>
    </div>

    <div class="score-hud">
      <div class="combo-box">
        <div class="perfect-tag">PERFECT!!</div>
        <div class="combo-num">154 COMBO</div>
      </div>
      <div class="score-box">
        <div style="font-size:18px;color:#aaa;margin-bottom:6px;">SCORE</div>
        <div class="score-num">098,420</div>
      </div>
    </div>

    <div class="highway-wrap">
      <div class="highway">
        <div class="lane">
          <div class="note-cyan" style="top:20%;"></div>
          <div class="note-cyan" style="top:75%;"></div>
        </div>
        <div class="lane">
          <div class="note-pink" style="top:45%;"></div>
        </div>
        <div class="lane">
          <div class="note-yellow" style="top:10%;"></div>
          <div class="note-yellow" style="top:60%;"></div>
        </div>
        <div class="lane">
          <div class="note-cyan" style="top:35%;"></div>
          <div class="note-pink" style="top:85%;"></div>
        </div>
      </div>
      <div class="strike-line"></div>
    </div>
  </div>

  <div class="controls-panel">
    <div class="arcade-btn btn-pink"></div>
    <div class="arcade-btn btn-blue"></div>
    <div class="arcade-btn btn-yellow"></div>
    <div class="arcade-btn btn-blue"></div>
    <div class="arcade-btn btn-pink"></div>
  </div>
</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Run Batch Renderer
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Rendering 3 Extra Unique Viral Concepts to 1080x1920 PNGs...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${WIDTH},${HEIGHT}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const concepts = [
    { name: '01_supercar_tachometer.png', html: htmlTachometer() },
    { name: '02_times_square_billboard.png', html: htmlBillboard() },
    { name: '03_japanese_arcade_rhythm.png', html: htmlArcade() }
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
  console.log('\nAll 3 extra concept images created in: ' + outDir);
}

main().catch(err => { console.error(err); process.exit(1); });
