#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$ROOT"

node --test
node src/cli.js check
node src/cli.js request 11111111111111111111111111111111 0.1 "ZeroClaw skill smoke test"

echo "SolGuard skill validation passed"
