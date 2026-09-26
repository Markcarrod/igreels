#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  preview-all.sh
#  Generates 1 high-resolution (1080x1920) PNG image per template
#  Outputs to: ./TemplatesPreview/
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

echo "🎨 Generating 1 image per template..."
node generate.js --preview-all "$@"

echo "✨ Done! Check images in ./TemplatesPreview/"
