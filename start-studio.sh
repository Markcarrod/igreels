#!/usr/bin/env bash
# Launch Visualizer Studio on Linux
cd "$(dirname "$0")" || exit 1
echo "🚀 Starting Viral Music Visualizer Studio..."
echo "➜ Open in browser: http://localhost:4000"
node server.js
