// ─────────────────────────────────────────────────────────────────────────────
//  Spotify Visualizer & Multi-Template Music Agency Video Engine
//  Node.js + Puppeteer + Sharp + FFmpeg
//
//  Templates:
//    1. spotify     - Classic Spotify UI (Default)
//    2. apple       - Apple Music iOS 18 Glassmorphism
//    3. vinyl       - Spinning Vinyl Turntable (Rotating disc & grooves)
//    4. carplay     - Night Drive Apple CarPlay In-Dash
//    5. cassette    - 90s Retro Cassette Tape (Revolving spools & counter)
//    6. cd          - Y2K Clear CD Jewel Case with holographic shine
//    7. soundcloud  - Underground SoundCloud Waveform
//    8. poster      - Swiss Minimalist Graphic Poster (Live VU-meter & timecode)
//
//  CLI Usage:
//    node generate.js --cover "path/cover.png" --artist "Drake" --title "Passionfruit" --song "3:44"
//    node generate.js --template vinyl --cover "..." --artist "..." --title "..." --song "2:21"
//    node generate.js --preview-all   <-- Generates 1 high-res PNG image for all 8 templates
// ─────────────────────────────────────────────────────────────────────────────

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH  = 1080;
const HEIGHT = 1920;
const FPS    = 30;

export const TEMPLATES = [
  'spotify', 'apple', 'vinyl', 'carplay', 'cassette', 'cd', 'soundcloud', 'poster',
  'lockscreen', 'ipod', 'call', 'vhs', 'winamp', 'receipt', 'boombox', 'gameboy', 'daw',
  'tachometer', 'billboard', 'arcade'
];

// ─────────────────────────────────────────────────────────────────────────────
//  Curated Solid Color Palettes
// ─────────────────────────────────────────────────────────────────────────────
export const SOLID_PALETTES = [
  { name: 'Midnight Navy',        hex: '#0A192F', category: 'Midnight Blues' },
  { name: 'Abyssal Blue',         hex: '#0B132B', category: 'Midnight Blues' },
  { name: 'Dark Indigo',          hex: '#111132', category: 'Midnight Blues' },
  { name: 'Deep Space',           hex: '#0D1B2A', category: 'Midnight Blues' },
  { name: 'Sapphire Obsidian',    hex: '#0C1821', category: 'Midnight Blues' },
  { name: 'Royal Plum',           hex: '#1D0E2B', category: 'Royal Purples' },
  { name: 'Velvet Violet',        hex: '#2A0845', category: 'Royal Purples' },
  { name: 'Dark Orchid',          hex: '#230735', category: 'Royal Purples' },
  { name: 'Aubergine Noir',       hex: '#2D132C', category: 'Royal Purples' },
  { name: 'Burgundy Noir',        hex: '#28080C', category: 'Wine & Crimson' },
  { name: 'Blood Velvet',         hex: '#3B0910', category: 'Wine & Crimson' },
  { name: 'Dark Maroon',          hex: '#4A0E17', category: 'Wine & Crimson' },
  { name: 'Crimson Ember',        hex: '#540B0E', category: 'Wine & Crimson' },
  { name: 'Emerald Obsidian',     hex: '#062319', category: 'Emerald & Forest' },
  { name: 'Pine Forest Noir',     hex: '#08201D', category: 'Emerald & Forest' },
  { name: 'Peacock Dark',         hex: '#071E22', category: 'Emerald & Forest' },
  { name: 'Dark Jade',            hex: '#0D2818', category: 'Emerald & Forest' },
  { name: 'Dark Espresso',        hex: '#1A110E', category: 'Espresso & Earth' },
  { name: 'Warm Mocha',           hex: '#231815', category: 'Espresso & Earth' },
  { name: 'Burnt Umber',          hex: '#2D1808', category: 'Espresso & Earth' },
  { name: 'Spotify True Black',   hex: '#121212', category: 'Sleek Neutrals' },
  { name: 'Obsidian Slate',       hex: '#16191D', category: 'Sleek Neutrals' },
  { name: 'Charcoal Noir',        hex: '#181818', category: 'Sleek Neutrals' },
  { name: 'Cyber Dusk',           hex: '#1A102F', category: 'Cyber Darks' },
  { name: 'Neon Twilight',        hex: '#251329', category: 'Cyber Darks' },
  { name: 'Sunset Noir',          hex: '#30122D', category: 'Cyber Darks' }
];

export const GRADIENT_PALETTES = [
  { name: 'Midnight to Velvet',    stops: ['#0A192F', '#1D0E2B'] },
  { name: 'Burgundy to Black',     stops: ['#3B0910', '#0F0406'] },
  { name: 'Emerald to Abyss',      stops: ['#08201D', '#030D0C'] },
  { name: 'Royal Violet to Navy',  stops: ['#2A0845', '#0B132B'] },
  { name: 'Cyber Twilight',        stops: ['#2D0C2C', '#111132'] },
  { name: 'Dark Mocha to Onyx',    stops: ['#231815', '#0E0A09'] },
  { name: 'Bordeaux to Slate',     stops: ['#4A0E17', '#121212'] },
  { name: 'Sunset Glow Noir',      stops: ['#420A14', '#1A0E2B'] }
];

// ─────────────────────────────────────────────────────────────────────────────
//  CSV Music Catalog & Cover Matcher
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_CSV_PATHS = [
  path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/music - Sheet1.csv"),
  path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/music.csv"),
  path.join(__dirname, 'music - Sheet1.csv'),
  path.join(__dirname, 'music.csv'),
  "/home/kayan/Desktop/IGVIDGEN/music - Sheet1.csv",
  "/home/kayan/Desktop/IGVIDGEN/music.csv"
];

export const DEFAULT_COVERS_DIRS = [
  path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/COVERS"),
  path.join(__dirname, 'COVERS'),
  "/home/kayan/Desktop/IGVIDGEN/COVERS"
];

export function getDefaultCsvPath() {
  return DEFAULT_CSV_PATHS.find(p => fs.existsSync(p)) || null;
}

export function getDefaultCoversDir() {
  return DEFAULT_COVERS_DIRS.find(p => fs.existsSync(p)) || null;
}

export function findCoverForTrack(artist, title, coversDir = getDefaultCoversDir()) {
  if (!coversDir || !fs.existsSync(coversDir)) return null;
  const files = fs.readdirSync(coversDir);
  const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const targetWords = clean(artist + ' ' + title).split(' ').filter(w => w.length > 1);

  let bestMatch = null;
  let highestScore = 0;

  for (const f of files) {
    const normFile = clean(path.parse(f).name);
    const fileWords = normFile.split(' ').filter(w => w.length > 1);

    let score = 0;
    for (const w of targetWords) {
      if (fileWords.includes(w)) score += 3;
      else if (normFile.includes(w)) score += 1;
    }
    for (const w of fileWords) {
      if (targetWords.includes(w)) score += 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = f;
    }
  }

  if (highestScore > 0 && bestMatch) {
    return path.join(coversDir, bestMatch);
  }
  return null;
}

