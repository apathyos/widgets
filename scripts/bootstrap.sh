#!/usr/bin/env bash
set -euo pipefail

git submodule update --init --recursive

mkdir -p vendor/dist

pushd vendor/gnim >/dev/null
pnpm install --frozen-lockfile
pnpm run build
pnpm pack --pack-destination ../dist
popd >/dev/null

pushd vendor/ags >/dev/null
npm pack --pack-destination ../dist
popd >/dev/null

npm install
