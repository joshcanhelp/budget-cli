#!/usr/bin/env bash
set -eo pipefail
npm run build
npm run eslint-ci
npm run prettier-ci
