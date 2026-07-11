#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Open START_HERE_中文.md and follow Step 1."
  read -r _
  exit 1
fi
node scripts/preview-dist.mjs
