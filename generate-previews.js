// ─────────────────────────────────────────────────────────────────────────────
//  generate-previews.js
//  Renders all 7 alternative music agency templates to 1080x1920 PNG images
//  using the user's real COVER.png and song metadata.
// ─────────────────────────────────────────────────────────────────────────────

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH  = 1080;
const HEIGHT = 1920;

const coverPath = path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/SpotifyVisualizer/bin/Release/net8.0/Assets/COVER.png");
const outDir = path.resolve(__dirname, 'TemplatesPreview');
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
  bpm: '128',
  key: 'D Minor',
  year: '2026'
};

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 1: Apple Music (iOS 18 Glassmorphism)
// ─────────────────────────────────────────────────────────────────────────────
function tplAppleMusic() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Inter', -apple-system, sans-serif; background:#000; position:relative;
}
.bg-ambient {
  position:absolute; inset:-40px;
  background: url('${coverDataUrl}') center/cover no-repeat;
  filter: blur(90px) brightness(0.45) saturate(2.2);
  transform: scale(1.15);
}
.bg-gradient {
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.92) 100%);
}
.container {
  position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  padding: 85px 60px 60px;
}
.top-grabber {
  width: 72px; height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px;
  margin-bottom: 45px;
}
.album-card {
  width: 960px; height: 960px; border-radius: 36px; overflow:hidden;
  box-shadow: 0 45px 120px rgba(0,0,0,0.75), 0 15px 40px rgba(0,0,0,0.45);
  margin-bottom: 50px;
}
.album-card img { width:100%; height:100%; object-fit:cover; display:block; }
.info-row {
  width: 100%; display:flex; justify-content:space-between; align-items:center;
  margin-bottom: 24px;
}
.song-title {
  color: #fff; font-size: 54px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15;
}
.song-artist {
  color: rgba(255,255,255,0.75); font-size: 38px; font-weight: 500; margin-top: 8px;
}
.star-btn {
  width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.14);
  display:flex; align-items:center; justify-content:center;
}
.badges-row {
  width: 100%; display:flex; gap: 14px; margin-bottom: 40px;
}
.badge {
  background: rgba(255,255,255,0.15); backdrop-filter: blur(20px);
  padding: 6px 16px; border-radius: 8px; color: rgba(255,255,255,0.9);
  font-size: 20px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
}
.progress-wrap { width:100%; margin-bottom: 55px; }
.progress-bar {
  width: 100%; height: 8px; background: rgba(255,255,255,0.22); border-radius: 4px;
  position:relative;
}
.progress-fill {
  width: ${SONG.progressPct}%; height: 100%; background: #fff; border-radius: 4px;
}
.time-row {
  display:flex; justify-content:space-between; margin-top: 14px;
  color: rgba(255,255,255,0.55); font-size: 26px; font-weight: 500;
}
.controls {
  width: 100%; display:flex; justify-content:space-around; align-items:center;
  margin-bottom: 55px;
}
.ctrl-icon { display:flex; align-items:center; justify-content:center; }
.volume-row {
  width: 100%; display:flex; align-items:center; gap: 24px;
  padding: 0 10px; margin-bottom: 45px;
}
.volume-bar {
  flex: 1; height: 10px; background: rgba(255,255,255,0.22); border-radius: 5px;
  position:relative;
}
.volume-fill {
  width: 68%; height:100%; background: rgba(255,255,255,0.85); border-radius: 5px;
}
.bottom-actions {
  width: 100%; display:flex; justify-content:space-around; align-items:center;
  opacity: 0.85;
}
</style>
</head>
<body>
<div class="bg-ambient"></div>
<div class="bg-gradient"></div>
<div class="container">
  <div class="top-grabber"></div>
  <div class="album-card">
    <img src="${coverDataUrl}" />
  </div>
  <div class="info-row">
    <div>
      <div class="song-title">${SONG.title}</div>
      <div class="song-artist">${SONG.artist}</div>
    </div>
    <div class="star-btn">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </div>
  </div>
  <div class="badges-row">
    <span class="badge">Lossless</span>
    <span class="badge">Dolby Atmos</span>
    <span class="badge">Apple Digital Master</span>
  </div>
  <div class="progress-wrap">
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div class="time-row">
      <span>${SONG.elapsed}</span>
      <span>${SONG.remaining}</span>
    </div>
  </div>
  <div class="controls">
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white">
      <polygon points="19 20 9 12 19 4"/>
      <line x1="5" y1="19" x2="5" y2="5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <svg width="88" height="88" viewBox="0 0 24 24" fill="white">
      <rect x="5" y="3" width="5" height="18" rx="2"/>
      <rect x="14" y="3" width="5" height="18" rx="2"/>
    </svg>
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white">
      <polygon points="5 4 15 12 5 20"/>
      <line x1="19" y1="5" x2="19" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="volume-row">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    </svg>
    <div class="volume-bar">
      <div class="volume-fill"></div>
    </div>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  </div>
  <div class="bottom-actions">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/>
      <polygon points="12 15 17 21 7 21 12 15"/>
    </svg>
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 2: Spinning Vinyl Record & Sleeve
// ─────────────────────────────────────────────────────────────────────────────
function tplVinylRecord() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Space Grotesk', sans-serif;
  background: radial-gradient(circle at 50% 40%, #1e1b18 0%, #0d0c0a 70%, #050504 100%);
  position:relative; color:#fff;
}
.wood-texture {
  position:absolute; inset:0; opacity:0.18;
  background: radial-gradient(ellipse at 50% 30%, rgba(255,200,150,0.15) 0%, transparent 60%);
}
.header-badge {
  text-align:center; padding-top:80px; letter-spacing:0.25em; font-size:24px;
  color: rgba(255,255,255,0.5); text-transform:uppercase; font-weight:700;
}
/* Vinyl Player Composition */
.turntable-stage {
  position:relative; width: 1000px; height: 960px; margin: 40px auto 0;
  display:flex; justify-content:center; align-items:center;
}
/* Realistic Vinyl Disc */
.vinyl-disc {
  width: 820px; height: 820px; border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #111 0px,
    #111 2px,
    #181818 3px,
    #0d0d0d 5px
  );
  box-shadow: 0 40px 100px rgba(0,0,0,0.9), inset 0 0 10px rgba(255,255,255,0.1);
  position:relative; display:flex; align-items:center; justify-content:center;
}
/* Grooves Sheen highlight */
.vinyl-disc::before {
  content:''; position:absolute; inset:0; border-radius:50%;
  background: conic-gradient(
    from 45deg,
    transparent 0deg,
    rgba(255,255,255,0.08) 45deg,
    transparent 90deg,
    rgba(255,255,255,0.08) 135deg,
    transparent 180deg,
    rgba(255,255,255,0.08) 225deg,
    transparent 270deg,
    rgba(255,255,255,0.08) 315deg,
    transparent 360deg
  );
}
.vinyl-label {
  width: 320px; height: 320px; border-radius: 50%; overflow:hidden;
  border: 12px solid #000; position:relative; z-index:2;
  box-shadow: 0 0 20px rgba(0,0,0,0.8);
}
.vinyl-label img { width:100%; height:100%; object-fit:cover; }
.spindle-hole {
  position:absolute; width: 34px; height: 34px; border-radius: 50%;
  background: #000; border: 4px solid #333; z-index: 3;
}
/* Tonearm */
.tonearm {
  position:absolute; top: -20px; right: 40px; width: 180px; height: 500px;
  pointer-events:none; z-index: 10;
}
.tonearm-head {
  position:absolute; bottom: 40px; left: 10px; width: 44px; height: 75px;
  background: #2a2a2a; border-radius: 4px; transform: rotate(24deg);
  box-shadow: 0 10px 25px rgba(0,0,0,0.8); border: 1px solid #444;
}
.tonearm-rod {
  position:absolute; top: 40px; right: 40px; width: 8px; height: 420px;
  background: linear-gradient(90deg, #888, #ddd, #666);
  transform: rotate(-15deg); transform-origin: top right;
  border-radius: 4px; box-shadow: 2px 2px 10px rgba(0,0,0,0.5);
}
.tonearm-base {
  position:absolute; top: 10px; right: 20px; width: 70px; height: 70px;
  border-radius: 50%; background: radial-gradient(circle, #555, #222);
  border: 2px solid #666; box-shadow: 0 8px 20px rgba(0,0,0,0.7);
}

/* Info Section */
.track-info {
  margin-top: 60px; text-align:center; padding: 0 60px;
}
.vinyl-rpm {
  display:inline-block; padding: 6px 18px; border: 1px solid rgba(255,200,120,0.4);
  color: #ffc878; font-size: 20px; border-radius: 50px; letter-spacing: 0.15em;
  margin-bottom: 25px; text-transform:uppercase; font-weight:700;
}
.track-title {
  font-family: 'Cinzel', serif; font-size: 64px; font-weight:700;
  letter-spacing: 0.04em; margin-bottom: 12px; color: #fff;
}
.track-artist {
  font-size: 38px; color: rgba(255,255,255,0.65); letter-spacing: 0.08em;
  text-transform: uppercase;
}
/* Progress Scrubber */
.timeline {
  width: 960px; margin: 60px auto 0;
}
.timeline-bar {
  width: 100%; height: 6px; background: rgba(255,255,255,0.18); border-radius: 3px;
  position:relative;
}
.timeline-fill {
  width: ${SONG.progressPct}%; height:100%; background: #ffc878; border-radius:3px;
}
.timeline-times {
  display:flex; justify-content:space-between; margin-top: 18px;
  color: rgba(255,255,255,0.45); font-size: 26px;
}
</style>
</head>
<body>
<div class="wood-texture"></div>
<div class="header-badge">Audiophile Analog Master • 33 ⅓ RPM</div>

<div class="turntable-stage">
  <div class="vinyl-disc">
    <div class="vinyl-label">
      <img src="${coverDataUrl}" />
    </div>
    <div class="spindle-hole"></div>
  </div>
  <div class="tonearm">
    <div class="tonearm-base"></div>
    <div class="tonearm-rod"></div>
    <div class="tonearm-head"></div>
  </div>
</div>

<div class="track-info">
  <div class="vinyl-rpm">Side A • High Fidelity Stereo</div>
  <div class="track-title">${SONG.title}</div>
  <div class="track-artist">${SONG.artist}</div>
</div>

<div class="timeline">
  <div class="timeline-bar">
    <div class="timeline-fill"></div>
  </div>
  <div class="timeline-times">
    <span>${SONG.elapsed}</span>
    <span>${SONG.remaining}</span>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 3: Night Drive / CarPlay Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function tplCarPlay() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Inter', sans-serif; background:#08090c; position:relative; color:#fff;
}
/* Moody Night Highway / City Bokeh Windshield */
.windshield-bg {
  position:absolute; inset:0;
  background:
    radial-gradient(circle at 20% 25%, rgba(255,100,50,0.3) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(50,150,255,0.3) 0%, transparent 45%),
    radial-gradient(circle at 50% 10%, rgba(255,255,180,0.2) 0%, transparent 35%),
    linear-gradient(180deg, #050608 0%, #0a0d14 45%, #050608 100%);
  filter: blur(10px);
}
.car-rain-overlay {
  position:absolute; inset:0;
  background: repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 3px, transparent 15px);
}
.car-status-bar {
  position:relative; z-index:2; display:flex; justify-content:space-between; align-items:center;
  padding: 80px 70px 30px; font-family:'JetBrains Mono', monospace; font-size: 26px;
  color: rgba(255,255,255,0.7);
}
.car-status-left { display:flex; align-items:center; gap: 18px; font-weight:700; color:#fff; font-size: 32px; }
.car-dash-frame {
  position:relative; z-index:2; width: 980px; margin: 40px auto 0;
  background: rgba(18, 22, 32, 0.75); backdrop-filter: blur(40px);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 40px;
  padding: 60px 50px; box-shadow: 0 40px 120px rgba(0,0,0,0.85);
}
.car-cover {
  width: 880px; height: 880px; border-radius: 28px; overflow:hidden;
  margin: 0 auto 50px; box-shadow: 0 30px 80px rgba(0,0,0,0.7);
}
.car-cover img { width:100%; height:100%; object-fit:cover; display:block; }
.car-meta { margin-bottom: 45px; }
.car-title { font-size: 60px; font-weight: 800; letter-spacing:-0.02em; line-height:1.1; margin-bottom: 12px; }
.car-artist { font-size: 38px; color: rgba(255,255,255,0.65); font-weight: 500; }
.car-progress-wrap { margin-bottom: 50px; }
.car-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.18); border-radius: 4px; }
.car-fill { width: ${SONG.progressPct}%; height: 100%; background: #3b82f6; border-radius: 4px; box-shadow: 0 0 16px rgba(59,130,246,0.6); }
.car-times { display:flex; justify-content:space-between; margin-top: 14px; font-size: 26px; color: rgba(255,255,255,0.5); }
.car-controls {
  display:flex; justify-content:space-between; align-items:center; padding: 0 40px;
}
.car-mode-badge {
  text-align:center; margin-top: 60px; font-size: 22px; letter-spacing: 0.2em;
  color: rgba(255,255,255,0.4); text-transform:uppercase; font-weight: 600;
}
</style>
</head>
<body>
<div class="windshield-bg"></div>
<div class="car-rain-overlay"></div>

<div class="car-status-bar">
  <div class="car-status-left">
    <span>11:42 PM</span>
    <span style="font-size: 22px; color: #3b82f6;">● NIGHT DRIVE</span>
  </div>
  <div>72°F · 5G · 98%</div>
</div>

<div class="car-dash-frame">
  <div class="car-cover">
    <img src="${coverDataUrl}" />
  </div>
  <div class="car-meta">
    <div class="car-title">${SONG.title}</div>
    <div class="car-artist">${SONG.artist}</div>
  </div>
  <div class="car-progress-wrap">
    <div class="car-bar"><div class="car-fill"></div></div>
    <div class="car-times">
      <span>${SONG.elapsed}</span>
      <span>${SONG.remaining}</span>
    </div>
  </div>
  <div class="car-controls">
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white">
      <polygon points="19 20 9 12 19 4"/>
      <line x1="5" y1="19" x2="5" y2="5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <svg width="90" height="90" viewBox="0 0 24 24" fill="white">
      <rect x="5" y="3" width="5" height="18" rx="2"/>
      <rect x="14" y="3" width="5" height="18" rx="2"/>
    </svg>
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white">
      <polygon points="5 4 15 12 5 20"/>
      <line x1="19" y1="5" x2="19" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  </div>
</div>
<div class="car-mode-badge">Apple CarPlay • In-Dash Media</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 4: Retro Cassette Tape (90s Mixtape)
// ─────────────────────────────────────────────────────────────────────────────
function tplCassette() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;600;800&family=VT323&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Inter', sans-serif;
  background: radial-gradient(circle at 50% 35%, #2a1b18 0%, #120c0a 65%, #050303 100%);
  position:relative; color:#fff; display:flex; flex-direction:column; align-items:center;
}
.vibe-tag {
  margin-top: 80px; font-family:'VT323', monospace; font-size: 38px; color: #ff6b4a;
  letter-spacing: 0.15em; text-transform:uppercase;
}
/* Clear Vintage Cassette Body */
.cassette-body {
  width: 980px; height: 630px; margin-top: 60px;
  background: rgba(30, 25, 25, 0.85); backdrop-filter: blur(15px);
  border: 4px solid #4a3c39; border-radius: 36px; position:relative;
  box-shadow: 0 40px 100px rgba(0,0,0,0.9), inset 0 0 30px rgba(255,255,255,0.08);
  padding: 30px;
}
.screws {
  position:absolute; width: 16px; height: 16px; border-radius: 50%;
  background: #665; border: 1px solid #998;
}
.s-tl { top: 20px; left: 20px; }
.s-tr { top: 20px; right: 20px; }
.s-bl { bottom: 20px; left: 20px; }
.s-br { bottom: 20px; right: 20px; }

/* White Mixtape Sticker Label */
.tape-label {
  width: 100%; height: 380px; background: #e8e3d5; border-radius: 18px;
  position:relative; overflow:hidden; border: 2px solid #b5ad98;
  display:flex; flex-direction:column; justify-content:space-between;
  padding: 24px 32px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.15);
}
.label-top {
  display:flex; justify-content:space-between; align-items:center;
  color: #8b2500; font-weight:800; font-size: 24px; letter-spacing: 0.1em;
}
.handwritten-title {
  font-family: 'Caveat', cursive; color: #1a1a2e; font-size: 64px;
  line-height: 1; margin: 6px 0; font-weight: 700;
}
.handwritten-artist {
  font-family: 'Caveat', cursive; color: #444; font-size: 42px; line-height: 1;
}
/* Center Transparent Window with Magnetic Spools */
.window-cutout {
  width: 580px; height: 140px; margin: 0 auto;
  background: #110d0c; border: 3px solid #6b5c58; border-radius: 16px;
  display:flex; justify-content:space-around; align-items:center; position:relative;
}
.spool {
  width: 90px; height: 90px; border-radius: 50%; background: #e8e3d5;
  border: 8px solid #b5ad98; display:flex; align-items:center; justify-content:center;
}
.spool-teeth {
  width: 32px; height: 32px; background: #110d0c; border-radius: 50%;
  border: 4px dashed #666;
}
.tape-film {
  position:absolute; width: 340px; height: 60px;
  background: linear-gradient(90deg, #3d261a, #523524, #3d261a);
  border-radius: 4px; z-index:0;
}
/* Small Album Cover Thumbnail Badge */
.cover-stamp {
  position:absolute; right: 28px; bottom: 20px; width: 110px; height: 110px;
  border-radius: 12px; overflow:hidden; border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.cover-stamp img { width:100%; height:100%; object-fit:cover; }

/* Lower Player Controls */
.mixtape-meta {
  width: 980px; margin-top: 80px; text-align:center;
}
.big-title { font-size: 68px; font-weight:800; letter-spacing:-0.02em; margin-bottom: 10px; }
.big-artist { font-size: 40px; color: rgba(255,255,255,0.65); }
.tape-progress-wrap { width: 980px; margin-top: 60px; }
.tape-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; }
.tape-fill { width: ${SONG.progressPct}%; height: 100%; background: #ff6b4a; border-radius: 4px; }
.tape-times { display:flex; justify-content:space-between; margin-top: 16px; font-size: 28px; color: rgba(255,255,255,0.5); }
</style>
</head>
<body>
<div class="vibe-tag">● TDK HIGH POSITION TYPE II • C-90</div>

<div class="cassette-body">
  <div class="screws s-tl"></div><div class="screws s-tr"></div>
  <div class="screws s-bl"></div><div class="screws s-br"></div>
  
  <div class="tape-label">
    <div class="label-top">
      <span>SIDE A · STEREO</span>
      <span>DOLBY B-C NR</span>
    </div>
    <div>
      <div class="handwritten-title">${SONG.title}</div>
      <div class="handwritten-artist">${SONG.artist}</div>
    </div>
    <div class="window-cutout">
      <div class="tape-film"></div>
      <div class="spool"><div class="spool-teeth"></div></div>
      <div class="spool"><div class="spool-teeth"></div></div>
    </div>
    <div class="cover-stamp"><img src="${coverDataUrl}" /></div>
  </div>
</div>

<div class="mixtape-meta">
  <div class="big-title">${SONG.title}</div>
  <div class="big-artist">${SONG.artist}</div>
</div>

<div class="tape-progress-wrap">
  <div class="tape-bar"><div class="tape-fill"></div></div>
  <div class="tape-times">
    <span>${SONG.elapsed}</span>
    <span>${SONG.remaining}</span>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 5: Y2K CD Jewel Case (Clear Acrylic Disc Case)
// ─────────────────────────────────────────────────────────────────────────────
function tplCDJewelCase() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Space+Mono:wght@700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Inter', sans-serif;
  background: radial-gradient(circle at 50% 35%, #181c24 0%, #0a0c10 70%, #030406 100%);
  position:relative; color:#fff; display:flex; flex-direction:column; align-items:center;
}
.header-cd {
  margin-top: 80px; font-family:'Space Mono', monospace; font-size: 24px;
  color: rgba(255,255,255,0.45); letter-spacing: 0.25em; text-transform:uppercase;
}
/* Transparent Acrylic Jewel Case Container */
.jewel-case {
  width: 960px; height: 960px; margin-top: 40px; position:relative;
  background: rgba(255,255,255,0.04);
  border: 8px solid rgba(255,255,255,0.22); border-radius: 12px;
  box-shadow: 0 50px 140px rgba(0,0,0,0.9), inset 0 0 20px rgba(255,255,255,0.15);
  display:flex; overflow:hidden;
}
/* Left Ribbed Spine */
.case-spine {
  width: 70px; height: 100%; background: rgba(255,255,255,0.08);
  border-right: 4px solid rgba(255,255,255,0.25);
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 6px, transparent 6px, transparent 14px);
}
.case-art-area {
  flex: 1; height: 100%; position:relative; overflow:hidden;
}
.case-art-area img { width:100%; height:100%; object-fit:cover; display:block; }
/* Glass Reflection Sheen across the case */
.glass-shine {
  position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 30%, transparent 60%);
  pointer-events:none;
}
.hologram-seal {
  position:absolute; top: 30px; right: 30px; padding: 8px 16px;
  background: repeating-linear-gradient(45deg, #f093fb, #f5576c, #4facfe, #00f2fe);
  border-radius: 6px; font-size: 16px; font-weight:900; color:#000;
  letter-spacing: 0.1em; box-shadow: 0 4px 15px rgba(0,0,0,0.4);
}
/* Info */
.cd-info {
  width: 960px; margin-top: 60px;
}
.cd-title { font-size: 64px; font-weight:900; letter-spacing:-0.02em; margin-bottom: 10px; }
.cd-artist { font-size: 40px; color: rgba(255,255,255,0.65); font-weight:500; }
.cd-progress { margin-top: 50px; }
.cd-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.18); border-radius: 4px; }
.cd-fill { width: ${SONG.progressPct}%; height:100%; background: #4facfe; border-radius: 4px; box-shadow: 0 0 20px #00f2fe; }
.cd-times { display:flex; justify-content:space-between; margin-top: 14px; font-size: 26px; color: rgba(255,255,255,0.5); }
</style>
</head>
<body>
<div class="header-cd">COMPACT DISC DIGITAL AUDIO • ORIGINAL MASTER</div>

<div class="jewel-case">
  <div class="case-spine"></div>
  <div class="case-art-area">
    <img src="${coverDataUrl}" />
    <div class="glass-shine"></div>
    <div class="hologram-seal">GENUINE Y2K AUDIO</div>
  </div>
</div>

<div class="cd-info">
  <div class="cd-title">${SONG.title}</div>
  <div class="cd-artist">${SONG.artist}</div>
  <div class="cd-progress">
    <div class="cd-bar"><div class="cd-fill"></div></div>
    <div class="cd-times">
      <span>${SONG.elapsed}</span>
      <span>${SONG.remaining}</span>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 6: SoundCloud Waveform Visualizer
// ─────────────────────────────────────────────────────────────────────────────
function tplSoundCloud() {
  // Generate waveform bars heights
  const bars = [15,22,45,60,85,90,70,55,40,65,95,100,80,60,45,75,90,65,50,70,85,90,100,75,60,50,80,95,70,55,40,60,75,90,85,70,50,30,55,75,90,95,80,60,40,30,45,65,80,95,85,70,55,40,60,80,90,75,60,40];
  const barHtml = bars.map((h, i) => {
    const isPlayed = (i / bars.length) * 100 <= SONG.progressPct;
    const bg = isPlayed ? '#ff5500' : 'rgba(255,255,255,0.25)';
    return `<div style="flex:1; height:${h}%; background:${bg}; border-radius:3px;"></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Inter', sans-serif; background:#111; position:relative; color:#fff;
  padding: 80px 60px; display:flex; flex-direction:column; justify-content:space-between;
}
.sc-header {
  display:flex; justify-content:space-between; align-items:center;
}
.sc-logo { font-size: 38px; font-weight: 900; color: #ff5500; letter-spacing: -0.03em; }
.sc-tag { background: rgba(255,85,0,0.18); color: #ff5500; padding: 6px 18px; border-radius: 20px; font-weight:700; font-size: 20px; }
.sc-art {
  width: 960px; height: 960px; border-radius: 20px; overflow:hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.8); margin: 30px 0;
}
.sc-art img { width:100%; height:100%; object-fit:cover; display:block; }
.sc-meta { margin-bottom: 30px; }
.sc-title { font-size: 64px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 12px; }
.sc-artist { font-size: 40px; color: rgba(255,255,255,0.7); font-weight: 500; }
/* Prominent Audio Waveform Graph */
.waveform-box {
  width: 100%; height: 160px; display:flex; align-items:flex-end; gap: 6px;
  background: rgba(0,0,0,0.4); border-radius: 16px; padding: 20px 24px;
  margin-bottom: 20px;
}
.waveform-times {
  display:flex; justify-content:space-between; font-size: 26px; color: rgba(255,255,255,0.5);
  font-weight: 600;
}
/* Engagement stats */
.sc-stats {
  display:flex; gap: 36px; margin-top: 30px;
}
.stat-pill {
  display:flex; align-items:center; gap: 10px; font-size: 24px; color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.08); padding: 10px 20px; border-radius: 50px;
}
</style>
</head>
<body>
<div class="sc-header">
  <div style="display:flex;align-items:center;gap:12px;font-size:24px;font-weight:700;color:#ff5500;letter-spacing:0.1em;">
    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff5500;"></span>
    <span>AUDIO WAVEFORM VISUALIZER</span>
  </div>
  <div style="background:rgba(255,85,0,0.14);color:#ff5500;padding:6px 18px;border-radius:20px;font-weight:700;font-size:20px;">320 KBPS HQ</div>
</div>

<div class="sc-art">
  <img src="${coverDataUrl}" />
</div>

<div class="sc-meta">
  <div class="sc-title">${SONG.title}</div>
  <div class="sc-artist">${SONG.artist}</div>
</div>

<div style="margin-bottom:40px;">
  <div class="waveform-box">${barHtml}</div>
  <div class="waveform-times">
    <span style="color:#ff5500;">${SONG.elapsed}</span>
    <span>${SONG.duration}</span>
  </div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE 7: Swiss Graphic Design Poster / Curator Print
// ─────────────────────────────────────────────────────────────────────────────
function tplGraphicPoster() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&family=Inter:wght@400;500;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden;
  font-family:'Space Grotesk', sans-serif;
  background: #f4efe6; color: #161513; position:relative;
  padding: 80px 70px; display:flex; flex-direction:column; justify-content:space-between;
}
.paper-texture {
  position:absolute; inset:0;
  background-image: radial-gradient(rgba(0,0,0,0.06) 1px, transparent 0);
  background-size: 24px 24px; pointer-events:none;
}
.poster-top {
  display:flex; justify-content:space-between; align-items:flex-start;
  border-bottom: 3px solid #161513; padding-bottom: 24px;
}
.poster-catalog { font-size: 24px; font-weight:700; letter-spacing: 0.1em; }
.poster-issue { font-size: 24px; font-weight:700; color: #e63946; }
.poster-frame {
  width: 940px; height: 940px; border: 3px solid #161513;
  box-shadow: 18px 18px 0px #161513; margin: 30px 0; overflow:hidden;
}
.poster-frame img { width:100%; height:100%; object-fit:cover; display:block; }
.poster-meta { margin-bottom: 20px; }
.poster-title {
  font-family:'Syne', sans-serif; font-size: 78px; font-weight:800;
  letter-spacing: -0.04em; line-height: 0.95; margin-bottom: 12px;
}
.poster-artist {
  font-size: 40px; font-weight: 700; color: #e63946; text-transform: uppercase;
}
/* Production Spec Grid */
.poster-grid {
  display:grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  border-top: 3px solid #161513; border-bottom: 3px solid #161513;
  padding: 24px 0;
}
.spec-box { display:flex; flex-direction:column; }
.spec-label { font-size: 18px; color: #666; font-weight:500; text-transform:uppercase; margin-bottom: 4px; }
.spec-val { font-size: 26px; font-weight:700; }
/* Color Swatches from Cover */
.swatch-row {
  display:flex; justify-content:space-between; align-items:center; margin-top: 10px;
}
.swatches { display:flex; gap: 12px; }
.swatch { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #161513; }
.barcode { font-family: monospace; font-size: 22px; font-weight:700; }
</style>
</head>
<body>
<div class="paper-texture"></div>

<div class="poster-top">
  <div class="poster-catalog">ARCHIVE SPECIMEN № 042 // CURATOR EDITION</div>
  <div class="poster-issue">RELEASE ${SONG.year}</div>
</div>

<div class="poster-frame">
  <img src="${coverDataUrl}" />
</div>

<div class="poster-meta">
  <div class="poster-title">${SONG.title}</div>
  <div class="poster-artist">${SONG.artist}</div>
</div>

<div class="poster-grid">
  <div class="spec-box">
    <span class="spec-label">Duration</span>
    <span class="spec-val">${SONG.duration}</span>
  </div>
  <div class="spec-box">
    <span class="spec-label">Tempo</span>
    <span class="spec-val">${SONG.bpm} BPM</span>
  </div>
  <div class="spec-box">
    <span class="spec-label">Key</span>
    <span class="spec-val">${SONG.key}</span>
  </div>
  <div class="spec-box">
    <span class="spec-label">Master</span>
    <span class="spec-val">Stereo 24-bit</span>
  </div>
</div>

<div class="swatch-row">
  <div class="swatches">
    <div class="swatch" style="background:#b91d22;"></div>
    <div class="swatch" style="background:#4a5568;"></div>
    <div class="swatch" style="background:#e2d9c8;"></div>
    <div class="swatch" style="background:#2d3748;"></div>
    <div class="swatch" style="background:#161513;"></div>
  </div>
  <div class="barcode">||| | ||||| |||| || | |||| ||</div>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Run Batch Preview Renderer
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Rendering 7 High-Resolution Template Previews (1080x1920)...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${WIDTH},${HEIGHT}`],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const templates = [
    { name: '01_apple_music.png',   html: tplAppleMusic() },
    { name: '02_vinyl_record.png',  html: tplVinylRecord() },
    { name: '03_carplay_night.png', html: tplCarPlay() },
    { name: '04_cassette_tape.png', html: tplCassette() },
    { name: '05_cd_jewel_case.png', html: tplCDJewelCase() },
    { name: '06_soundcloud_wave.png', html: tplSoundCloud() },
    { name: '07_graphic_poster.png',html: tplGraphicPoster() },
  ];

  for (const t of templates) {
    const outPath = path.join(outDir, t.name);
    process.stdout.write(`  Rendering ${t.name}... `);
    await page.setContent(t.html, { waitUntil: 'domcontentloaded' });
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: outPath, type: 'png' });
    console.log('✓');
  }

  await browser.close();
  console.log('\nAll 7 previews created in: ' + outDir);
}

main().catch(err => { console.error(err); process.exit(1); });
