#!/usr/bin/env bash

set -x -eu -o pipefail
# Uncomment to step through this script:
# trap '(read -p "[$BASH_SOURCE:$LINENO] $BASH_COMMAND")' DEBUG

SCRIPT_DIR=$(realpath "$(dirname "$0")")

CRWA_ESM_TESTING_DIR="${TMPDIR}crwa_esm_testing_$(date '+%Y%m%d_%H%M%S')"
mkdir "$CRWA_ESM_TESTING_DIR"

yarn --cwd "$CRWA_ESM_TESTING_DIR" init -2

rm -rf ./dist
yarn build

TARBALL=create-redwood-app.tgz
yarn pack -o $TARBALL
mv ./$TARBALL "$CRWA_ESM_TESTING_DIR"

cd "$CRWA_ESM_TESTING_DIR"
yarn add ./$TARBALL

CRWA_ESM_TESTING_DIR="${CRWA_ESM_TESTING_DIR}_redwood_app"

yarn create-redwood-app --help
yarn create-redwood-app "$CRWA_ESM_TESTING_DIR" -y

# `yarn pack` seems to ignore `.yarnrc.yml`
# cp "$SCRIPT_DIR/templates/ts/.yarnrc.yml" "$CRWA_ESM_TESTING_DIR"
