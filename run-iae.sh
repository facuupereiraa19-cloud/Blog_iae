#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root (this script lives at repo root)
SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

exec bash "${SCRIPT_DIR}/scripts/linux/install-and-run.sh"

