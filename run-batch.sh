#!/usr/bin/env bash
# ==============================================================================
#  Generate 80 Videos Per Artist across all 20 Templates (20 Parallel Workers)
# ==============================================================================
cd "$(dirname "$0")" || exit 1

echo "=================================================================="
echo "  🎬 GENERATING 80 VIDEOS PER ARTIST"
echo "  Hardware Threads: 20 Parallel Workers (AMD EPYC 9454P)"
echo "  Output Directory: /home/kayan/Desktop/IGREELOUT/<artist>/"
echo "=================================================================="

mkdir -p /home/kayan/Desktop/IGREELOUT

node generate.js \
  --per-artist 80 \
  --concurrency 20 \
  --duration 15 \
  --outdir /home/kayan/Desktop/IGREELOUT
