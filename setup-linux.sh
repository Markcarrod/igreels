#!/usr/bin/env bash
# ==============================================================================
#  IGVIDGEN - Linux Setup & Optimization Script for Ubuntu 24.04 / 26.04 LTS
#  Optimized for AMD EPYC 9454P (48-Core / 96-Thread), 128GB RAM
#  Target Directory: /home/kayan/Desktop/IGVIDGEN
# ==============================================================================

set -e

DEST_DIR="/home/kayan/Desktop/IGVIDGEN"
echo ""
echo "=================================================================="
echo "  🚀 Setting up IGVIDGEN Music Visualizer Studio on Linux"
echo "  Target: $DEST_DIR"
echo "=================================================================="
echo ""

# 1. Create target directory structure
mkdir -p "$DEST_DIR"
mkdir -p "$DEST_DIR/Output"
mkdir -p "$DEST_DIR/TemplatesPreview"

# If current directory is not DEST_DIR, copy files across
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$SCRIPT_DIR" != "$DEST_DIR" ]; then
  echo "📦 Copying files from $SCRIPT_DIR to $DEST_DIR..."
  cp -r "$SCRIPT_DIR"/* "$DEST_DIR/" || true
  cd "$DEST_DIR"
else
  cd "$DEST_DIR"
fi

# 2. Update package lists and install system dependencies
echo "📦 Installing system packages: FFmpeg, fonts, and headless Chromium libraries..."
sudo apt-get update -y
sudo apt-get install -y \
  ffmpeg \
  fonts-liberation \
  fonts-noto-color-emoji \
  fonts-dejavu-core \
  ca-certificates \
  curl \
  wget \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2t64 2>/dev/null || sudo apt-get install -y libasound2

# 3. Check / Install Node.js (v20+ recommended)
if ! command -v node &> /dev/null; then
  echo "⚡ Node.js not detected. Installing Node.js LTS (v20)..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  NODE_VER=$(node -v)
  echo "✓ Node.js detected: $NODE_VER"
fi

# 4. Install npm packages
echo "📦 Installing npm dependencies (puppeteer, sharp, express/server)..."
npm install

# 5. Make shell helper scripts executable
chmod +x *.sh 2>/dev/null || true

echo ""
echo "=================================================================="
echo "  🎉 SETUP COMPLETE!"
echo "=================================================================="
echo "  Hardware: 48 Physical Zen 4 Cores (96 Threads) & 128 GB RAM"
echo "  Optimal Concurrency: 20 to 24 parallel workers"
echo ""
echo "  To launch the Web Studio UI:"
echo "    cd /home/kayan/Desktop/IGVIDGEN"
echo "    ./start-studio.sh"
echo "    (or: node server.js)"
echo ""
echo "  To run 70 videos directly via CLI (Sequential Round-Robin):"
echo "    ./run-batch-70.sh"
echo "=================================================================="
echo ""