export function loadMusicCsv(csvFile = getDefaultCsvPath(), coversDir = getDefaultCoversDir()) {
  if (!csvFile || !fs.existsSync(csvFile)) return [];
  const content = fs.readFileSync(csvFile, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  
  for (const line of lines) {
    const parts = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        parts.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    parts.push(cur.trim());
    if (parts.length >= 2) {
      const artist = parts[0];
      const title = parts[1];
      const rawTime = (parts[2] || '2:30').replace('.:', ':').replace(/\.+/, ':').trim();
      const cover = findCoverForTrack(artist, title, coversDir);
      rows.push({
        artist,
        title,
        song: rawTime,
        songDuration: parseDuration(rawTime),
        coverPath: cover
      });
    }
  }
  return rows;
}

export function getArtistFolderName(artist) {
  if (!artist) return 'Artist';
  let clean = artist.trim().replace(/[\\/:*?"<>|]/g, '').trim();
  clean = clean.replace(/\.+$/, '').trim();
  return clean || 'Artist';
}

export function generateRandomString(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

export function getCoverBaseName(coverPath) {
  if (coverPath) {
    const parsed = path.parse(coverPath).name;
    if (parsed) return parsed.trim();
  }
  return 'video';
}

export function getDefaultOutputPath(outDir, artist) {
  const artistFolder = getArtistFolderName(artist);
  const targetDir = path.join(outDir, artistFolder);
  fs.mkdirSync(targetDir, { recursive: true });

  let idx = 1;
  const files = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
  const existingIndices = files
    .map(f => {
      const m = f.match(/_(\d+)\.mp4$/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(n => n > 0);
  if (existingIndices.length > 0) {
    idx = Math.max(...existingIndices) + 1;
  }

  const randStr = generateRandomString(8);
  return path.join(targetDir, `${randStr}_${idx}.mp4`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLI Parser
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const get  = f => { const i = args.indexOf(f); return i !== -1 && i+1 < args.length ? args[i+1] : null; };

  if (args.includes('--help') || args.includes('-h')) { printHelp(); process.exit(0); }
  if (args.includes('--list-colors') || args.includes('-l')) { printColorCatalog(); process.exit(0); }
  if (args.includes('--preview-all') || args.includes('-p')) return { mode: 'preview-all', args };

  const defaultCovers = [
    path.join(__dirname, 'COVER.png'),
    path.join(__dirname, 'COVER.webp'),
    path.join(__dirname, 'COVER.jpg'),
    path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/SpotifyVisualizer/bin/Release/net8.0/Assets/COVER.png"),
    "/home/kayan/Desktop/IGVIDGEN/COVER.png",
    "/home/kayan/Desktop/IGVIDGEN/COVER.webp",
    "/home/kayan/Desktop/IGVIDGEN/Assets/COVER.png"
  ];
  const foundDefault = defaultCovers.find(p => fs.existsSync(p)) || defaultCovers[0];

  const defaultCsv = getDefaultCsvPath();
  const defaultCoversDir = getDefaultCoversDir();
  const csvArg = get('--csv') || (args.includes('--no-csv') ? null : defaultCsv);
  const coversDirArg = get('--covers-dir') || defaultCoversDir;

  let csvSongs = [];
  if (csvArg && fs.existsSync(csvArg)) {
    csvSongs = loadMusicCsv(csvArg, coversDirArg);
  }

  let artistArg   = get('--artist');
  let titleArg    = get('--title');
  let songArg     = get('--song');
  let coverArg    = get('--cover');

  const trackArg = get('--track');
  if (trackArg && csvSongs.length > 0) {
    const trackIdx = parseInt(trackArg, 10);
    const chosen = !isNaN(trackIdx) && trackIdx > 0 && trackIdx <= csvSongs.length
      ? csvSongs[trackIdx - 1]
      : csvSongs.find(s => s.title.toLowerCase().includes(trackArg.toLowerCase()) || s.artist.toLowerCase().includes(trackArg.toLowerCase()));
    if (chosen) {
      if (!artistArg) artistArg = chosen.artist;
      if (!titleArg) titleArg = chosen.title;
      if (!songArg) songArg = chosen.song;
      if (!coverArg && chosen.coverPath) coverArg = chosen.coverPath;
      csvSongs = [chosen];
    }
  }

  if (!artistArg && csvSongs.length > 0) artistArg = csvSongs[0].artist;
  if (!titleArg && csvSongs.length > 0) titleArg = csvSongs[0].title;
  if (!songArg && csvSongs.length > 0) songArg = csvSongs[0].song;
  if (!coverArg && csvSongs.length > 0 && csvSongs[0].coverPath) coverArg = csvSongs[0].coverPath;

  if (!artistArg) artistArg = 'Famous Pluto, Muyeez';
  if (!titleArg) titleArg = 'Group Chat';
  if (!songArg) songArg = '2:21';
  if (!coverArg) coverArg = foundDefault;

  const durationArg = get('--duration');
  const templateArg = (get('--template') || 'spotify').toLowerCase();
  const bgArg       = get('--bg') || get('--color');
  const defaultOutDir = process.platform === 'linux'
    ? '/home/kayan/Desktop/IGREELOUT'
    : (fs.existsSync('C:/Users/kayan/Desktop') ? 'C:/Users/kayan/Desktop/IGREELOUT' : path.join(__dirname, 'Output'));
  const outDirArg   = get('--outdir') || get('--output-dir') || defaultOutDir;
  const countArg    = parseInt(get('--count') || get('--batch') || '1', 10);
  const concurrencyArg = parseInt(get('--concurrency') || get('--workers') || get('--threads') || '1', 10);
  const isSequential = !args.includes('--random-templates');
  const jsonProgress = args.includes('--json-progress');

  if (!fs.existsSync(coverArg)) {
    console.error(`\n  [ERROR] Cover file not found: ${coverArg}`);
    process.exit(1);
  }

  const songDuration = parseDuration(songArg);
  const clipDuration = durationArg ? Math.min(parseInt(durationArg, 10), songDuration) : 15;
  const startOffset  = randomBetween(0, Math.max(0, songDuration - clipDuration));
  const outDir       = path.resolve(outDirArg);
  fs.mkdirSync(outDir, { recursive: true });

  let template = templateArg;
  if (template === 'random') {
    template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  } else if (!TEMPLATES.includes(template) && template !== 'sequential') {
    console.warn(`\n  [WARN] Unknown template "${templateArg}", defaulting to "spotify".`);
    template = 'spotify';
  }

  const background = resolveBackground(bgArg);

  if (countArg > 1) {
    return {
      mode: 'batch',
      count: countArg,
      concurrency: concurrencyArg,
      sequential: isSequential,
      coverPath: path.resolve(coverArg),
      artist: artistArg,
      title: titleArg,
      songDuration,
      clipDuration,
      template,
      background,
      outDir,
      jsonProgress,
      csvSongs: (args.includes('--no-csv') || (get('--artist') && !args.includes('--use-csv') && !args.includes('--csv'))) ? [] : csvSongs
    };
  }

  return {
    mode: 'render',
    coverPath:    path.resolve(coverArg),
    artist:       artistArg,
    title:        titleArg,
    songDuration,
    clipDuration,
    startOffset,
    template,
    background,
    outDir,
    jsonProgress,
    outputPath:   outputArg ? path.resolve(outputArg) : getDefaultOutputPath(outDir, artistArg),
  };
}

function resolveBackground(bgArg) {
  const val = (bgArg || 'random').trim().toLowerCase();
  if (val.startsWith('#') || /^[0-9a-f]{6}(,[0-9a-f]{6})?$/i.test(val)) {
    const raw = val.startsWith('#') ? val : '#' + val;
    if (raw.includes(',')) {
      const [c1, c2] = raw.split(',').map(s => s.trim().startsWith('#') ? s.trim() : '#' + s.trim());
      return { type: 'gradient', name: `Custom (${c1} → ${c2})`, stops: [c1, c2] };
    }
    return { type: 'solid', name: `Custom Hex (${raw})`, hex: raw };
  }
  if (val === 'solid') {
    const item = SOLID_PALETTES[Math.floor(Math.random() * SOLID_PALETTES.length)];
    return { type: 'solid', name: `${item.name} (${item.hex})`, hex: item.hex };
  }
  if (val === 'gradient') {
    const item = GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
    return { type: 'gradient', name: item.name, stops: item.stops };
  }
  if (val === 'blur' || val === 'cover') return { type: 'blur', name: 'Cover Art Ambient Blur' };

  // default: pick random
  const modes = ['blur', 'solid', 'gradient'];
  const m = modes[Math.floor(Math.random() * modes.length)];
  if (m === 'solid') {
    const item = SOLID_PALETTES[Math.floor(Math.random() * SOLID_PALETTES.length)];
    return { type: 'solid', name: `${item.name} (${item.hex})`, hex: item.hex };
  }
  if (m === 'gradient') {
    const item = GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
    return { type: 'gradient', name: item.name, stops: item.stops };
  }
  return { type: 'blur', name: 'Cover Art Ambient Blur' };
}

function printHelp() {
  console.log(`
  +=====================================================================+
  |        Multi-Template Viral Music Clipping Video Generator          |
  +=====================================================================+

  USAGE:
    node generate.js [options]

  OPTIONS:
    --template <name>   Choose visual style (default: spotify)
                        Options: spotify | apple | vinyl | carplay | cassette | cd | soundcloud | poster |
                                 lockscreen | ipod | call | vhs | winamp | receipt | boombox | gameboy | daw |
                                 tachometer | billboard | arcade | random

    --cover <path>      Path to album cover JPG/PNG
    --artist <name>     Artist Name
    --title <name>      Song Title
    --song <time>       Full song length (e.g. "2:21" or "3:45")
    --duration <sec>    Video clip length in seconds (default: random 10-20s)
    --bg <color>        Background: hex (#2A0845), solid, gradient, blur, or random
    --output <path>     Output MP4 file path

    --preview-all       Generate 1 high-resolution PNG image for all 20 templates!
    --list-colors       List all 65+ curated aesthetic color hex codes
  `);
}

function printColorCatalog() {
  console.log('\n  +===================================================================+');
  console.log('  |          65+ Curated Aesthetic Solid Color Hex Codes              |');
  console.log('  +===================================================================+\n');
  for (const c of SOLID_PALETTES) {
    console.log(`    ${c.hex.padEnd(9)}  ${c.name} (${c.category})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Entry Point
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const cfg = parseArgs();

  if (cfg.mode === 'preview-all') {
    await renderAllPreviews();
    return;
  }

  if (cfg.mode === 'batch') {
    await renderBatch(cfg);
    return;
  }

  await renderVideo(cfg);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Batch Render Loop (Sequential Round-Robin across all 20 Templates)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
//  Batch Render Loop (Sequential Round-Robin across all 20 Templates)
// ─────────────────────────────────────────────────────────────────────────────
async function renderBatch(cfg) {
  const concurrency = Math.max(1, Math.min(cfg.concurrency || 1, cfg.count));
  const hasCsvSongs = cfg.csvSongs && cfg.csvSongs.length > 0;
  console.log(`
  +=====================================================================+
  |  BATCH GENERATION: ${cfg.count} Videos (${cfg.sequential ? 'Sequential Round-Robin' : 'Random'})
  |  Concurrency: ${concurrency} parallel worker threads
  |  Output Directory: ${cfg.outDir}
  |  Music Source: ${hasCsvSongs ? `CSV Catalog (${cfg.csvSongs.length} songs cycling round-robin)` : `Single Track ("${cfg.title}" by ${cfg.artist})`}
  +=====================================================================+
  `);
  fs.mkdirSync(cfg.outDir, { recursive: true });

  const artistCounterMap = {};
  const tasks = [];
  for (let i = 0; i < cfg.count; i++) {
    const tpl = cfg.sequential
      ? TEMPLATES[i % TEMPLATES.length]
      : (cfg.template === 'random' ? TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)] : cfg.template);

    const songItem = hasCsvSongs ? cfg.csvSongs[i % cfg.csvSongs.length] : null;
    const artist = songItem ? songItem.artist : cfg.artist;
    const title = songItem ? songItem.title : cfg.title;
    const songDuration = songItem ? songItem.songDuration : cfg.songDuration;
    const coverPath = (songItem && songItem.coverPath) ? songItem.coverPath : cfg.coverPath;

    const artistFolder = getArtistFolderName(artist);
    const targetDir = path.join(cfg.outDir, artistFolder);
    fs.mkdirSync(targetDir, { recursive: true });

    if (artistCounterMap[artistFolder] === undefined) {
      const existing = fs.existsSync(targetDir) ? fs.readdirSync(targetDir) : [];
      const nums = existing
        .map(f => {
          const m = f.match(/_(\d+)\.mp4$/i);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter(n => n > 0);
      artistCounterMap[artistFolder] = nums.length > 0 ? Math.max(...nums) : 0;
    }

    artistCounterMap[artistFolder]++;
    const itemNum = artistCounterMap[artistFolder];
    const randStr = generateRandomString(8);

    const clipDuration = cfg.clipDuration || 15;
    const maxOffset = Math.max(0, songDuration - clipDuration);
    const stepCount = hasCsvSongs ? cfg.csvSongs.length : cfg.count;
    const startOffset = maxOffset > 0 ? Math.floor(((i % stepCount) * maxOffset) / Math.max(1, stepCount - 1)) : 0;
    
    const outputPath = path.join(targetDir, `${randStr}_${itemNum}.mp4`);

    tasks.push({
      index: i + 1,
      total: cfg.count,
      tpl,
      artist,
      title,
      songDuration,
      coverPath,
      clipDuration,
      startOffset,
      outputPath
    });
  }

  let running = 0;
  let taskIndex = 0;
  let completed = 0;

  return new Promise((resolve) => {
    function next() {
      if (completed >= tasks.length) {
        console.log(`\n  🎉 Finished all ${cfg.count} videos! Output folder:\n      ${cfg.outDir}\n`);
        return resolve();
      }

      while (running < concurrency && taskIndex < tasks.length) {
        const item = tasks[taskIndex++];
        running++;

        if (cfg.jsonProgress) {
          process.stdout.write(JSON.stringify({
            type: 'batch-item',
            index: item.index,
            total: cfg.count,
            template: item.tpl,
            title: item.title,
            artist: item.artist,
            outputPath: item.outputPath
          }) + '\n');
        }

        console.log(`  [Worker Launched: Video ${item.index} of ${cfg.count}] "${item.title}" by ${item.artist} | Template: ${item.tpl.toUpperCase()} -> ${path.basename(item.outputPath)}`);

        renderVideo({
          ...cfg,
          artist: item.artist,
          title: item.title,
          songDuration: item.songDuration,
          coverPath: item.coverPath,
          template: item.tpl,
          clipDuration: item.clipDuration,
          startOffset: item.startOffset,
          outputPath: item.outputPath,
          itemIndex: item.index
        }).then(() => {
          running--;
          completed++;
          next();
        }).catch(err => {
          console.error(`  [ERROR] Failed rendering video ${item.index}:`, err);
          running--;
          completed++;
          next();
        });
      }
    }

    next();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
function getImageDataUrl(filePath) {
  const lower = filePath.toLowerCase();
  let mime = 'image/jpeg';
  if (lower.endsWith('.png')) mime = 'image/png';
  else if (lower.endsWith('.webp')) mime = 'image/webp';
  else if (lower.endsWith('.gif')) mime = 'image/gif';
  else if (lower.endsWith('.avif')) mime = 'image/avif';
  return `data:${mime};base64,` + fs.readFileSync(filePath).toString('base64');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Render 1 Preview Image Per Template (--preview-all)
// ─────────────────────────────────────────────────────────────────────────────
async function renderAllPreviews() {
  const outDir = path.resolve(__dirname, 'TemplatesPreview');
  fs.mkdirSync(outDir, { recursive: true });

  const defaultCovers = [
    path.join(__dirname, 'COVER.png'),
    path.join(__dirname, 'COVER.webp'),
    path.join(__dirname, 'COVER.jpg'),
    path.resolve("C:/Users/kayan/Pictures/Apps/IGVIDGEN/SpotifyVisualizer/bin/Release/net8.0/Assets/COVER.png"),
    "/home/kayan/Desktop/IGVIDGEN/COVER.png",
    "/home/kayan/Desktop/IGVIDGEN/COVER.webp",
    "/home/kayan/Desktop/IGVIDGEN/Assets/COVER.png"
  ];
  const coverPath = defaultCovers.find(p => fs.existsSync(p)) || defaultCovers[0];
  const coverDataUrl = getImageDataUrl(coverPath);

  const songMeta = {
    title: 'Group Chat',
    artist: 'Famous Pluto, Muyeez',
    songDuration: 141,
    currentSongSec: 78,
    progress: 0.553,
    background: { type: 'blur', name: 'Cover Art Ambient Blur' }
  };

  console.log('\n  🎨  Generating 1 High-Resolution Image for each of the 20 templates...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', `--window-size=${WIDTH},${HEIGHT}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  for (const tpl of TEMPLATES) {
    const filename = `template_${tpl}.png`;
    const outPath = path.join(outDir, filename);
    process.stdout.write(`    • [${tpl.toUpperCase().padEnd(10)}] -> ${filename}... `);

    const html = getTemplateHtml(tpl, { ...songMeta, coverDataUrl });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: outPath, type: 'png' });
    console.log('✓');
  }

  await browser.close();
  console.log(`\n  ✅  All 20 template images created in:\n      ${outDir}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Video Render Loop (Multi-Template with Active Per-Frame Motion)
// ─────────────────────────────────────────────────────────────────────────────
async function renderVideo(cfg) {
  const coverDataUrl = getImageDataUrl(cfg.coverPath);
  const totalFrames = FPS * cfg.clipDuration;

  console.log(`
  🎬  Template    : ${cfg.template.toUpperCase()}
  🎵  Title       : ${cfg.title}
  🎤  Artist      : ${cfg.artist}
  ⏱   Song length : ${formatTs(cfg.songDuration)}
  🎬  Clip length : ${cfg.clipDuration}s  (${totalFrames} frames)
  📍  Starts at   : ${formatTs(cfg.startOffset)}
  🎨  Background  : [${cfg.background.type.toUpperCase()}] ${cfg.background.name}
  🖼   Cover       : ${path.basename(cfg.coverPath)}
  💾  Output      : ${cfg.outputPath}
  `);

  process.stdout.write('  Starting browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      `--window-size=${WIDTH},${HEIGHT}`,
      '--disable-web-security', '--font-render-hinting=none',
      '--disable-accelerated-2d-canvas', '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const html = getTemplateHtml(cfg.template, {
    coverDataUrl,
    artist: cfg.artist,
    title: cfg.title,
    songDuration: cfg.songDuration,
    currentSongSec: cfg.startOffset,
    progress: cfg.startOffset / cfg.songDuration,
    background: cfg.background
  });

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluateHandle('document.fonts.ready');

  console.log(' ready!');
  process.stdout.write('  Rendering ');

  const ffmpeg = spawn('ffmpeg', [
    '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-video_size', `${WIDTH}x${HEIGHT}`, '-framerate', String(FPS),
    '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
    '-threads', '2',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
    cfg.outputPath
  ], { stdio: ['pipe', 'ignore', 'ignore'] });

  ffmpeg.on('error', e => console.error('\nFFmpeg error:', e.message));

  const start = Date.now();
  let lastDot = -1;

  for (let frame = 0; frame < totalFrames; frame++) {
    const elapsedInClip  = frame / FPS;
    const currentSongSec = cfg.startOffset + elapsedInClip;
    const progress       = Math.min(1, currentSongSec / cfg.songDuration);
    const barPct         = (progress * 100).toFixed(3);
    const elapsed        = formatTs(Math.floor(currentSongSec));
    const remaining      = formatTs(Math.max(0, Math.floor(cfg.songDuration - currentSongSec)));
    const ms             = String(Math.floor((currentSongSec % 1) * 100)).padStart(2, '0');

    // ── Execute Per-Frame Motion in DOM ──
    await page.evaluate(({ tpl, frame, barPct, elapsed, remaining, ms, songDurationSec }) => {
      // 1. Spotify & Apple
      const fill = document.getElementById('progress-fill');
      if (fill) fill.style.width = barPct + '%';
      const tL = document.getElementById('time-left');
      if (tL) tL.textContent = elapsed;
      const tR = document.getElementById('time-right');
      if (tR) tR.textContent = '-' + remaining;

      // 2. Vinyl: 360° Continuous Smooth Rotation of grooved disc & center art
      const vinylDisc = document.getElementById('vinyl-disc');
      if (vinylDisc) {
        const deg = (frame * 1.6) % 360;
        vinylDisc.style.transform = `rotate(${deg}deg)`;
      }

      // 3. Cassette: Rotating tape spools & mechanical counter
      const sL = document.getElementById('spool-l');
      const sR = document.getElementById('spool-r');
      if (sL && sR) {
        const deg = (frame * 2.5) % 360;
        sL.style.transform = `rotate(${deg}deg)`;
        sR.style.transform = `rotate(${deg}deg)`;
      }
      const cNum = document.getElementById('tape-counter');
      if (cNum) cNum.textContent = String(Math.floor(frame / 3)).padStart(3, '0');

      // 4. CarPlay
      const carFill = document.getElementById('car-fill');
      if (carFill) carFill.style.width = barPct + '%';

      // 5. CD
      const cdFill = document.getElementById('cd-fill');
      if (cdFill) cdFill.style.width = barPct + '%';

      // 6. SoundCloud: Waveform bars fill up as song plays
      const wave = document.getElementById('wave-box');
      if (wave) {
        const bars = wave.children;
        const total = bars.length;
        const playedCount = Math.floor((barPct / 100) * total);
        for (let i = 0; i < total; i++) {
          bars[i].style.background = i <= playedCount ? '#ff5500' : 'rgba(255,255,255,0.22)';
        }
      }

      // 7. Graphic Poster: Active Millisecond Timecode & Pulsing VU-Meter
      const liveTime = document.getElementById('live-timecode');
      if (liveTime) liveTime.textContent = `${elapsed}.${ms}`;
      const recDot = document.getElementById('rec-dot');
      if (recDot) recDot.style.opacity = (frame % 30 < 15) ? '1' : '0.2';
      const pFill = document.getElementById('poster-fill');
      if (pFill) pFill.style.width = barPct + '%';

      const vu = document.getElementById('vu-meter');
      if (vu) {
        const bars = vu.children;
        for (let i = 0; i < bars.length; i++) {
          const h = 25 + Math.sin(frame * 0.25 + i * 0.7) * 45 + (i % 4) * 8;
          bars[i].style.height = Math.max(10, Math.min(100, h)) + '%';
        }
      }

      // 8. LockScreen (iPhone iOS 18)
      const lockFill = document.getElementById('lock-fill');
      if (lockFill) lockFill.style.width = barPct + '%';
      const lockElapsed = document.getElementById('lock-elapsed');
      if (lockElapsed) lockElapsed.textContent = elapsed;
      const lockRemaining = document.getElementById('lock-remaining');
      if (lockRemaining) lockRemaining.textContent = '-' + remaining;
      const islandWave = document.getElementById('island-wave');
      if (islandWave) {
        const bars = islandWave.children;
        for (let i = 0; i < bars.length; i++) {
          const h = 8 + Math.abs(Math.sin(frame * 0.28 + i * 1.1)) * 16;
          bars[i].style.height = `${Math.round(h)}px`;
        }
      }

      // 9. iPod Classic
      const ipodFill = document.getElementById('ipod-fill');
      if (ipodFill) ipodFill.style.width = barPct + '%';
      const ipodDiamond = document.getElementById('ipod-diamond');
      if (ipodDiamond) ipodDiamond.style.left = barPct + '%';
      const ipodElapsed = document.getElementById('ipod-elapsed');
      if (ipodElapsed) ipodElapsed.textContent = elapsed;
      const ipodRemaining = document.getElementById('ipod-remaining');
      if (ipodRemaining) ipodRemaining.textContent = '-' + remaining;

      // 10. Incoming Call
      const callTimer = document.getElementById('call-timer');
      if (callTimer) callTimer.textContent = `${elapsed} • CONNECTED`;
      const btnAccept = document.getElementById('btn-accept-glow');
      if (btnAccept) {
        const pulse = 25 + Math.sin(frame * 0.25) * 20;
        btnAccept.style.boxShadow = `0 0 ${pulse}px rgba(48,209,88,0.7)`;
      }

      // 11. VHS Camcorder
      const vhsRec = document.getElementById('vhs-rec-dot');
      if (vhsRec) vhsRec.style.opacity = (frame % 30 < 15) ? '1' : '0.15';
      const vhsTime = document.getElementById('vhs-timecode');
      if (vhsTime) vhsTime.textContent = `REC 00:${elapsed}:${ms}`;

      // 12. Winamp Retro
      const winampEq = document.getElementById('winamp-eq');
      if (winampEq) {
        const bars = winampEq.children;
        for (let i = 0; i < bars.length; i++) {
          const h = 25 + Math.sin(frame * 0.32 + i * 0.55) * 45 + ((i * 7) % 25);
          bars[i].style.height = Math.max(12, Math.min(100, h)) + '%';
        }
      }
      const winampLcd = document.getElementById('winamp-lcd');
      if (winampLcd) winampLcd.textContent = elapsed;

      // 13. Vinyl Receipt
      const receiptTime = document.getElementById('receipt-time');
      if (receiptTime) receiptTime.textContent = `${elapsed}.${ms}`;
      const receiptFill = document.getElementById('receipt-fill');
      if (receiptFill) receiptFill.style.width = barPct + '%';

      // 14. 1980s Vintage Boombox
      const needleL = document.getElementById('boombox-needle-l');
      const needleR = document.getElementById('boombox-needle-r');
      if (needleL) {
        const a1 = 5 + Math.sin(frame * 0.28) * 22 + Math.cos(frame * 0.45) * 8;
        needleL.style.transform = `rotate(${Math.max(-10, Math.min(35, a1))}deg)`;
      }
      if (needleR) {
        const a2 = 8 + Math.sin(frame * 0.24 + 1.2) * 20 + Math.cos(frame * 0.5 + 0.5) * 9;
        needleR.style.transform = `rotate(${Math.max(-10, Math.min(35, a2))}deg)`;
      }
      const boomboxTime = document.getElementById('boombox-time');
      if (boomboxTime) boomboxTime.textContent = elapsed;
      const boomboxTapeDot = document.getElementById('boombox-tape-dot');
      if (boomboxTapeDot) boomboxTapeDot.style.opacity = (frame % 30 < 15) ? '1' : '0.3';

      // 15. GameBoy Color
      const gbFill = document.getElementById('gb-fill');
      if (gbFill) gbFill.style.width = barPct + '%';
      const gbElapsed = document.getElementById('gb-elapsed');
      if (gbElapsed) gbElapsed.textContent = elapsed;
      const gbRemaining = document.getElementById('gb-remaining');
      if (gbRemaining) gbRemaining.textContent = '-' + remaining;
      const gbBatt = document.getElementById('gb-batt');
      if (gbBatt) gbBatt.style.opacity = (frame % 60 < 50) ? '1' : '0.5';

      // 16. Studio DAW
      const dawEq = document.getElementById('daw-eq');
      if (dawEq) {
        const bars = dawEq.children;
        for (let i = 0; i < bars.length; i++) {
          const h = 30 + Math.sin(frame * 0.35 + i * 0.6) * 45 + ((i * 11) % 20);
          bars[i].style.height = Math.max(15, Math.min(100, h)) + '%';
        }
      }
      const dawTime = document.getElementById('daw-time');
      if (dawTime) dawTime.textContent = `${elapsed} / ${songDurationSec}`;
      const dawDb = document.getElementById('daw-db');
      if (dawDb) {
        const dbVal = (-0.5 + Math.sin(frame * 0.4) * 0.6).toFixed(1);
        dawDb.textContent = `MASTER: ${dbVal > 0 ? '+' : ''}${dbVal} dB`;
      }

      // 17. Supercar Tachometer
      const tachoNeedle = document.getElementById('tacho-needle');
      if (tachoNeedle) {
        const deg = Math.max(10, Math.min(85, 45 + Math.sin(frame * 0.32) * 25 + Math.cos(frame * 0.55) * 12));
        tachoNeedle.style.transform = `rotate(${deg}deg)`;
      }
      const tachoRpm = document.getElementById('tacho-rpm');
      if (tachoRpm) {
        const rpm = Math.round(6800 + Math.sin(frame * 0.32) * 1200 + Math.random() * 60);
        tachoRpm.textContent = rpm.toLocaleString();
      }
      const tachoSpeed = document.getElementById('tacho-speed');
      if (tachoSpeed) {
        const mph = 180 + Math.floor((frame / 15) % 18);
        tachoSpeed.textContent = `⚡ ${mph} MPH · V-MAX ACTIVE`;
      }
      const tachoFill = document.getElementById('tacho-fill');
      if (tachoFill) tachoFill.style.width = barPct + '%';
      const tachoElapsed = document.getElementById('tacho-elapsed');
      if (tachoElapsed) tachoElapsed.textContent = elapsed;
      const tachoRemaining = document.getElementById('tacho-remaining');
      if (tachoRemaining) tachoRemaining.textContent = '-' + remaining;

      // 18. 3D Cyber Times Square Billboard
      const bbTicker = document.getElementById('bb-ticker');
      if (bbTicker) {
        const shift = (frame * 4) % 1400;
        bbTicker.style.transform = `translateX(-${shift}px)`;
      }
      const bbBeacon = document.getElementById('bb-beacon-dot');
      if (bbBeacon) bbBeacon.style.opacity = (frame % 30 < 15) ? '1' : '0.2';
      const bbSweep = document.getElementById('bb-light-sweep');
      if (bbSweep) bbSweep.style.opacity = String(0.12 + Math.sin(frame * 0.12) * 0.1);

      // 19. Japanese Arcade Rhythm Game
      const arcadeNotes = document.querySelectorAll('.arcade-note');
      if (arcadeNotes.length) {
        arcadeNotes.forEach((n, idx) => {
          const baseOffset = (idx * 22) % 100;
          const pos = (baseOffset + frame * 3.8) % 95;
          n.style.top = pos + '%';
        });
      }
      const strikeLine = document.getElementById('arcade-strike-line');
      if (strikeLine) {
        const glow = 20 + Math.abs(Math.sin(frame * 0.4)) * 25;
        strikeLine.style.boxShadow = `0 0 ${glow}px #fff, 0 0 ${glow * 2}px #ff0077`;
      }
      const comboNum = document.getElementById('arcade-combo-num');
      if (comboNum) {
        const cVal = 150 + Math.floor(frame / 6);
        comboNum.textContent = `${cVal} COMBO`;
      }
      const arcadeFill = document.getElementById('arcade-fill');
      if (arcadeFill) arcadeFill.style.width = barPct + '%';
      const arcadeTime = document.getElementById('arcade-time');
      if (arcadeTime) arcadeTime.textContent = `${elapsed} / ${songDurationSec}`;
    }, { tpl: cfg.template, frame, barPct, elapsed, remaining, ms, songDurationSec: formatTs(cfg.songDuration) });

    // Screenshot & pipe frame to FFmpeg
    const pngBuf  = await page.screenshot({ type: 'png' });
    const rawRgba = await sharp(pngBuf).ensureAlpha().raw().toBuffer();
    await writeToFFmpeg(ffmpeg.stdin, rawRgba);

    const dot = Math.floor((frame / totalFrames) * 20);
    if (dot !== lastDot) { process.stdout.write('.'); lastDot = dot; }

    if (cfg.jsonProgress && (frame % 6 === 0 || frame === totalFrames - 1)) {
      process.stdout.write(JSON.stringify({ type: 'frame-progress', frame: frame + 1, totalFrames, pct: (((frame + 1) / totalFrames) * 100).toFixed(1) }) + '\n');
    }
  }

  await new Promise(res => { ffmpeg.stdin.end(); ffmpeg.on('close', res); });
  await browser.close();

  const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
  const kb         = (fs.statSync(cfg.outputPath).size / 1024).toFixed(0);

  console.log(`\n\n  ✅  Done in ${elapsedSec}s  |  ${kb} KB`);
  console.log(`  ➜   ${cfg.outputPath}\n`);

  if (cfg.jsonProgress) {
    process.stdout.write(JSON.stringify({ type: 'clip-done', outputPath: cfg.outputPath, elapsedSec, kb }) + '\n');
  }
}

function writeToFFmpeg(stdin, buf) {
  return new Promise((resolve, reject) => {
    const ok = stdin.write(buf, err => { if (err) reject(err); else resolve(); });
    if (!ok) stdin.once('drain', resolve);
  });
}

function parseDuration(s) {
  s = s.trim();
  if (s.includes(':')) { const [m, sec] = s.split(':').map(Number); return m * 60 + sec; }
  return parseInt(s, 10) || 0;
}

function formatTs(sec) {
  sec = Math.max(0, Math.floor(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Template Switchboard
// ─────────────────────────────────────────────────────────────────────────────
function getTemplateHtml(tpl, data) {
  switch (tpl) {
    case 'apple':      return htmlApple(data);
    case 'vinyl':      return htmlVinyl(data);
    case 'carplay':    return htmlCarPlay(data);
    case 'cassette':   return htmlCassette(data);
    case 'cd':         return htmlCD(data);
    case 'soundcloud': return htmlSoundCloud(data);
    case 'poster':     return htmlPoster(data);
    case 'lockscreen': return htmlLockScreen(data);
    case 'ipod':       return htmlIPod(data);
    case 'call':       return htmlIncomingCall(data);
    case 'vhs':        return htmlVHS(data);
    case 'winamp':     return htmlWinamp(data);
    case 'receipt':    return htmlReceipt(data);
    case 'boombox':    return htmlBoombox(data);
    case 'gameboy':    return htmlGameBoy(data);
    case 'daw':        return htmlDAW(data);
    case 'tachometer': return htmlTachometer(data);
    case 'billboard':  return htmlBillboard(data);
    case 'arcade':     return htmlArcade(data);
    case 'spotify':
    default:           return htmlSpotify(data);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. SPOTIFY TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
function htmlSpotify({ coverDataUrl, artist, title, songDuration, currentSongSec, progress, background }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  let bgCss = '';
  if (background && background.type === 'solid') {
    bgCss = `<div style="position:absolute;inset:0;background-color:${background.hex};"></div>
             <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 36%,rgba(255,255,255,0.06) 0%,rgba(0,0,0,0.15) 55%,rgba(0,0,0,0.65) 100%),linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 22%,transparent 62%,rgba(0,0,0,0.85) 100%);"></div>`;
  } else if (background && background.type === 'gradient') {
    bgCss = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${background.stops[0]} 0%,${background.stops[1]} 100%);"></div>
             <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,transparent 25%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.8) 100%);"></div>`;
  } else {
    bgCss = `<div style="position:absolute;inset:0;background:url('${coverDataUrl}') center/cover;filter:blur(80px) brightness(0.30) saturate(2);transform:scale(1.2);"></div>
             <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.1) 0%,transparent 25%,rgba(0,0,0,0.45) 60%,rgba(0,0,0,0.85) 100%);"></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#000;position:relative;user-select:none;}
.container{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;padding:0 52px;}
.topbar{width:100%;display:flex;align-items:center;justify-content:space-between;padding:80px 0 28px;}
.topbar-label{color:#fff;font-size:30px;font-weight:600;opacity:0.95;}
.album-wrap{width:976px;height:976px;border-radius:20px;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,0.8);margin-top:28px;}
.album-art{width:100%;height:100%;object-fit:cover;display:block;}
.song-info{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:50px;}
.song-title{color:#fff;font-size:60px;font-weight:800;letter-spacing:-0.025em;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.song-artist{color:rgba(255,255,255,0.6);font-size:40px;font-weight:500;margin-top:10px;}
.progress-section{width:100%;margin-top:50px;}
.progress-track{width:100%;height:6px;background:rgba(255,255,255,0.22);border-radius:3px;position:relative;}
.progress-fill{height:100%;background:#fff;border-radius:3px;width:${barPct}%;position:relative;}
.progress-knob{position:absolute;right:-14px;top:50%;transform:translateY(-50%);width:28px;height:28px;background:#fff;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.45);}
.progress-times{display:flex;justify-content:space-between;margin-top:20px;color:rgba(255,255,255,0.5);font-size:32px;font-weight:500;}
.controls{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:52px;}
.play-btn{width:144px;height:144px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 40px rgba(0,0,0,0.4);}
.bottom-bar{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:56px;opacity:0.6;}
</style></head><body>
${bgCss}
<div class="container">
  <div class="topbar">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" opacity="0.85"><polyline points="6 9 12 15 18 9" stroke="white" stroke-width="2.2" stroke-linecap="round"/></svg>
    <span class="topbar-label">Now Playing</span>
    <svg width="36" height="10" viewBox="0 0 36 10" fill="white" opacity="0.85"><circle cx="5" cy="5" r="4.5"/><circle cx="18" cy="5" r="4.5"/><circle cx="31" cy="5" r="4.5"/></svg>
  </div>
  <div class="album-wrap"><img class="album-art" src="${coverDataUrl}" /></div>
  <div class="song-info">
    <div style="flex:1;min-width:0;">
      <div class="song-title">${escHtml(title)}</div>
      <div class="song-artist">${escHtml(artist)}</div>
    </div>
    <div style="flex-shrink:0;margin-left:32px;">
      <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="rgba(255,255,255,0.65)" stroke-width="1.8" stroke-linecap="round"/></svg>
    </div>
  </div>
  <div class="progress-section">
    <div class="progress-track"><div id="progress-fill" class="progress-fill"><div class="progress-knob"></div></div></div>
    <div class="progress-times"><span id="time-left">${elapsed}</span><span id="time-right">-${remaining}</span></div>
  </div>
  <div class="controls">
    <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><polyline points="16 3 21 3 21 8" stroke="white" stroke-width="2"/><line x1="4" y1="20" x2="21" y2="3" stroke="white" stroke-width="2"/><polyline points="21 16 21 21 16 21" stroke="white" stroke-width="2"/><line x1="15" y1="9" x2="21" y2="15" stroke="white" stroke-width="2"/></svg>
    <svg width="76" height="76" viewBox="0 0 24 24" fill="white"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="white" stroke-width="2.5"/></svg>
    <div class="play-btn"><svg width="64" height="64" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="black"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="black"/></svg></div>
    <svg width="76" height="76" viewBox="0 0 24 24" fill="white"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="white" stroke-width="2.5"/></svg>
    <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><polyline points="17 1 21 5 17 9" stroke="white" stroke-width="2"/><path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="white" stroke-width="2"/><polyline points="7 23 3 19 7 15" stroke="white" stroke-width="2"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="white" stroke-width="2"/></svg>
  </div>
  <div class="bottom-bar">
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="white" stroke-width="1.8"/><line x1="8" y1="21" x2="16" y2="21" stroke="white" stroke-width="1.8"/><line x1="12" y1="17" x2="12" y2="21" stroke="white" stroke-width="1.8"/></svg>
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="white" stroke-width="1.8"/><polyline points="16 6 12 2 8 6" stroke="white" stroke-width="1.8"/><line x1="12" y1="2" x2="12" y2="15" stroke="white" stroke-width="1.8"/></svg>
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="white" stroke-width="1.8"/><line x1="8" y1="12" x2="21" y2="12" stroke="white" stroke-width="1.8"/><line x1="8" y1="18" x2="21" y2="18" stroke="white" stroke-width="1.8"/><circle cx="3" cy="6" r="1.8" fill="white"/><circle cx="3" cy="12" r="1.8" fill="white"/><circle cx="3" cy="18" r="1.8" fill="white"/></svg>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. APPLE MUSIC TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
function htmlApple({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#000;position:relative;}
.bg{position:absolute;inset:-40px;background:url('${coverDataUrl}') center/cover;filter:blur(90px) brightness(0.42) saturate(2.2);transform:scale(1.15);}
.bg-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.05) 30%,rgba(0,0,0,0.55) 70%,rgba(0,0,0,0.92) 100%);}
.wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:85px 60px 60px;}
.bar-pill{width:72px;height:6px;background:rgba(255,255,255,0.3);border-radius:3px;margin-bottom:45px;}
.card{width:960px;height:960px;border-radius:36px;overflow:hidden;box-shadow:0 45px 120px rgba(0,0,0,0.75);margin-bottom:50px;}
.card img{width:100%;height:100%;object-fit:cover;display:block;}
.meta{width:100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;}
.badges{width:100%;display:flex;gap:14px;margin-bottom:40px;}
.badge{background:rgba(255,255,255,0.15);padding:6px 16px;border-radius:8px;color:rgba(255,255,255,0.9);font-size:20px;font-weight:600;text-transform:uppercase;}
.progress{width:100%;margin-bottom:55px;}
.p-track{width:100%;height:8px;background:rgba(255,255,255,0.22);border-radius:4px;position:relative;}
.p-fill{width:${barPct}%;height:100%;background:#fff;border-radius:4px;}
.p-times{display:flex;justify-content:space-between;margin-top:14px;color:rgba(255,255,255,0.55);font-size:26px;}
.controls{width:100%;display:flex;justify-content:space-around;align-items:center;margin-bottom:55px;}
.vol{width:100%;display:flex;align-items:center;gap:24px;padding:0 10px;margin-bottom:45px;}
.vol-bar{flex:1;height:10px;background:rgba(255,255,255,0.22);border-radius:5px;}
.vol-fill{width:72%;height:100%;background:rgba(255,255,255,0.85);border-radius:5px;}
.btm{width:100%;display:flex;justify-content:space-around;align-items:center;opacity:0.85;}
</style></head><body>
<div class="bg"></div><div class="bg-overlay"></div>
<div class="wrap">
  <div class="bar-pill"></div>
  <div class="card"><img src="${coverDataUrl}" /></div>
  <div class="meta">
    <div>
      <div style="color:#fff;font-size:54px;font-weight:700;line-height:1.15;">${escHtml(title)}</div>
      <div style="color:rgba(255,255,255,0.75);font-size:38px;font-weight:500;margin-top:8px;">${escHtml(artist)}</div>
    </div>
    <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    </div>
  </div>
  <div class="badges"><span class="badge">Lossless</span><span class="badge">Dolby Atmos</span><span class="badge">Apple Digital Master</span></div>
  <div class="progress">
    <div class="p-track"><div id="progress-fill" class="p-fill"></div></div>
    <div class="p-times"><span id="time-left">${elapsed}</span><span id="time-right">-${remaining}</span></div>
  </div>
  <div class="controls">
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="white" stroke-width="2.5"/></svg>
    <svg width="88" height="88" viewBox="0 0 24 24" fill="white"><rect x="5" y="3" width="5" height="18" rx="2"/><rect x="14" y="3" width="5" height="18" rx="2"/></svg>
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="white" stroke-width="2.5"/></svg>
  </div>
  <div class="vol">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
    <div class="vol-bar"><div class="vol-fill"></div></div>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
  </div>
  <div class="btm">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="white"/><circle cx="3" cy="12" r="1.5" fill="white"/><circle cx="3" cy="18" r="1.5" fill="white"/></svg>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  3. VINYL RECORD TEMPLATE (Spinning 360° disc)
// ─────────────────────────────────────────────────────────────────────────────
function htmlVinyl({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Space+Grotesk:wght@500;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:radial-gradient(circle at 50% 40%,#1e1b18 0%,#0d0c0a 70%,#050504 100%);color:#fff;}
.header{text-align:center;padding-top:80px;letter-spacing:0.25em;font-size:24px;color:rgba(255,255,255,0.5);text-transform:uppercase;font-weight:700;}
.stage{position:relative;width:1000px;height:960px;margin:40px auto 0;display:flex;justify-content:center;align-items:center;}
.disc{width:820px;height:820px;border-radius:50%;background:repeating-radial-gradient(circle at center,#111 0px,#111 2px,#181818 3px,#0d0d0d 5px);box-shadow:0 40px 100px rgba(0,0,0,0.9);position:relative;display:flex;align-items:center;justify-content:center;will-change:transform;}
.disc::before{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 45deg,transparent 0deg,rgba(255,255,255,0.08) 45deg,transparent 90deg,rgba(255,255,255,0.08) 135deg,transparent 180deg,rgba(255,255,255,0.08) 225deg,transparent 270deg,rgba(255,255,255,0.08) 315deg,transparent 360deg);}
.label{width:320px;height:320px;border-radius:50%;overflow:hidden;border:12px solid #000;position:relative;z-index:2;}
.label img{width:100%;height:100%;object-fit:cover;}
.hole{position:absolute;width:34px;height:34px;border-radius:50%;background:#000;border:4px solid #333;z-index:3;}
.tonearm{position:absolute;top:-20px;right:40px;width:180px;height:500px;pointer-events:none;z-index:10;}
.t-head{position:absolute;bottom:40px;left:10px;width:44px;height:75px;background:#2a2a2a;border-radius:4px;transform:rotate(24deg);box-shadow:0 10px 25px rgba(0,0,0,0.8);border:1px solid #444;}
.t-rod{position:absolute;top:40px;right:40px;width:8px;height:420px;background:linear-gradient(90deg,#888,#ddd,#666);transform:rotate(-15deg);transform-origin:top right;border-radius:4px;}
.t-base{position:absolute;top:10px;right:20px;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,#555,#222);border:2px solid #666;}
.info{margin-top:60px;text-align:center;padding:0 60px;}
.rpm{display:inline-block;padding:6px 18px;border:1px solid rgba(255,200,120,0.4);color:#ffc878;font-size:20px;border-radius:50px;letter-spacing:0.15em;margin-bottom:25px;text-transform:uppercase;font-weight:700;}
.title{font-family:'Cinzel',serif;font-size:64px;font-weight:700;letter-spacing:0.04em;margin-bottom:12px;}
.artist{font-size:38px;color:rgba(255,255,255,0.65);letter-spacing:0.08em;text-transform:uppercase;}
.timeline{width:960px;margin:60px auto 0;}
.t-bar{width:100%;height:6px;background:rgba(255,255,255,0.18);border-radius:3px;position:relative;}
.t-fill{width:${barPct}%;height:100%;background:#ffc878;border-radius:3px;}
.t-times{display:flex;justify-content:space-between;margin-top:18px;color:rgba(255,255,255,0.45);font-size:26px;}
</style></head><body>
<div class="header">Audiophile Analog Master • 33 ⅓ RPM</div>
<div class="stage">
  <div id="vinyl-disc" class="disc">
    <div class="label"><img src="${coverDataUrl}" /></div>
    <div class="hole"></div>
  </div>
  <div class="tonearm"><div class="t-base"></div><div class="t-rod"></div><div class="t-head"></div></div>
</div>
<div class="info">
  <div class="rpm">Side A • High Fidelity Stereo</div>
  <div class="title">${escHtml(title)}</div>
  <div class="artist">${escHtml(artist)}</div>
</div>
<div class="timeline">
  <div class="t-bar"><div id="progress-fill" class="t-fill"></div></div>
  <div class="t-times"><span id="time-left">${elapsed}</span><span id="time-right">-${remaining}</span></div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. CARPLAY / NIGHT DRIVE TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
function htmlCarPlay({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#08090c;color:#fff;}
.bg{position:absolute;inset:0;background:radial-gradient(circle at 20% 25%,rgba(255,100,50,0.3) 0%,transparent 40%),radial-gradient(circle at 80% 20%,rgba(50,150,255,0.3) 0%,transparent 45%),linear-gradient(180deg,#050608 0%,#0a0d14 45%,#050608 100%);filter:blur(10px);}
.status{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:80px 70px 30px;font-family:'JetBrains Mono',monospace;font-size:26px;color:rgba(255,255,255,0.7);}
.frame{position:relative;z-index:2;width:980px;margin:40px auto 0;background:rgba(18,22,32,0.75);backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.12);border-radius:40px;padding:60px 50px;box-shadow:0 40px 120px rgba(0,0,0,0.85);}
.art{width:880px;height:880px;border-radius:28px;overflow:hidden;margin:0 auto 50px;}
.art img{width:100%;height:100%;object-fit:cover;display:block;}
.c-title{font-size:60px;font-weight:800;margin-bottom:12px;}
.c-artist{font-size:38px;color:rgba(255,255,255,0.65);font-weight:500;}
.bar{width:100%;height:8px;background:rgba(255,255,255,0.18);border-radius:4px;margin-top:50px;}
.fill{width:${barPct}%;height:100%;background:#3b82f6;border-radius:4px;box-shadow:0 0 16px rgba(59,130,246,0.6);}
.times{display:flex;justify-content:space-between;margin-top:14px;font-size:26px;color:rgba(255,255,255,0.5);}
.ctrls{display:flex;justify-content:space-between;align-items:center;padding:0 40px;margin-top:45px;}
</style></head><body>
<div class="bg"></div>
<div class="status">
  <div style="display:flex;align-items:center;gap:18px;font-size:32px;font-weight:700;"><span>11:42 PM</span><span style="font-size:22px;color:#3b82f6;">● NIGHT DRIVE</span></div>
  <div>72°F · 5G · 98%</div>
</div>
<div class="frame">
  <div class="art"><img src="${coverDataUrl}" /></div>
  <div>
    <div class="c-title">${escHtml(title)}</div>
    <div class="c-artist">${escHtml(artist)}</div>
  </div>
  <div class="bar"><div id="car-fill" class="fill"></div></div>
  <div class="times"><span id="time-left">${elapsed}</span><span id="time-right">-${remaining}</span></div>
  <div class="ctrls">
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="white" stroke-width="2.5"/></svg>
    <svg width="90" height="90" viewBox="0 0 24 24" fill="white"><rect x="5" y="3" width="5" height="18" rx="2"/><rect x="14" y="3" width="5" height="18" rx="2"/></svg>
    <svg width="68" height="68" viewBox="0 0 24 24" fill="white"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="white" stroke-width="2.5"/></svg>
  </div>
</div>
<div style="text-align:center;margin-top:60px;font-size:22px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;font-weight:600;">Apple CarPlay • In-Dash Media</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. RETRO CASSETTE TAPE (Revolving spools & mechanical counter)
// ─────────────────────────────────────────────────────────────────────────────
function htmlCassette({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;700;800&family=VT323&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:radial-gradient(circle at 50% 35%,#2a1b18 0%,#120c0a 65%,#050303 100%);color:#fff;display:flex;flex-direction:column;align-items:center;}
.tag{margin-top:80px;font-family:'VT323',monospace;font-size:38px;color:#ff6b4a;letter-spacing:0.15em;}
.cassette{width:980px;height:630px;margin-top:60px;background:rgba(30,25,25,0.85);border:4px solid #4a3c39;border-radius:36px;position:relative;box-shadow:0 40px 100px rgba(0,0,0,0.9);padding:30px;}
.label{width:100%;height:380px;background:#e8e3d5;border-radius:18px;position:relative;overflow:hidden;border:2px solid #b5ad98;display:flex;flex-direction:column;justify-content:space-between;padding:24px 32px;}
.l-top{display:flex;justify-content:space-between;align-items:center;color:#8b2500;font-weight:800;font-size:24px;}
.h-title{font-family:'Caveat',cursive;color:#1a1a2e;font-size:64px;font-weight:700;}
.h-artist{font-family:'Caveat',cursive;color:#444;font-size:42px;}
.cutout{width:580px;height:140px;margin:0 auto;background:#110d0c;border:3px solid #6b5c58;border-radius:16px;display:flex;justify-content:space-around;align-items:center;position:relative;}
.spool{width:90px;height:90px;border-radius:50%;background:#e8e3d5;border:8px solid #b5ad98;display:flex;align-items:center;justify-content:center;will-change:transform;}
.teeth{width:32px;height:32px;background:#110d0c;border-radius:50%;border:4px dashed #666;}
.stamp{position:absolute;right:28px;bottom:20px;width:110px;height:110px;border-radius:12px;overflow:hidden;border:3px solid #fff;}
.stamp img{width:100%;height:100%;object-fit:cover;}
.meta{width:980px;margin-top:80px;text-align:center;}
.prog{width:980px;margin-top:60px;}
.p-bar{width:100%;height:8px;background:rgba(255,255,255,0.2);border-radius:4px;}
.p-fill{width:${barPct}%;height:100%;background:#ff6b4a;border-radius:4px;}
.p-times{display:flex;justify-content:space-between;margin-top:16px;font-size:28px;color:rgba(255,255,255,0.5);}
</style></head><body>
<div class="tag">● TDK HIGH POSITION TYPE II • C-90</div>
<div class="cassette">
  <div class="label">
    <div class="l-top"><span>SIDE A · STEREO</span><span id="tape-counter" style="font-family:'VT323';font-size:32px;color:#000;">042</span></div>
    <div>
      <div class="h-title">${escHtml(title)}</div>
      <div class="h-artist">${escHtml(artist)}</div>
    </div>
    <div class="cutout">
      <div style="position:absolute;width:340px;height:60px;background:linear-gradient(90deg,#3d261a,#523524,#3d261a);"></div>
      <div id="spool-l" class="spool"><div class="teeth"></div></div>
      <div id="spool-r" class="spool"><div class="teeth"></div></div>
    </div>
    <div class="stamp"><img src="${coverDataUrl}" /></div>
  </div>
</div>
<div class="meta">
  <div style="font-size:68px;font-weight:800;margin-bottom:10px;">${escHtml(title)}</div>
  <div style="font-size:40px;color:rgba(255,255,255,0.65);">${escHtml(artist)}</div>
</div>
<div class="prog">
  <div class="p-bar"><div id="progress-fill" class="p-fill"></div></div>
  <div class="p-times"><span id="time-left">${elapsed}</span><span id="time-right">-${remaining}</span></div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  6. Y2K CD JEWEL CASE
// ─────────────────────────────────────────────────────────────────────────────
function htmlCD({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Space+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:radial-gradient(circle at 50% 35%,#181c24 0%,#0a0c10 70%,#030406 100%);color:#fff;display:flex;flex-direction:column;align-items:center;}
.h-cd{margin-top:80px;font-family:'Space Mono',monospace;font-size:24px;color:rgba(255,255,255,0.45);letter-spacing:0.25em;}
.case{width:960px;height:960px;margin-top:40px;position:relative;background:rgba(255,255,255,0.04);border:8px solid rgba(255,255,255,0.22);border-radius:12px;box-shadow:0 50px 140px rgba(0,0,0,0.9);display:flex;overflow:hidden;}
.spine{width:70px;height:100%;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.1) 0px,rgba(255,255,255,0.1) 6px,transparent 6px,transparent 14px);border-right:4px solid rgba(255,255,255,0.25);}
.area{flex:1;height:100%;position:relative;overflow:hidden;}
.area img{width:100%;height:100%;object-fit:cover;display:block;}
.shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.05) 30%,transparent 60%);pointer-events:none;}
.seal{position:absolute;top:30px;right:30px;padding:8px 16px;background:repeating-linear-gradient(45deg,#f093fb,#f5576c,#4facfe,#00f2fe);border-radius:6px;font-size:16px;font-weight:900;color:#000;}
.info{width:960px;margin-top:60px;}
.bar{width:100%;height:8px;background:rgba(255,255,255,0.18);border-radius:4px;margin-top:50px;}
.fill{width:${barPct}%;height:100%;background:#4facfe;border-radius:4px;box-shadow:0 0 20px #00f2fe;}
.times{display:flex;justify-content:space-between;margin-top:14px;font-size:26px;color:rgba(255,255,255,0.5);}
</style></head><body>
<div class="h-cd">COMPACT DISC DIGITAL AUDIO • ORIGINAL MASTER</div>
<div class="case">
  <div class="spine"></div>
  <div class="area">
    <img src="${coverDataUrl}" />
    <div class="shine"></div>
    <div class="seal">GENUINE Y2K AUDIO</div>
  </div>
</div>
<div class="info">
  <div style="font-size:64px;font-weight:900;margin-bottom:10px;">${escHtml(title)}</div>
  <div style="font-size:40px;color:rgba(255,255,255,0.65);">${escHtml(artist)}</div>
  <div class="bar"><div id="cd-fill" class="fill"></div></div>
  <div class="times"><span id="time-left">${elapsed}</span><span id="time-right">-${remaining}</span></div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  7. SOUNDCLOUD WAVEFORM
// ─────────────────────────────────────────────────────────────────────────────
function htmlSoundCloud({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const bars = [15,22,45,60,85,90,70,55,40,65,95,100,80,60,45,75,90,65,50,70,85,90,100,75,60,50,80,95,70,55,40,60,75,90,85,70,50,30,55,75,90,95,80,60,40,30,45,65,80,95,85,70,55,40,60,80,90,75,60,40];
  const barHtml = bars.map((h, i) => {
    const isPlayed = (i / bars.length) * 100 <= (progress * 100);
    const bg = isPlayed ? '#ff5500' : 'rgba(255,255,255,0.22)';
    return `<div style="flex:1;height:${h}%;background:${bg};border-radius:3px;"></div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#111;color:#fff;padding:80px 60px;display:flex;flex-direction:column;justify-content:space-between;}
.head{display:flex;justify-content:space-between;align-items:center;}
.art{width:960px;height:960px;border-radius:20px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.8);margin:30px 0;}
.art img{width:100%;height:100%;object-fit:cover;display:block;}
.wave{width:100%;height:160px;display:flex;align-items:flex-end;gap:6px;background:rgba(0,0,0,0.4);border-radius:16px;padding:20px 24px;margin-bottom:20px;}
.stats{display:flex;gap:36px;margin-top:30px;}
.pill{display:flex;align-items:center;gap:10px;font-size:24px;color:rgba(255,255,255,0.7);background:rgba(255,255,255,0.08);padding:10px 20px;border-radius:50px;}
</style></head><body>
<div class="head">
  <div style="display:flex;align-items:center;gap:12px;font-size:24px;font-weight:700;color:#ff5500;letter-spacing:0.1em;">
    <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff5500;"></span>
    <span>AUDIO WAVEFORM VISUALIZER</span>
  </div>
  <div style="background:rgba(255,85,0,0.14);color:#ff5500;padding:6px 18px;border-radius:20px;font-weight:700;font-size:20px;">320 KBPS HQ</div>
</div>
<div class="art"><img src="${coverDataUrl}" /></div>
<div>
  <div style="font-size:64px;font-weight:900;margin-bottom:12px;">${escHtml(title)}</div>
  <div style="font-size:40px;color:rgba(255,255,255,0.7);font-weight:500;">${escHtml(artist)}</div>
</div>
<div style="margin-bottom:40px;">
  <div id="wave-box" class="wave">${barHtml}</div>
  <div style="display:flex;justify-content:space-between;font-size:26px;color:rgba(255,255,255,0.5);font-weight:600;">
    <span id="time-left" style="color:#ff5500;">${elapsed}</span>
    <span>${formatTs(songDuration)}</span>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  8. SWISS GRAPHIC POSTER (Active Live Timecode & Pulsing VU-Meter)
// ─────────────────────────────────────────────────────────────────────────────
function htmlPoster({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const ms = String(Math.floor((currentSongSec % 1) * 100)).padStart(2, '0');
  const barPct = (Math.min(1, progress) * 100).toFixed(3);

  // Generate 16 initial VU meter bars
  let vuHtml = '';
  for (let i = 0; i < 16; i++) {
    vuHtml += `<div style="flex:1;height:50%;background:#161513;border-radius:2px;transition:height 0.05s ease;"></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:#f4efe6;color:#161513;padding:80px 70px;display:flex;flex-direction:column;justify-content:space-between;}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #161513;padding-bottom:24px;}
.frame{width:940px;height:940px;border:3px solid #161513;box-shadow:18px 18px 0px #161513;margin:30px 0;overflow:hidden;}
.frame img{width:100%;height:100%;object-fit:cover;display:block;}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;border-top:3px solid #161513;border-bottom:3px solid #161513;padding:24px 0;}
.spec-label{font-size:18px;color:#666;font-weight:500;text-transform:uppercase;margin-bottom:4px;}
.spec-val{font-size:26px;font-weight:700;}
.prog-bar{width:100%;height:8px;background:rgba(22,21,19,0.18);border-radius:4px;margin-top:14px;}
.prog-fill{width:${barPct}%;height:100%;background:#e63946;border-radius:4px;}
.vu-box{width:220px;height:48px;display:flex;align-items:flex-end;gap:5px;background:rgba(0,0,0,0.06);border-radius:6px;padding:6px 8px;}
</style></head><body>
<div class="top">
  <div style="font-size:24px;font-weight:700;letter-spacing:0.1em;">ARCHIVE SPECIMEN № 042 // CURATOR EDITION</div>
  <div style="display:flex;align-items:center;gap:12px;font-size:24px;font-weight:700;color:#e63946;">
    <span id="rec-dot" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#e63946;"></span>
    <span>LIVE 24-BIT MASTER</span>
  </div>
</div>

<div class="frame"><img src="${coverDataUrl}" /></div>

<div>
  <div style="font-family:'Syne',sans-serif;font-size:78px;font-weight:800;letter-spacing:-0.04em;line-height:0.95;margin-bottom:12px;">${escHtml(title)}</div>
  <div style="font-size:40px;font-weight:700;color:#e63946;text-transform:uppercase;">${escHtml(artist)}</div>
  <div class="prog-bar"><div id="poster-fill" class="prog-fill"></div></div>
</div>

<div class="grid">
  <div>
    <div class="spec-label">Timecode</div>
    <div id="live-timecode" class="spec-val" style="font-family:'JetBrains Mono',monospace;color:#e63946;">${elapsed}.${ms}</div>
  </div>
  <div>
    <div class="spec-label">Length</div>
    <div class="spec-val">${formatTs(songDuration)}</div>
  </div>
  <div>
    <div class="spec-label">Tempo</div>
    <div class="spec-val">128 BPM</div>
  </div>
  <div>
    <div class="spec-label">Audio Monitor</div>
    <div id="vu-meter" class="vu-box">${vuHtml}</div>
  </div>
</div>

<div style="display:flex;justify-content:space-between;align-items:center;">
  <div style="display:flex;gap:12px;">
    <div style="width:38px;height:38px;border-radius:50%;border:2px solid #161513;background:#b91d22;"></div>
    <div style="width:38px;height:38px;border-radius:50%;border:2px solid #161513;background:#4a5568;"></div>
    <div style="width:38px;height:38px;border-radius:50%;border:2px solid #161513;background:#e2d9c8;"></div>
    <div style="width:38px;height:38px;border-radius:50%;border:2px solid #161513;background:#161513;"></div>
  </div>
  <div style="font-family:monospace;font-size:22px;font-weight:700;">||| | ||||| |||| || | |||| ||</div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  9. IPHONE LOCK SCREEN (iOS 18 Dynamic Island & Live Activity)
// ─────────────────────────────────────────────────────────────────────────────
function htmlLockScreen({ coverDataUrl, artist, title, songDuration, currentSongSec, progress, background }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  let bgCss = `<div style="position:absolute;inset:-30px;background:url('${coverDataUrl}') center/cover;filter:blur(70px) brightness(0.35) saturate(1.8);transform:scale(1.15);"></div>`;
  if (background && background.type === 'solid') {
    bgCss = `<div style="position:absolute;inset:0;background-color:${background.hex};"></div>`;
  } else if (background && background.type === 'gradient') {
    bgCss = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${background.stops[0]} 0%,${background.stops[1]} 100%);"></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#000;position:relative;color:#fff;}
.overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 30%,rgba(0,0,0,0.6) 75%,rgba(0,0,0,0.92) 100%);}
.container{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:55px 50px 70px;align-items:center;}
.island{width:360px;height:70px;background:#000;border-radius:40px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border:1px solid rgba(255,255,255,0.08);}
.i-left{width:42px;height:42px;border-radius:50%;overflow:hidden;}
.i-left img{width:100%;height:100%;object-fit:cover;}
.i-wave{display:flex;align-items:center;gap:4px;height:24px;}
.i-bar{width:4px;background:#30d158;border-radius:2px;transition:height 0.05s ease;}
.clock-box{text-align:center;margin-top:20px;}
.date{font-size:32px;font-weight:600;color:rgba(255,255,255,0.85);margin-bottom:6px;letter-spacing:0.02em;}
.clock{font-size:160px;font-weight:700;line-height:0.95;letter-spacing:-0.04em;}
.media-card{width:100%;background:rgba(28,28,34,0.72);backdrop-filter:blur(50px);border:1px solid rgba(255,255,255,0.14);border-radius:44px;padding:36px;box-shadow:0 30px 90px rgba(0,0,0,0.75);}
.card-top{display:flex;align-items:center;gap:28px;}
.card-art{width:160px;height:160px;border-radius:24px;overflow:hidden;flex-shrink:0;box-shadow:0 12px 30px rgba(0,0,0,0.6);}
.card-art img{width:100%;height:100%;object-fit:cover;}
.card-title{font-size:42px;font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.card-artist{font-size:32px;color:rgba(255,255,255,0.65);margin-top:6px;}
.card-progress{margin-top:28px;}
.c-track{width:100%;height:8px;background:rgba(255,255,255,0.22);border-radius:4px;}
.c-fill{width:${barPct}%;height:100%;background:#fff;border-radius:4px;}
.c-times{display:flex;justify-content:space-between;margin-top:10px;font-size:22px;color:rgba(255,255,255,0.5);}
.card-ctrls{display:flex;justify-content:center;align-items:center;gap:90px;margin-top:20px;}
.bot-row{width:100%;display:flex;justify-content:space-between;align-items:center;padding:0 20px;}
.round-btn{width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.18);backdrop-filter:blur(30px);display:flex;align-items:center;justify-content:center;}
.home-pill{width:280px;height:8px;background:#fff;border-radius:4px;margin-top:30px;}
</style></head><body>
${bgCss}<div class="overlay"></div>
<div class="container">
  <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
    <div class="island">
      <div class="i-left"><img src="${coverDataUrl}" /></div>
      <div id="island-wave" class="i-wave">
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
          <div class="card-title">${escHtml(title)}</div>
          <div class="card-artist">${escHtml(artist)}</div>
        </div>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>
      </div>
      <div class="card-progress">
        <div class="c-track"><div id="lock-fill" class="c-fill"></div></div>
        <div class="c-times"><span id="lock-elapsed">${elapsed}</span><span id="lock-remaining">-${remaining}</span></div>
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
//  10. IPOD CLASSIC (2004 Click Wheel)
// ─────────────────────────────────────────────────────────────────────────────
function htmlIPod({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#0d0d10;color:#fff;display:flex;justify-content:center;align-items:center;}
.ipod{width:940px;height:1800px;background:#e5e5ea;border-radius:70px;box-shadow:0 50px 140px rgba(0,0,0,0.9),inset 0 0 30px rgba(0,0,0,0.15);padding:60px 50px;display:flex;flex-direction:column;align-items:center;border:6px solid #d1d1d6;position:relative;}
.screen{width:100%;height:820px;background:linear-gradient(180deg,#cbe2f8 0%,#b2d2f2 100%);border-radius:24px;border:8px solid #1a1a1a;box-shadow:inset 0 4px 15px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;padding:24px 30px;color:#111;overflow:hidden;}
.s-header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(0,0,0,0.25);padding-bottom:12px;font-weight:700;font-size:26px;}
.s-body{display:flex;gap:36px;align-items:center;margin:30px 0;}
.s-cover{width:460px;height:460px;border-radius:12px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.35);flex-shrink:0;}
.s-cover img{width:100%;height:100%;object-fit:cover;display:block;}
.s-info{flex:1;min-width:0;}
.s-title{font-size:46px;font-weight:800;line-height:1.15;margin-bottom:12px;color:#000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.s-artist{font-size:32px;font-weight:600;color:#333;margin-bottom:8px;}
.s-album{font-size:26px;color:#555;}
.s-scrub{margin-top:20px;}
.scrub-track{width:100%;height:12px;background:#8caecc;border-radius:6px;position:relative;border:1px solid rgba(0,0,0,0.2);}
.scrub-fill{width:${barPct}%;height:100%;background:#0a4b8c;border-radius:6px;}
.diamond{position:absolute;top:50%;left:${barPct}%;transform:translate(-50%,-50%) rotate(45deg);width:26px;height:26px;background:#fff;border:3px solid #0a4b8c;}
.scrub-times{display:flex;justify-content:space-between;margin-top:14px;font-size:24px;font-weight:700;color:#222;}
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
        <div class="s-title">${escHtml(title)}</div>
        <div class="s-artist">${escHtml(artist)}</div>
        <div class="s-album">Special Single</div>
      </div>
    </div>
    <div class="s-scrub">
      <div class="scrub-track"><div id="ipod-fill" class="scrub-fill"></div><div id="ipod-diamond" class="diamond"></div></div>
      <div class="scrub-times"><span id="ipod-elapsed">${elapsed}</span><span id="ipod-remaining">-${remaining}</span></div>
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
//  11. INCOMING CALL ("Artist is Calling...")
// ─────────────────────────────────────────────────────────────────────────────
function htmlIncomingCall({ coverDataUrl, artist, title, songDuration, currentSongSec, progress, background }) {
  const elapsed = formatTs(Math.floor(currentSongSec));

  let bgCss = `<div style="position:absolute;inset:-30px;background:url('${coverDataUrl}') center/cover;filter:blur(80px) brightness(0.28) saturate(1.8);transform:scale(1.2);"></div>`;
  if (background && background.type === 'solid') {
    bgCss = `<div style="position:absolute;inset:0;background-color:${background.hex};"></div>`;
  } else if (background && background.type === 'gradient') {
    bgCss = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${background.stops[0]} 0%,${background.stops[1]} 100%);"></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#050507;color:#fff;}
.overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.6) 50%,#000 100%);}
.wrap{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:100px 70px 100px;}
.top-meta{text-align:center;}
.call-badge{font-size:32px;color:rgba(255,255,255,0.7);margin-bottom:14px;letter-spacing:0.05em;}
.caller-name{font-size:72px;font-weight:800;letter-spacing:-0.03em;margin-bottom:12px;line-height:1.1;}
.call-type{font-size:36px;color:#30d158;font-weight:600;}
.poster-art{width:780px;height:780px;border-radius:50%;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.85);border:6px solid rgba(255,255,255,0.2);}
.poster-art img{width:100%;height:100%;object-fit:cover;}
.mid-actions{width:100%;display:flex;justify-content:space-around;padding:0 40px;}
.act-btn{display:flex;flex-direction:column;align-items:center;gap:12px;color:rgba(255,255,255,0.75);font-size:26px;}
.call-row{width:100%;display:flex;justify-content:space-around;align-items:center;}
.btn-circle{width:170px;height:170px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 15px 40px rgba(0,0,0,0.5);}
.btn-decline{background:#ff453a;}
.btn-accept{background:#30d158;box-shadow:0 0 50px rgba(48,209,88,0.5);}
.btn-label{margin-top:16px;font-size:28px;font-weight:600;text-align:center;}
</style></head><body>
${bgCss}<div class="overlay"></div>
<div class="wrap">
  <div class="top-meta">
    <div id="call-timer" class="call-badge">Incoming Audio Call...</div>
    <div class="caller-name">${escHtml(artist)}</div>
    <div class="call-type">${escHtml(title)} (Single)</div>
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
      <div id="btn-accept-glow" class="btn-circle btn-accept">
        <svg width="70" height="70" viewBox="0 0 24 24" fill="white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      </div>
      <div class="btn-label" style="color:#30d158;">Accept</div>
    </div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  12. 1995 VHS CAMCORDER TAPE
// ─────────────────────────────────────────────────────────────────────────────
function htmlVHS({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const ms = String(Math.floor((currentSongSec % 1) * 100)).padStart(2, '0');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'VT323',monospace;background:#050508;color:#e6e6e6;padding:80px 70px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
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
  <div class="rec-pulse"><span id="vhs-rec-dot">●</span> <span id="vhs-timecode">REC 00:${elapsed}:${ms}</span></div>
</div>
<div class="art-frame">
  <img src="${coverDataUrl}" />
  <div class="vhs-noise"></div>
</div>
<div class="track-sec">
  <div class="v-title">${escHtml(title)}</div>
  <div class="v-artist">${escHtml(artist)}</div>
</div>
<div class="v-bot">
  <div>OCT. 24 1995<br/>11:42:08 PM</div>
  <div style="text-align:right;">CH-1 STEREO<br/>TAPE HI-FI</div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  13. WINAMP / WINDOWS 98 RETRO
// ─────────────────────────────────────────────────────────────────────────────
function htmlWinamp({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const bars = [80,95,70,85,60,90,100,75,85,65,90,70,80,60,95,85];
  const eqHtml = bars.map(h => `<div style="flex:1;height:${h}%;background:linear-gradient(0deg,#00ff00 60%,#ffff00 85%,#ff0000 100%);transition:height 0.05s ease;"></div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Silkscreen&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Silkscreen',monospace;background:#008080;display:flex;justify-content:center;align-items:center;}
.win{width:980px;background:#c0c0c0;border:4px solid #fff;border-right-color:#000;border-bottom-color:#000;box-shadow:0 40px 100px rgba(0,0,0,0.6);padding:6px;}
.title-bar{background:linear-gradient(90deg,#000080,#1084d0);padding:8px 12px;color:#fff;font-size:24px;display:flex;justify-content:space-between;align-items:center;font-weight:700;}
.win-btns{display:flex;gap:4px;}
.win-btn{width:28px;height:26px;background:#c0c0c0;border:2px solid #fff;border-right-color:#000;border-bottom-color:#000;color:#000;font-size:18px;display:flex;align-items:center;justify-content:center;}
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
    <span>WINAMP - ${escHtml(artist)} - ${escHtml(title)}</span>
    <div class="win-btns">
      <div class="win-btn">_</div>
      <div class="win-btn">□</div>
      <div class="win-btn">×</div>
    </div>
  </div>
  <div class="winamp">
    <div class="lcd-box">
      <div id="winamp-lcd" class="lcd-time">${elapsed}</div>
      <div class="lcd-spec">320 KBPS<br/>44.1 KHZ<br/>STEREO</div>
    </div>
    <div class="art-box"><img src="${coverDataUrl}" /></div>
    <div id="winamp-eq" class="eq-box">${eqHtml}</div>
    <div class="meta">
      <div style="color:#00ff44;margin-bottom:6px;">▶ 1. ${escHtml(title)}</div>
      <div style="color:#aaa;">ARTIST: ${escHtml(artist)}</div>
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
//  14. VINYL RECORD STORE RECEIPT SLIP
// ─────────────────────────────────────────────────────────────────────────────
function htmlReceipt({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const ms = String(Math.floor((currentSongSec % 1) * 100)).padStart(2, '0');
  const barPct = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=VT323&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Mono',monospace;background:#18181c;display:flex;justify-content:center;align-items:center;}
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
.r-prog{width:100%;height:6px;background:rgba(0,0,0,0.15);border-radius:3px;margin:10px 0;}
.r-prog-fill{width:${barPct}%;height:100%;background:#111;border-radius:3px;}
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
    <div class="r-title">${escHtml(title)}</div>
    <div style="font-size:28px;color:#333;">${escHtml(artist)}</div>
    <div class="r-prog"><div id="receipt-fill" class="r-prog-fill"></div></div>
  </div>

  <div class="r-table">
    <div class="r-row"><span>TRACK LENGTH</span><span>${formatTs(songDuration)}</span></div>
    <div class="r-row"><span>PLAYHEAD TIMECODE</span><span id="receipt-time" style="font-weight:700;color:#e63946;">${elapsed}.${ms}</span></div>
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
//  15. 1980s VINTAGE BOOMBOX / GHETTO BLASTER
// ─────────────────────────────────────────────────────────────────────────────
function htmlBoombox({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Space+Grotesk:wght@700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:radial-gradient(circle at 50% 35%,#1c1c22 0%,#09090c 70%,#020203 100%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;}
.boombox{width:1000px;background:linear-gradient(180deg,#383842 0%,#1f1f26 40%,#121216 100%);border-radius:40px;border:6px solid #5a5a66;box-shadow:0 50px 140px rgba(0,0,0,0.95),inset 0 2px 10px rgba(255,255,255,0.25);padding:40px 36px;display:flex;flex-direction:column;align-items:center;}
.handle{width:620px;height:70px;border:18px solid #4a4a56;border-bottom:none;border-radius:30px 30px 0 0;margin-bottom:-6px;box-shadow:0 -6px 20px rgba(0,0,0,0.5);}
.top-strip{width:100%;display:flex;justify-content:space-between;align-items:center;background:#18181f;border:3px solid #333;border-radius:16px;padding:16px 28px;margin-bottom:30px;}
.knobs{display:flex;gap:20px;}
.knob{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,#888,#222);border:2px solid #aaa;box-shadow:0 4px 10px rgba(0,0,0,0.6);}
.led-disp{font-family:'VT323',monospace;font-size:38px;color:#ff3333;text-shadow:0 0 10px rgba(255,51,51,0.8);background:#000;padding:6px 20px;border-radius:8px;border:2px solid #444;}
.meters-row{width:100%;display:flex;justify-content:space-around;margin-bottom:30px;}
.vu-meter{width:420px;height:140px;background:#fffae0;border:4px solid #222;border-radius:12px;box-shadow:inset 0 0 20px rgba(0,0,0,0.3);position:relative;overflow:hidden;padding:12px;}
.vu-scale{display:flex;justify-content:space-between;font-size:18px;color:#222;font-weight:800;}
.vu-needle{position:absolute;bottom:-30px;left:50%;width:4px;height:160px;background:#cc1111;transform-origin:bottom center;transform:rotate(15deg);box-shadow:0 0 6px rgba(0,0,0,0.5);transition:transform 0.05s ease;}
.speaker-stage{width:100%;display:flex;justify-content:space-between;align-items:center;}
.speaker{width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,#111 25%,#2a2a35 60%,#0a0a0f 100%);border:12px solid #3a3a46;box-shadow:inset 0 0 30px rgba(0,0,0,0.9),0 10px 25px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;}
.speaker-core{width:80px;height:80px;border-radius:50%;background:#000;border:3px solid #555;}
.deck-door{width:400px;height:400px;background:#111;border:4px solid #4a4a58;border-radius:20px;box-shadow:inset 0 0 30px rgba(0,0,0,0.8);overflow:hidden;position:relative;}
.deck-door img{width:100%;height:100%;object-fit:cover;}
.info-box{margin-top:40px;text-align:center;}
.b-title{font-size:62px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;}
.b-artist{font-size:36px;color:#ffcc00;text-transform:uppercase;letter-spacing:0.1em;}
</style></head><body>
<div class="handle"></div>
<div class="boombox">
  <div class="top-strip">
    <div class="knobs"><div class="knob"></div><div class="knob"></div><div class="knob"></div></div>
    <div class="led-disp"><span id="boombox-tape-dot">●</span> FM 104.5 MHz • TAPE PLAY</div>
    <div id="boombox-time" class="led-disp" style="color:#00ff66;text-shadow:0 0 10px rgba(0,255,102,0.8);">${elapsed}</div>
  </div>
  <div class="meters-row">
    <div class="vu-meter">
      <div class="vu-scale"><span>-20</span><span>-10</span><span>-5</span><span>0</span><span style="color:#cc1111;">+3dB</span></div>
      <div id="boombox-needle-l" class="vu-needle"></div>
    </div>
    <div class="vu-meter">
      <div class="vu-scale"><span>-20</span><span>-10</span><span>-5</span><span>0</span><span style="color:#cc1111;">+3dB</span></div>
      <div id="boombox-needle-r" class="vu-needle" style="transform:rotate(12deg);"></div>
    </div>
  </div>
  <div class="speaker-stage">
    <div class="speaker"><div class="speaker-core"></div></div>
    <div class="deck-door"><img src="${coverDataUrl}" /></div>
    <div class="speaker"><div class="speaker-core"></div></div>
  </div>
  <div class="info-box">
    <div class="b-title">${escHtml(title)}</div>
    <div class="b-artist">${escHtml(artist)}</div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  16. GAMEBOY COLOR / 8-BIT PIXEL PLAYER
// ─────────────────────────────────────────────────────────────────────────────
function htmlGameBoy({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Press Start 2P',monospace;background:#0d0d12;display:flex;justify-content:center;align-items:center;}
.gb-body{width:960px;height:1780px;background:linear-gradient(180deg,#6b3ba7 0%,#4a237a 60%,#341559 100%);border-radius:60px 60px 140px 60px;box-shadow:0 50px 140px rgba(0,0,0,0.9),inset 0 0 40px rgba(255,255,255,0.25);border:6px solid #824ec9;padding:60px 50px;display:flex;flex-direction:column;align-items:center;position:relative;}
.screen-bezel{width:100%;height:840px;background:#2b2933;border-radius:30px 30px 80px 30px;box-shadow:inset 0 4px 15px rgba(0,0,0,0.8);padding:30px 40px;display:flex;flex-direction:column;align-items:center;}
.bezel-top{width:100%;display:flex;justify-content:space-between;align-items:center;font-size:18px;color:#8a8894;margin-bottom:20px;}
.batt-led{width:14px;height:14px;border-radius:50%;background:#ff2a2a;box-shadow:0 0 10px #ff2a2a;display:inline-block;margin-right:8px;}
.lcd-screen{width:760px;height:660px;background:#8fa876;border:6px solid #1a280c;box-shadow:inset 0 0 20px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:24px 20px;color:#1a280c;}
.lcd-title{font-size:22px;line-height:1.4;text-align:center;}
.lcd-art{width:380px;height:380px;border:4px solid #1a280c;overflow:hidden;}
.lcd-art img{width:100%;height:100%;object-fit:cover;filter:contrast(1.2) brightness(0.9);}
.lcd-bar{width:100%;height:14px;background:#768d5f;border:2px solid #1a280c;border-radius:2px;}
.lcd-fill{width:${barPct}%;height:100%;background:#1a280c;}
.controls-stage{width:100%;flex:1;display:flex;justify-content:space-between;align-items:center;padding:0 40px;margin-top:40px;}
.d-pad{width:220px;height:220px;position:relative;}
.d-btn{background:#111;position:absolute;box-shadow:0 6px 15px rgba(0,0,0,0.6);}
.d-horiz{width:220px;height:72px;top:74px;border-radius:8px;}
.d-vert{width:72px;height:220px;left:74px;border-radius:8px;}
.ab-btns{display:flex;gap:36px;transform:rotate(-25deg);margin-top:-30px;}
.round-action{width:110px;height:110px;border-radius:50%;background:#a81552;box-shadow:0 8px 20px rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;}
</style></head><body>
<div class="gb-body">
  <div class="screen-bezel">
    <div class="bezel-top">
      <div><span id="gb-batt" class="batt-led"></span>BATTERY</div>
      <div style="font-family:'Space Grotesk';font-weight:700;letter-spacing:0.1em;color:#f5a623;">COLOR</div>
    </div>
    <div class="lcd-screen">
      <div class="lcd-title">▶ NOW PLAYING</div>
      <div class="lcd-art"><img src="${coverDataUrl}" /></div>
      <div style="font-size:18px;text-align:center;">${escHtml(title)}<br/><span style="font-size:14px;opacity:0.8;">${escHtml(artist)}</span></div>
      <div class="lcd-bar"><div id="gb-fill" class="lcd-fill"></div></div>
      <div style="width:100%;display:flex;justify-content:space-between;font-size:14px;">
        <span id="gb-elapsed">${elapsed}</span><span id="gb-remaining">-${remaining}</span>
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
//  17. STUDIO DAW / FL STUDIO & ABLETON MIXER
// ─────────────────────────────────────────────────────────────────────────────
function htmlDAW({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const bars = [90,80,65,85,95,70,80,90,75,60,85,95,100,70,80,90];
  const meterHtml = bars.map(h => `<div style="flex:1;height:${h}%;background:linear-gradient(0deg,#22c55e 60%,#eab308 85%,#ef4444 100%);border-radius:2px;transition:height 0.05s ease;"></div>`).join('');

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
.meter-strip{width:100%;background:#1e232d;border:2px solid #2d3545;border-radius:18px;padding:24px 30px;}
.meter-top{display:flex;justify-content:space-between;font-size:22px;color:#94a3b8;margin-bottom:14px;font-weight:700;}
.meter-bars{width:100%;height:90px;display:flex;gap:6px;align-items:flex-end;background:#0f1319;border-radius:10px;padding:8px 12px;}
.spec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px;}
.spec-card{background:#1e232d;border:2px solid #2d3545;border-radius:12px;padding:16px;text-align:center;}
</style></head><body>
<div class="daw-header">
  <div class="daw-bpm">● 128.00 BPM · 4/4</div>
  <div id="daw-db" style="font-size:24px;color:#22c55e;">MASTER: 0.0 dB</div>
</div>
<div class="daw-art"><img src="${coverDataUrl}" /></div>
<div class="daw-meta">
  <div class="d-title">${escHtml(title)}</div>
  <div class="d-artist">${escHtml(artist)}</div>
</div>
<div class="meter-strip">
  <div class="meter-top"><span>MASTER AUDIO SPECTRUM</span><span id="daw-time">${elapsed} / ${formatTs(songDuration)}</span></div>
  <div id="daw-eq" class="meter-bars">${meterHtml}</div>
</div>
<div class="spec-grid">
  <div class="spec-card"><div style="font-size:16px;color:#64748b;">FORMAT</div><div style="font-size:22px;font-weight:700;">32-BIT WAV</div></div>
  <div class="spec-card"><div style="font-size:16px;color:#64748b;">RATE</div><div style="font-size:22px;font-weight:700;">96.0 kHz</div></div>
  <div class="spec-card"><div style="font-size:16px;color:#64748b;">LATENCY</div><div style="font-size:22px;font-weight:700;">1.4 ms</div></div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  18. SUPERCAR TACHOMETER / NIGHT DRIFT DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function htmlTachometer({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed   = formatTs(Math.floor(currentSongSec));
  const remaining = formatTs(Math.max(0, Math.floor(songDuration - currentSongSec)));
  const barPct    = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Space+Grotesk:wght@500;700;800&family=JetBrains+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:#06070a;color:#fff;padding:60px 48px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.bg-grid{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(255,42,75,0.12) 0%,transparent 60%),radial-gradient(circle at 50% 80%,rgba(0,180,255,0.08) 0%,transparent 50%),repeating-linear-gradient(45deg,#07080c 0px,#07080c 4px,#0c0e14 4px,#0c0e14 8px);pointer-events:none;}
.top-hud{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;background:rgba(18,22,30,0.85);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:18px 28px;font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:0.06em;}
.mode-badge{background:#ff2a4b;color:#fff;padding:4px 14px;border-radius:8px;font-weight:800;font-size:18px;box-shadow:0 0 16px rgba(255,42,75,0.6);}
.tacho-wrap{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;margin-top:10px;}
.shift-lights{display:flex;gap:12px;margin-bottom:20px;}
.s-led{width:36px;height:12px;border-radius:4px;background:#222;}
.s-green{background:#00ff66;box-shadow:0 0 14px #00ff66;}
.s-amber{background:#ffbb00;box-shadow:0 0 14px #ffbb00;}
.s-red{background:#ff2a4b;box-shadow:0 0 18px #ff2a4b;}
.dial{width:680px;height:680px;border-radius:50%;background:radial-gradient(circle at center,#0c0f16 0%,#131824 60%,#090b10 100%);border:8px solid #202738;box-shadow:0 0 80px rgba(0,0,0,0.9),inset 0 0 40px rgba(0,0,0,0.8),0 0 30px rgba(255,42,75,0.25);position:relative;display:flex;align-items:center;justify-content:center;}
.dial-rim{position:absolute;inset:20px;border-radius:50%;border:2px dashed rgba(255,255,255,0.18);}
.dial-scale{position:absolute;inset:36px;font-family:'Orbitron',sans-serif;font-weight:800;font-size:28px;}
.d-0{position:absolute;bottom:40px;left:70px;color:rgba(255,255,255,0.7);}
.d-2{position:absolute;top:160px;left:35px;color:rgba(255,255,255,0.7);}
.d-4{position:absolute;top:35px;left:180px;color:rgba(255,255,255,0.9);}
.d-6{position:absolute;top:35px;right:180px;color:rgba(255,255,255,0.9);}
.d-7{position:absolute;top:160px;right:35px;color:#ffbb00;}
.d-8{position:absolute;bottom:130px;right:45px;color:#ff2a4b;text-shadow:0 0 10px #ff2a4b;}
.d-9{position:absolute;bottom:40px;right:80px;color:#ff2a4b;text-shadow:0 0 10px #ff2a4b;}
.needle{position:absolute;bottom:50%;left:50%;width:8px;height:270px;background:linear-gradient(180deg,#ff2a4b,#ff7b00);border-radius:4px;transform-origin:bottom center;transform:rotate(54deg);box-shadow:0 0 25px rgba(255,42,75,0.9);z-index:5;transition:transform 0.05s ease;}
.dial-center{position:relative;z-index:6;width:260px;height:260px;border-radius:50%;background:#090b10;border:6px solid #283144;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,0.8);}
.gear{font-family:'Orbitron',sans-serif;font-size:68px;font-weight:900;color:#ff2a4b;line-height:1;text-shadow:0 0 20px rgba(255,42,75,0.7);}
.rpm-val{font-family:'Orbitron',sans-serif;font-size:30px;font-weight:700;color:#fff;margin-top:6px;}
.rpm-lbl{font-size:16px;color:#667085;letter-spacing:0.15em;font-weight:700;}
.info-card{position:relative;z-index:2;background:rgba(18,22,32,0.85);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.12);border-radius:32px;padding:32px 36px;box-shadow:0 30px 90px rgba(0,0,0,0.85);}
.info-row{display:flex;gap:30px;align-items:center;}
.info-art{width:220px;height:220px;border-radius:20px;overflow:hidden;border:2px solid rgba(255,255,255,0.2);box-shadow:0 15px 40px rgba(0,0,0,0.7);flex-shrink:0;}
.info-art img{width:100%;height:100%;object-fit:cover;display:block;}
.meta-box{flex:1;min-width:0;}
.song-title{font-size:46px;font-weight:800;letter-spacing:-0.02em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.song-artist{font-size:30px;color:rgba(255,255,255,0.65);margin-top:8px;}
.speed-pill{display:inline-flex;align-items:center;gap:10px;background:rgba(255,42,75,0.15);border:1px solid rgba(255,42,75,0.4);padding:6px 18px;border-radius:12px;margin-top:16px;font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;color:#ff2a4b;}
.prog-sec{margin-top:24px;}
.p-track{width:100%;height:10px;background:rgba(255,255,255,0.12);border-radius:5px;}
.p-fill{width:${barPct}%;height:100%;background:linear-gradient(90deg,#ff7b00,#ff2a4b);border-radius:5px;box-shadow:0 0 16px rgba(255,42,75,0.8);}
.p-times{display:flex;justify-content:space-between;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:22px;color:rgba(255,255,255,0.55);}
</style></head><body>
<div class="bg-grid"></div>
<div class="top-hud">
  <div style="display:flex;align-items:center;gap:14px;"><span class="mode-badge">SPORT+</span><span>TRACTION: TRACK</span></div>
  <div>OIL: 215°F · BOOST: 1.45 BAR</div>
</div>
<div class="tacho-wrap">
  <div class="shift-lights">
    <div class="s-led s-green"></div><div class="s-led s-green"></div><div class="s-led s-green"></div>
    <div class="s-led s-amber"></div><div class="s-led s-amber"></div>
    <div class="s-led s-red"></div><div class="s-led s-red"></div>
  </div>
  <div class="dial">
    <div class="dial-rim"></div>
    <div class="dial-scale">
      <div class="d-0">0</div><div class="d-2">2</div><div class="d-4">4</div><div class="d-6">6</div>
      <div class="d-7">7</div><div class="d-8">8</div><div class="d-9">9</div>
    </div>
    <div id="tacho-needle" class="needle"></div>
    <div class="dial-center">
      <div class="gear">M6</div>
      <div id="tacho-rpm" class="rpm-val">7,420</div>
      <div class="rpm-lbl">RPM x1000</div>
    </div>
  </div>
</div>
<div class="info-card">
  <div class="info-row">
    <div class="info-art"><img src="${coverDataUrl}" /></div>
    <div class="meta-box">
      <div class="song-title">${escHtml(title)}</div>
      <div class="song-artist">${escHtml(artist)}</div>
      <div id="tacho-speed" class="speed-pill">⚡ 185 MPH · V-MAX ACTIVE</div>
    </div>
  </div>
  <div class="prog-sec">
    <div class="p-track"><div id="tacho-fill" class="p-fill"></div></div>
    <div class="p-times"><span id="tacho-elapsed">${elapsed}</span><span id="tacho-remaining">-${remaining}</span></div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  19. 3D CYBER TIMES SQUARE / SHIBUYA BILLBOARD
// ─────────────────────────────────────────────────────────────────────────────
function htmlBillboard({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&family=Inter:wght@600;700;800;900&family=Space+Mono:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Inter',sans-serif;background:#030408;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:70px 48px 60px;position:relative;}
.bg-city{position:absolute;inset:0;background:radial-gradient(circle at 50% 20%,rgba(60,120,255,0.18) 0%,transparent 65%),radial-gradient(circle at 80% 80%,rgba(255,50,150,0.15) 0%,transparent 60%),linear-gradient(180deg,#020306 0%,#080d18 50%,#03050a 100%);pointer-events:none;}
.city-lights{position:absolute;bottom:0;width:100%;height:300px;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 20px,transparent 20px,transparent 40px);pointer-events:none;}
.scaffold-top{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,0.15);padding-bottom:18px;}
.billboard-id{font-family:'Space Mono',monospace;font-size:22px;color:rgba(255,255,255,0.6);letter-spacing:0.15em;}
.beacon{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:700;color:#ff3b30;}
.beacon-dot{width:14px;height:14px;border-radius:50%;background:#ff3b30;box-shadow:0 0 14px #ff3b30;}
.billboard-frame{position:relative;z-index:2;width:100%;height:1360px;border-radius:36px;border:8px solid #1a202c;background:#080b12;box-shadow:0 50px 160px rgba(0,0,0,0.95),0 0 80px rgba(79,172,254,0.25);overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.led-bg{position:absolute;inset:0;background:url('${coverDataUrl}') center/cover;filter:brightness(0.85) contrast(1.15);transform:scale(1.05);}
.led-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.3) 0px,rgba(0,0,0,0.3) 2px,transparent 2px,transparent 4px);pointer-events:none;}
.led-gradient{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.7) 75%,rgba(0,0,0,0.96) 100%);pointer-events:none;}
.light-sweep{position:absolute;inset:0;background:linear-gradient(135deg,transparent 0%,rgba(255,255,255,0.18) 35%,transparent 60%);pointer-events:none;}
.b-top-tag{position:relative;z-index:3;padding:40px 45px 0;}
.tag-badge{display:inline-block;background:#ffdd00;color:#000;font-weight:900;font-size:24px;padding:8px 24px;border-radius:8px;letter-spacing:0.1em;text-transform:uppercase;box-shadow:0 0 25px rgba(255,221,0,0.5);}
.b-center-content{position:relative;z-index:3;padding:0 45px 30px;}
.b-super-title{font-family:'Syne',sans-serif;font-size:82px;font-weight:900;letter-spacing:-0.03em;line-height:0.95;text-transform:uppercase;color:#fff;text-shadow:0 10px 40px rgba(0,0,0,0.9);}
.b-super-artist{font-size:42px;font-weight:800;color:#ffdd00;margin-top:14px;letter-spacing:0.02em;text-shadow:0 4px 20px rgba(0,0,0,0.9);}
.b-platforms{display:flex;gap:18px;margin-top:24px;}
.platform-pill{background:rgba(255,255,255,0.18);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.25);padding:10px 22px;border-radius:30px;font-size:20px;font-weight:700;}
.ticker-strip{position:relative;z-index:3;background:#0d1117;border-top:3px solid #ffdd00;padding:20px 0;overflow:hidden;white-space:nowrap;}
.ticker-text{font-family:'Space Mono',monospace;font-size:26px;font-weight:700;color:#ffdd00;letter-spacing:0.12em;display:inline-block;will-change:transform;}
.bot-info{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:0 10px;font-size:22px;color:rgba(255,255,255,0.5);font-family:'Space Mono',monospace;}
</style></head><body>
<div class="bg-city"></div><div class="city-lights"></div>
<div class="scaffold-top">
  <div class="billboard-id">NYC TIMES SQUARE // SCREEN 04-A</div>
  <div class="beacon"><span id="bb-beacon-dot" class="beacon-dot"></span>LIVE BROADCAST</div>
</div>
<div class="billboard-frame">
  <div class="led-bg"></div>
  <div class="led-scanlines"></div>
  <div class="led-gradient"></div>
  <div id="bb-light-sweep" class="light-sweep"></div>
  <div class="b-top-tag"><div class="tag-badge">★ WORLDWIDE PREMIERE ★</div></div>
  <div class="b-center-content">
    <div class="b-super-title">${escHtml(title)}</div>
    <div class="b-super-artist">${escHtml(artist)}</div>
    <div class="b-platforms">
      <div class="platform-pill">SPOTIFY</div>
      <div class="platform-pill">APPLE MUSIC</div>
      <div class="platform-pill">YOUTUBE MUSIC</div>
    </div>
  </div>
  <div class="ticker-strip">
    <div id="bb-ticker" class="ticker-text">
      ● STREAMING WORLDWIDE ON ALL MAJOR PLATFORMS • OVER 1.4M STREAMS • #1 NEW MUSIC TRENDING • ${escHtml(artist)} - ${escHtml(title)} • OUT NOW EVERYWHERE • STREAMING WORLDWIDE ON ALL PLATFORMS •
    </div>
  </div>
</div>
<div class="bot-info">
  <div>ANAMORPHIC 3D LED // 4K 120HZ</div>
  <div>GLOBAL MUSIC CAMPAIGN 2026</div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  20. JAPANESE ARCADE RHYTHM GAME CABINET
// ─────────────────────────────────────────────────────────────────────────────
function htmlArcade({ coverDataUrl, artist, title, songDuration, currentSongSec, progress }) {
  const elapsed = formatTs(Math.floor(currentSongSec));
  const barPct = (Math.min(1, progress) * 100).toFixed(3);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@700;800;900&family=JetBrains+Mono:wght@800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;font-family:'Space Grotesk',sans-serif;background:#06040a;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:50px 44px;position:relative;}
.arcade-body{position:relative;z-index:2;width:100%;height:100%;background:#100d18;border-radius:40px;border:8px solid #281e3d;box-shadow:0 0 100px rgba(180,0,255,0.35),inset 0 0 30px rgba(0,0,0,0.9);padding:30px;display:flex;flex-direction:column;justify-content:space-between;}
.marquee-header{background:linear-gradient(90deg,#ff0077,#7700ff,#00f0ff);border-radius:18px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 0 30px rgba(255,0,119,0.5);border:3px solid #fff;}
.m-title{font-family:'Press Start 2P',monospace;font-size:22px;color:#fff;text-shadow:2px 2px 0px #000;}
.m-badge{background:#000;color:#00f0ff;padding:6px 14px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:20px;}
.screen-stage{width:100%;height:1240px;background:#05030a;border:6px solid #3d2b60;border-radius:24px;box-shadow:inset 0 0 50px rgba(0,0,0,0.9);overflow:hidden;padding:26px;display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.track-card{display:flex;gap:26px;align-items:center;background:rgba(30,20,50,0.65);border:2px solid rgba(255,255,255,0.15);border-radius:20px;padding:18px;}
.art-thumb{width:180px;height:180px;border-radius:14px;overflow:hidden;border:3px solid #00f0ff;box-shadow:0 0 25px rgba(0,240,255,0.4);flex-shrink:0;}
.art-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.track-meta{flex:1;min-width:0;}
.t-title{font-size:42px;font-weight:900;line-height:1.15;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.t-artist{font-size:28px;color:#00f0ff;font-weight:700;margin-top:6px;}
.bpm-pill{display:inline-block;background:#ff0077;color:#fff;font-family:'JetBrains Mono';font-size:18px;font-weight:800;padding:4px 12px;border-radius:6px;}
.score-hud{display:flex;justify-content:space-between;align-items:center;margin:15px 0;}
.combo-box{text-align:center;}
.perfect-tag{font-family:'Press Start 2P',monospace;font-size:32px;color:#ffdd00;text-shadow:0 0 20px #ffdd00;}
.combo-num{font-family:'Press Start 2P',monospace;font-size:44px;color:#fff;margin-top:8px;text-shadow:0 0 25px rgba(255,255,255,0.8);}
.score-box{text-align:right;}
.score-num{font-family:'Press Start 2P',monospace;font-size:28px;color:#00f0ff;text-shadow:0 0 15px #00f0ff;}
.highway-wrap{flex:1;position:relative;perspective:400px;display:flex;justify-content:center;align-items:flex-end;overflow:hidden;border-bottom:4px solid #ff0077;margin-bottom:10px;}
.highway{width:860px;height:100%;transform:rotateX(30deg);transform-origin:bottom center;display:flex;border-left:4px solid #00f0ff;border-right:4px solid #00f0ff;background:linear-gradient(180deg,rgba(20,5,40,0.2) 0%,rgba(40,10,80,0.8) 100%);position:relative;}
.lane{flex:1;border-right:2px dashed rgba(255,255,255,0.18);position:relative;}
.lane:last-child{border-right:none;}
.arcade-note{position:absolute;width:85%;height:32px;border-radius:6px;left:7.5%;transition:top 0.05s linear;}
.note-cyan{background:#00f0ff;box-shadow:0 0 20px #00f0ff;}
.note-pink{background:#ff0077;box-shadow:0 0 20px #ff0077;}
.note-yellow{background:#ffdd00;box-shadow:0 0 20px #ffdd00;}
.strike-line{position:absolute;bottom:10px;width:100%;height:10px;background:#fff;box-shadow:0 0 30px #fff,0 0 60px #ff0077;}
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
        <div class="t-title">${escHtml(title)}</div>
        <div class="t-artist">${escHtml(artist)}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
          <div class="bpm-pill">BPM 128.00</div>
          <div id="arcade-time" style="font-family:'JetBrains Mono';font-size:18px;color:#00f0ff;font-weight:700;">${elapsed} / ${formatTs(songDuration)}</div>
        </div>
        <div style="width:100%;height:6px;background:rgba(255,255,255,0.15);border-radius:3px;margin-top:10px;">
          <div id="arcade-fill" style="width:${barPct}%;height:100%;background:#00f0ff;border-radius:3px;box-shadow:0 0 10px #00f0ff;"></div>
        </div>
      </div>
    </div>
    <div class="score-hud">
      <div class="combo-box">
        <div class="perfect-tag">PERFECT!!</div>
        <div id="arcade-combo-num" class="combo-num">154 COMBO</div>
      </div>
      <div class="score-box">
        <div style="font-size:18px;color:#aaa;margin-bottom:6px;">SCORE</div>
        <div class="score-num">098,420</div>
      </div>
    </div>
    <div class="highway-wrap">
      <div class="highway">
        <div class="lane">
          <div class="arcade-note note-cyan" style="top:20%;"></div>
          <div class="arcade-note note-cyan" style="top:75%;"></div>
        </div>
        <div class="lane">
          <div class="arcade-note note-pink" style="top:45%;"></div>
        </div>
        <div class="lane">
          <div class="arcade-note note-yellow" style="top:10%;"></div>
          <div class="arcade-note note-yellow" style="top:60%;"></div>
        </div>
        <div class="lane">
          <div class="arcade-note note-cyan" style="top:35%;"></div>
          <div class="arcade-note note-pink" style="top:85%;"></div>
        </div>
      </div>
      <div id="arcade-strike-line" class="strike-line"></div>
    </div>
  </div>
  <div class="controls-panel">
    <div class="arcade-btn btn-pink"></div>
    <div class="arcade-btn btn-blue"></div>
    <div class="arcade-btn btn-yellow"></div>
    <div class="arcade-btn btn-blue"></div>
    <div class="arcade-btn btn-pink"></div>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
main().catch(err => { console.error('\n[FATAL]', err); process.exit(1); });
