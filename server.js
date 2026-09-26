// ─────────────────────────────────────────────────────────────────────────────
//  server.js - Viral Music Video Generator Web Studio
//  Local Web UI running on http://localhost:4000
// ─────────────────────────────────────────────────────────────────────────────

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4000;

import {
  TEMPLATES,
  DEFAULT_CSV_PATHS,
  DEFAULT_COVERS_DIRS,
  getDefaultCsvPath,
  getDefaultCoversDir,
  loadMusicCsv,
  findCoverForTrack
} from './generate.js';

const defaultCovers = [
  path.join(__dirname, 'COVER.png'),
  path.join(__dirname, 'COVER.webp'),
  path.join(__dirname, 'COVER.jpg'),
  path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/SpotifyVisualizer/bin/Release/net8.0/Assets/COVER.png"),
  "/home/kayan/Desktop/IGVIDGEN/COVER.png",
  "/home/kayan/Desktop/IGVIDGEN/COVER.webp",
  "/home/kayan/Desktop/IGVIDGEN/Assets/COVER.png"
];
const DEFAULT_COVER = defaultCovers.find(p => fs.existsSync(p)) || path.join(__dirname, 'COVER.png');
const DEFAULT_OUTDIR = path.resolve(__dirname, 'Output');

function getImageDataUrl(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const lower = filePath.toLowerCase();
  let mime = 'image/jpeg';
  if (lower.endsWith('.png')) mime = 'image/png';
  else if (lower.endsWith('.webp')) mime = 'image/webp';
  else if (lower.endsWith('.gif')) mime = 'image/gif';
  else if (lower.endsWith('.avif')) mime = 'image/avif';
  return `data:${mime};base64,` + fs.readFileSync(filePath).toString('base64');
}

// Active batch queue state
let activeProcess = null;
let sseClients = [];
let queueState = {
  running: false,
  total: 0,
  currentIndex: 0,
  currentTemplate: '',
  currentFrame: 0,
  totalFrames: 0,
  framePct: 0,
  overallPct: 0,
  completedVideos: [],
  logs: []
};

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => {
    try { res.write(msg); } catch (e) {}
  });
}

