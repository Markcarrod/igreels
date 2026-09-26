#!/usr/bin/env bash
# ==============================================================================
#  Run 70 Videos Sequential Round-Robin across all 20 Templates with 20 Workers
# ==============================================================================
cd "$(dirname "$0")" || exit 1

echo "=================================================================="
echo "  🎬 GENERATING 70 VIDEOS (SEQUENTIAL ROUND-ROBIN)"
echo "  Hardware Threads: 20 Parallel Workers (EPYC 9454P)"
echo "  Output Directory: /home/kayan/Desktop/IGVIDGEN/Output"
echo "=================================================================="

node generate.js \
  --count 70 \
  --concurrency 20 \
  --duration 15 \
  --outdir ./Output
