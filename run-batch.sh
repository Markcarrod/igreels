#!/usr/bin/env bash
# ==============================================================================
#  Generate 80 Videos Per Artist across all 20 Templates (20 Parallel Workers)
#  Duration: Randomized 7 - 11 seconds per video
# ==============================================================================
cd "$(dirname "$0")" || exit 1

echo "=================================================================="
echo "  🎬 GENERATING 80 VIDEOS PER ARTIST"
echo "  Duration: Randomized 7s - 11s per video"
echo "  Hardware Threads: 20 Parallel Workers (AMD EPYC 9454P)"
echo "  Output Directory: /home/kayan/Desktop/IGREELOUT/<artist>/"
echo "=================================================================="

mkdir -p /home/kayan/Desktop/IGREELOUT

node generate.js \
  --per-artist 80 \
  --concurrency 20 \
  --duration 7-11 \
  --outdir /home/kayan/Desktop/IGREELOUT
