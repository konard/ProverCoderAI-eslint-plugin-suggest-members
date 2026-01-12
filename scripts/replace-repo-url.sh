#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OLD="$(printf '%s' 'https://github.com/ProverCoderAI/' 'effect-template')"
NEW="https://github.com/ProverCoderAI/eslint-plugin-suggest-members"

python3 - "$ROOT" "$OLD" "$NEW" <<'PY'
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
old = sys.argv[2]
new = sys.argv[3]

skip_dirs = {
    ".git",
    "node_modules",
    "dist",
    "build",
    "lib",
    "coverage",
    ".cache",
    ".pnpm",
    ".knowledge",
}

for path in root.rglob("*"):
    if not path.is_file():
        continue
    if any(part in skip_dirs for part in path.parts):
        continue
    try:
        data = path.read_text(encoding="utf-8")
    except Exception:
        continue
    if old in data:
        path.write_text(data.replace(old, new), encoding="utf-8")
PY