function addLog(text) {
  const time = new Date().toLocaleTimeString();
  const entry = `[${time}] ${text}`;
  queueState.logs.push(entry);
  if (queueState.logs.length > 300) queueState.logs.shift();
  broadcast('log', { text: entry });
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP Server
// ─────────────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. SSE Stream
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    sseClients.push(res);
    res.write(`event: state\ndata: ${JSON.stringify(queueState)}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  // 2. Initial Config & State
  if (pathname === '/api/config' && req.method === 'GET') {
    const defaultCsv = getDefaultCsvPath();
    const defaultCoversDir = getDefaultCoversDir();
    const rawSongs = loadMusicCsv(defaultCsv, defaultCoversDir);
    const csvSongs = rawSongs.map(s => ({
      ...s,
      coverDataUrl: s.coverPath ? getImageDataUrl(s.coverPath) : ''
    }));

    const defaultCoverDataUrl = getImageDataUrl(DEFAULT_COVER);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      templates: TEMPLATES,
      defaultCoverPath: DEFAULT_COVER,
      defaultCoverDataUrl,
      defaultOutDir: DEFAULT_OUTDIR,
      defaultCsvPath: defaultCsv,
      defaultCoversDir: defaultCoversDir,
      csvSongs,
      queueState
    }));
    return;
  }

  // 3. Save Uploaded Cover (Base64)
  if (pathname === '/api/upload-cover' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { dataUrl } = JSON.parse(body);
        const match = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!match) throw new Error('Invalid image format');
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const buf = Buffer.from(match[2], 'base64');
        const tempCover = path.join(__dirname, `uploaded_cover_${Date.now()}.${ext}`);
        fs.writeFileSync(tempCover, buf);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, coverPath: tempCover, dataUrl }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. Start Batch Generation
  if (pathname === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const params = JSON.parse(body);
        startBatchGeneration(params);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Batch generation started' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 5. Stop Generation
  if (pathname === '/api/stop' && req.method === 'POST') {
    stopGeneration();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Generation stopped' }));
    return;
  }

  // 6. Open Output Folder in Explorer
  if (pathname === '/api/open-folder' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { folder } = JSON.parse(body || '{}');
        const target = path.resolve(folder || DEFAULT_OUTDIR);
        fs.mkdirSync(target, { recursive: true });
        const opener = process.platform === 'win32'
          ? 'explorer.exe'
          : (fs.existsSync('/usr/bin/exo-open') ? 'exo-open' : 'xdg-open');
        spawn(opener, [target], { detached: true, stdio: 'ignore' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7. Video Stream / Playback
  if (pathname === '/api/video' && req.method === 'GET') {
    const videoPath = parsedUrl.searchParams.get('path');
    if (!videoPath || !fs.existsSync(videoPath)) {
      res.writeHead(404);
      res.end('Video not found');
      return;
    }
    const stat = fs.statSync(videoPath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(videoPath).pipe(res);
    }
    return;
  }

  // 8. Serve Frontend Dashboard
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml());
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// ─────────────────────────────────────────────────────────────────────────────
//  Batch Queue Runner
// ─────────────────────────────────────────────────────────────────────────────
async function startBatchGeneration(params) {
  if (queueState.running) return;

  const count = parseInt(params.count || 20, 10);
  const outDir = path.resolve(params.outDir || DEFAULT_OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });

  queueState = {
    running: true,
    total: count,
    currentIndex: 0,
    currentTemplate: '',
    currentFrame: 0,
    totalFrames: 0,
    framePct: 0,
    overallPct: 0,
    completedVideos: [],
    logs: []
  };

  const concurrency = parseInt(params.concurrency || (process.platform === 'linux' ? 20 : 2), 10);
  broadcast('state', queueState);
  addLog(`Starting batch: ${count} videos (${params.useCsvAll ? 'All CSV Tracks Round-Robin' : `Single Track: "${params.title}"`}) with ${concurrency} parallel workers`);
  addLog(`Output folder: ${outDir}`);

  const coverPath = path.resolve(params.coverPath || DEFAULT_COVER);

  const cliArgs = [
    path.join(__dirname, 'generate.js'),
    '--count', String(count),
    '--concurrency', String(concurrency),
    '--duration', String(params.duration || 15),
    '--outdir', outDir,
    '--json-progress'
  ];

  if (params.useCsvAll) {
    cliArgs.push('--use-csv');
  } else {
    cliArgs.push(
      '--cover', coverPath,
      '--artist', params.artist || 'Famous Pluto, Muyeez',
      '--title', params.title || 'Group Chat',
      '--song', params.song || '2:21',
      '--no-csv'
    );
  }

  if (params.mode === 'sequential') {
    cliArgs.push('--sequential');
  } else if (params.template && params.template !== 'all') {
    cliArgs.push('--template', params.template);
  }

  if (params.bg) {
    cliArgs.push('--bg', params.bg);
  }

  activeProcess = spawn('node', cliArgs, { cwd: __dirname });

  let buffer = '';

  activeProcess.stdout.on('data', chunk => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep remainder

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const event = JSON.parse(trimmed);
          handleProcessEvent(event);
          continue;
        } catch (e) {}
      }
      addLog(trimmed);
    }
  });

  activeProcess.stderr.on('data', chunk => {
    const text = chunk.toString().trim();
    if (text) addLog(`[STDERR] ${text}`);
  });

  activeProcess.on('close', code => {
    activeProcess = null;
    queueState.running = false;
    queueState.overallPct = 100;
    addLog(`Batch completed with code ${code}! Total videos finished: ${queueState.completedVideos.length}`);
    broadcast('state', queueState);
  });
}

function handleProcessEvent(evt) {
  if (evt.type === 'batch-item') {
    queueState.currentIndex = evt.index;
    queueState.currentTemplate = evt.template;
    queueState.overallPct = Math.round(((evt.index - 1) / queueState.total) * 100);
    const label = evt.title ? `"${evt.title}" by ${evt.artist} · ` : '';
    addLog(`🎬 Starting [${evt.index}/${queueState.total}] ${label}Template: ${evt.template.toUpperCase()}`);
    broadcast('state', queueState);
  } else if (evt.type === 'frame-progress') {
    queueState.currentFrame = evt.frame;
    queueState.totalFrames = evt.totalFrames;
    queueState.framePct = parseFloat(evt.pct);
    broadcast('state', queueState);
  } else if (evt.type === 'clip-done') {
    queueState.completedVideos.push({
      path: evt.outputPath,
      filename: path.basename(evt.outputPath),
      template: queueState.currentTemplate,
      sizeKb: evt.kb,
      timeSec: evt.elapsedSec,
      timestamp: new Date().toLocaleTimeString()
    });
    queueState.overallPct = Math.round((queueState.currentIndex / queueState.total) * 100);
    addLog(`✅ Saved ${path.basename(evt.outputPath)} (${evt.kb} KB) in ${evt.elapsedSec}s`);
    broadcast('state', queueState);
  }
}

function stopGeneration() {
  if (activeProcess) {
    try {
      activeProcess.kill('SIGINT');
      addLog('🛑 Generation stopped by user.');
    } catch (e) {}
    activeProcess = null;
  }
  queueState.running = false;
  broadcast('state', queueState);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Modern Web UI Dashboard (HTML + CSS + Client JS)
// ─────────────────────────────────────────────────────────────────────────────
function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Viral Music Visualizer Studio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090b10;
      --card-bg: rgba(18, 22, 32, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #ec4899;
      --green: #10b981;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      background-image: radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 40%),
                        radial-gradient(circle at 85% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 45%),
                        radial-gradient(circle at 50% 85%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
    }
    .header {
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--card-border);
      backdrop-filter: blur(20px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand { display: flex; align-items: center; gap: 14px; }
    .logo-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
    }
    .brand h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .badge {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
    }
    .main-grid {
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 32px;
      padding: 32px 40px 60px;
      max-width: 1720px;
      margin: 0 auto;
    }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 28px;
      backdrop-filter: blur(30px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    /* Cover Art Uploader */
    .dropzone {
      width: 100%;
      height: 220px;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;
      background: rgba(0,0,0,0.3);
    }
    .dropzone:hover { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
    .dropzone img {
      width: 100%; height: 100%; object-fit: cover;
      position: absolute; inset: 0;
    }
    .drop-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.65);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s ease;
    }
    .dropzone:hover .drop-overlay { opacity: 1; }
    .drop-text { font-size: 14px; font-weight: 600; color: #fff; margin-top: 8px; }

    /* Inputs */
    .form-group { margin-top: 18px; }
    label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    input[type="text"], input[type="number"], select {
      width: 100%;
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 12px 16px;
      color: #fff;
      font-size: 15px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .folder-row { display: flex; gap: 10px; align-items: center; }
    .btn-icon {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      display: flex; align-items: center; gap: 8px;
      white-space: nowrap;
      transition: background 0.2s;
    }
    .btn-icon:hover { background: rgba(255, 255, 255, 0.18); }

    /* Mode Pill Radios */
    .mode-radios { display: flex; gap: 10px; margin-top: 8px; }
    .radio-card {
      flex: 1;
      padding: 12px;
      background: rgba(0,0,0,0.3);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .radio-card.active {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.15);
      color: #fff;
      font-weight: 700;
    }

    /* Primary Generate Button */
    .btn-generate {
      width: 100%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      border: none;
      border-radius: 16px;
      padding: 18px 24px;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
      margin-top: 28px;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn-generate:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(99, 102, 241, 0.6);
    }
    .btn-stop {
      width: 100%;
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 16px;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 14px;
      display: none;
    }

    /* Right Column - Status & Progress */
    .progress-box {
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .p-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .bar-track {
      width: 100%; height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden;
    }
    .bar-fill {
      height: 100%; width: 0%; border-radius: 6px;
      transition: width 0.3s ease;
    }
    .bar-batch { background: linear-gradient(90deg, var(--primary), var(--accent)); }
    .bar-clip { background: linear-gradient(90deg, #10b981, #06b6d4); }

    /* Terminal Logs */
    .terminal {
      background: #040508;
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 16px 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      height: 220px;
      overflow-y: auto;
      color: #a7f3d0;
      margin-bottom: 28px;
    }
    .log-line { margin: 4px 0; }

    /* Videos Grid */
    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
      max-height: 480px;
      overflow-y: auto;
      padding-right: 8px;
    }
    .video-card {
      background: rgba(0,0,0,0.5);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      transition: transform 0.2s;
    }
    .video-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.25); }
    .video-card video { width: 100%; height: 180px; object-fit: cover; background: #000; display: block; }
    .v-meta { padding: 12px 14px; }
    .v-title { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .v-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>
      <div>
        <h1>Viral Music Video Studio</h1>
        <div style="font-size: 12px; color: var(--text-muted);">Multi-Template Video Generator</div>
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:16px;">
      <span class="badge">● 20 Templates Ready</span>
      <button class="btn-icon" onclick="openOutputFolder()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Open Output Folder
      </button>
    </div>
  </div>

  <div class="main-grid">
    <!-- LEFT PANEL: SETTINGS -->
    <div class="panel">
      <div class="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        1. Album Cover Art
      </div>

      <input type="file" id="coverFileInput" accept="image/png,image/jpeg,image/webp,image/*" style="display:none;" onchange="handleCoverFileSelect(event)">
      <div class="dropzone" id="dropzone" onclick="document.getElementById('coverFileInput').click()">
        <img id="coverPreviewImg" src="" />
        <div class="drop-overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div class="drop-text">Click or Drop Album Cover (PNG, JPG, WEBP)</div>
        </div>
      </div>

      <div class="section-title" style="margin-top: 28px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        2. Music Catalog (CSV Auto-Load)
      </div>

      <div class="form-group">
        <label>Select Song from CSV or Batch All</label>
        <select id="csvTrackSelect" onchange="handleCsvTrackChange(this.value)" style="border:1px solid var(--primary); background:rgba(99,102,241,0.15); font-weight:700;">
          <option value="all" selected>⚡ ALL SONGS (Cycle Round-Robin across all 15 Tracks)</option>
        </select>
        <div style="font-size:12px; color:#818cf8; margin-top:6px;" id="csvCatalogStatus">
          📁 Loaded from: music - Sheet1.csv & COVERS
        </div>
      </div>

      <div class="form-group">
        <label>Song Title</label>
        <input type="text" id="titleInput" value="Group Chat" placeholder="e.g. Passionfruit">
      </div>

      <div class="form-group">
        <label>Artist Name</label>
        <input type="text" id="artistInput" value="Famous Pluto, Muyeez" placeholder="e.g. Drake">
      </div>

      <div class="row-2 form-group">
        <div>
          <label>Song Length</label>
          <input type="text" id="songLenInput" value="2:21" placeholder="2:21">
        </div>
        <div>
          <label>Clip Duration</label>
          <input type="number" id="clipDurInput" value="15" min="5" max="60">
        </div>
      </div>

      <div class="section-title" style="margin-top: 28px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        3. Output Folder
      </div>

      <div class="form-group folder-row">
        <input type="text" id="outDirInput" value="" placeholder="C:/.../Output">
        <button class="btn-icon" onclick="openOutputFolder()" title="Open Folder">📁</button>
      </div>

      <div class="section-title" style="margin-top: 28px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        4. Batch Video Count & Mode
      </div>

      <div class="row-2 form-group">
        <div>
          <label>Total Videos</label>
          <input type="number" id="batchCountInput" value="70" min="1" max="500" oninput="updateGenerateBtnText()">
        </div>
        <div>
          <label>Parallel Workers (Threads)</label>
          <input type="number" id="concurrencyInput" value="20" min="1" max="48" title="Recommend 20-24 on AMD Epyc 96-thread server, 2 on laptop">
        </div>
      </div>

      <div class="form-group">
        <label>Template Progression</label>
        <div class="mode-radios">
          <div class="radio-card active" id="modeSeq" onclick="setMode('sequential')">
            Sequential (1 → 20)
          </div>
          <div class="radio-card" id="modeSingle" onclick="setMode('single')">
            Single Template
          </div>
        </div>
      </div>

      <div class="form-group" id="singleTemplateGroup" style="display:none;">
        <label>Select Template</label>
        <select id="singleTemplateSelect"></select>
      </div>

      <div class="form-group">
        <label>Background Style</label>
        <select id="bgSelect">
          <option value="blur" selected>Ambient Cover Art Blur</option>
          <option value="solid">Curated Solid Aesthetic Colors</option>
          <option value="gradient">Curated Dual Gradients</option>
          <option value="random">Randomize Every Clip</option>
        </select>
      </div>

      <button id="btnGenerate" class="btn-generate" onclick="startGeneration()">
        <span>🚀</span>
        <span id="btnGenText">GENERATE 70 VIDEOS (SEQUENTIAL)</span>
      </button>

      <button id="btnStop" class="btn-stop" onclick="stopGeneration()">
        🛑 STOP GENERATION QUEUE
      </button>
    </div>

    <!-- RIGHT PANEL: MONITOR & COMPLETED VIDEOS -->
    <div style="display:flex; flex-direction:column; gap:24px;">
      
      <!-- Live Status & Progress -->
      <div class="panel">
        <div class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Live Generation Monitor
        </div>

        <div class="progress-box">
          <div class="p-header">
            <div>
              <span style="font-weight:700; font-size:18px;" id="batchStatusTxt">Ready</span>
              <span id="activeTplBadge" style="margin-left:12px;" class="badge">Idle</span>
            </div>
            <div style="font-family:'JetBrains Mono'; font-size:16px; font-weight:700;" id="overallPctTxt">0%</div>
          </div>
          <div class="bar-track">
            <div id="batchProgressBar" class="bar-fill bar-batch"></div>
          </div>
        </div>

        <div class="progress-box" style="margin-bottom:0;">
          <div class="p-header">
            <div style="font-size:14px; color:var(--text-muted);" id="clipStatusTxt">Current Clip Frame Progress</div>
            <div style="font-family:'JetBrains Mono'; font-size:14px;" id="clipPctTxt">0%</div>
          </div>
          <div class="bar-track" style="height:8px;">
            <div id="clipProgressBar" class="bar-fill bar-clip"></div>
          </div>
        </div>
      </div>

      <!-- Live Terminal Console -->
      <div class="panel" style="padding-bottom:20px;">
        <div class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          Console Activity
        </div>
        <div class="terminal" id="terminalBox">
          <div class="log-line">Waiting to start generation...</div>
        </div>
      </div>

      <!-- Completed Videos Gallery -->
      <div class="panel" style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <div class="section-title" style="margin-bottom:0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            Generated Videos (<span id="compCount">0</span>)
          </div>
          <button class="btn-icon" style="padding:6px 12px; font-size:12px;" onclick="openOutputFolder()">Open Folder</button>
        </div>

        <div class="videos-grid" id="videosGrid">
          <div style="color:var(--text-muted); font-size:14px; grid-column:1/-1; text-align:center; padding:40px;">
            Generated MP4 videos will appear here in real-time as they finish rendering.
          </div>
        </div>
      </div>

    </div>
  </div>

  <script>
    let currentMode = 'sequential';
    let currentCoverPath = '';
    let csvTracksList = [];

    // Load initial config from server
    async function init() {
      const res = await fetch('/api/config');
      const data = await res.json();
      
      currentCoverPath = data.defaultCoverPath;
      if (data.defaultCoverDataUrl) {
        document.getElementById('coverPreviewImg').src = data.defaultCoverDataUrl;
      }
      document.getElementById('outDirInput').value = data.defaultOutDir;

      const sel = document.getElementById('singleTemplateSelect');
      data.templates.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t.toUpperCase();
        sel.appendChild(opt);
      });

      csvTracksList = data.csvSongs || [];
      const trackSel = document.getElementById('csvTrackSelect');
      if (csvTracksList.length > 0) {
        document.getElementById('csvCatalogStatus').textContent = '📁 Loaded ' + csvTracksList.length + ' tracks from music - Sheet1.csv & COVERS';
        csvTracksList.forEach((s, idx) => {
          const opt = document.createElement('option');
          opt.value = String(idx);
          opt.textContent = (idx + 1) + '. ' + s.artist + ' - ' + s.title + ' (' + s.song + ')';
          trackSel.appendChild(opt);
        });
      }

      // Connect SSE
      const evtSource = new EventSource('/api/events');
      evtSource.addEventListener('state', e => updateState(JSON.parse(e.data)));
      evtSource.addEventListener('log', e => appendLog(JSON.parse(e.data).text));

      // Setup Drag & Drop for Album Cover (PNG, JPG, WEBP)
      const dropzone = document.getElementById('dropzone');
      dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = 'var(--primary)'; });
      dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processImageFile(e.dataTransfer.files[0]);
        }
      });

      updateGenerateBtnText();
    }

    function handleCsvTrackChange(val) {
      if (val === 'all') {
        document.getElementById('titleInput').value = 'All CSV Tracks (Cycle)';
        document.getElementById('artistInput').value = 'Multiple Artists';
        updateGenerateBtnText();
        return;
      }
      const idx = parseInt(val, 10);
      const track = csvTracksList[idx];
      if (track) {
        document.getElementById('titleInput').value = track.title;
        document.getElementById('artistInput').value = track.artist;
        document.getElementById('songLenInput').value = track.song;
        if (track.coverDataUrl) {
          document.getElementById('coverPreviewImg').src = track.coverDataUrl;
        }
        if (track.coverPath) {
          currentCoverPath = track.coverPath;
        }
      }
      updateGenerateBtnText();
    }

    function setMode(mode) {
      currentMode = mode;
      document.getElementById('modeSeq').classList.toggle('active', mode === 'sequential');
      document.getElementById('modeSingle').classList.toggle('active', mode === 'single');
      document.getElementById('singleTemplateGroup').style.display = mode === 'single' ? 'block' : 'none';
      updateGenerateBtnText();
    }

    function updateGenerateBtnText() {
      const count = document.getElementById('batchCountInput').value || 1;
      const isAll = document.getElementById('csvTrackSelect') && document.getElementById('csvTrackSelect').value === 'all';
      const modeStr = isAll ? '(ALL SONGS × 20 TEMPLATES)' : (currentMode === 'sequential' ? '(SEQUENTIAL 20 TEMPLATES)' : '');
      document.getElementById('btnGenText').textContent = \`GENERATE \${count} VIDEOS \${modeStr}\`;
    }

    function handleCoverFileSelect(e) {
      if (e.target.files && e.target.files[0]) {
        processImageFile(e.target.files[0]);
      }
    }

    function processImageFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async evt => {
        const dataUrl = evt.target.result;
        document.getElementById('coverPreviewImg').src = dataUrl;
        const res = await fetch('/api/upload-cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl })
        });
        const d = await res.json();
        if (d.coverPath) currentCoverPath = d.coverPath;
      };
      reader.readAsDataURL(file);
    }

    async function startGeneration() {
      const isAll = document.getElementById('csvTrackSelect') && document.getElementById('csvTrackSelect').value === 'all';
      const payload = {
        useCsvAll: isAll,
        coverPath: currentCoverPath,
        title: document.getElementById('titleInput').value,
        artist: document.getElementById('artistInput').value,
        song: document.getElementById('songLenInput').value,
        duration: document.getElementById('clipDurInput').value,
        outDir: document.getElementById('outDirInput').value,
        count: document.getElementById('batchCountInput').value,
        concurrency: parseInt(document.getElementById('concurrencyInput').value, 10) || 20,
        mode: currentMode,
        template: currentMode === 'single' ? document.getElementById('singleTemplateSelect').value : null,
        bg: document.getElementById('bgSelect').value
      };

      document.getElementById('btnGenerate').style.display = 'none';
      document.getElementById('btnStop').style.display = 'block';

      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    async function stopGeneration() {
      await fetch('/api/stop', { method: 'POST' });
    }

    async function openOutputFolder() {
      const folder = document.getElementById('outDirInput').value;
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
      });
    }

    function updateState(state) {
      if (state.running) {
        document.getElementById('btnGenerate').style.display = 'none';
        document.getElementById('btnStop').style.display = 'block';
        document.getElementById('batchStatusTxt').textContent = \`Rendering Video \${state.currentIndex} of \${state.total}\`;
        document.getElementById('activeTplBadge').textContent = (state.currentTemplate || '...').toUpperCase();
      } else {
        document.getElementById('btnGenerate').style.display = 'flex';
        document.getElementById('btnStop').style.display = 'none';
        document.getElementById('batchStatusTxt').textContent = state.completedVideos.length > 0 ? 'Batch Finished!' : 'Ready';
        document.getElementById('activeTplBadge').textContent = 'Idle';
      }

      document.getElementById('batchProgressBar').style.width = state.overallPct + '%';
      document.getElementById('overallPctTxt').textContent = state.overallPct + '%';

      document.getElementById('clipProgressBar').style.width = state.framePct + '%';
      document.getElementById('clipPctTxt').textContent = \`\${state.currentFrame} / \${state.totalFrames} (\${state.framePct}%)\`;

      document.getElementById('compCount').textContent = state.completedVideos.length;

      // Render video gallery
      if (state.completedVideos.length > 0) {
        const grid = document.getElementById('videosGrid');
        grid.innerHTML = '';
        state.completedVideos.slice().reverse().forEach(v => {
          const card = document.createElement('div');
          card.className = 'video-card';
          card.innerHTML = \`
            <video src="/api/video?path=\${encodeURIComponent(v.path)}" controls preload="metadata"></video>
            <div class="v-meta">
              <div class="v-title">\${v.filename}</div>
              <div class="v-sub">
                <span class="badge" style="padding:2px 8px; font-size:11px;">\${v.template.toUpperCase()}</span>
                <span>\${v.sizeKb} KB · \${v.timeSec}s</span>
              </div>
            </div>
          \`;
          grid.appendChild(card);
        });
      }
    }

    function appendLog(text) {
      const box = document.getElementById('terminalBox');
      const line = document.createElement('div');
      line.className = 'log-line';
      line.textContent = text;
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }

    init();
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Start Web Server
// ─────────────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n  ==============================================================`);
  console.log(`  🚀  VIRAL MUSIC VISUALIZER STUDIO UI RUNNING AT:`);
  console.log(`      ➜  http://localhost:${PORT}`);
  console.log(`  ==============================================================\n`);

  // Auto open browser on Windows or Linux
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', `http://localhost:${PORT}`], { detached: true, stdio: 'ignore' });
  } else {
    const opener = fs.existsSync('/usr/bin/exo-open') ? 'exo-open' : 'xdg-open';
    spawn(opener, [`http://localhost:${PORT}`], { detached: true, stdio: 'ignore' });
  }
});
