#!/usr/bin/env bash

set -x -eu -o pipefail
# Uncomment to step through this script:
# trap '(read -p "[$BASH_SOURCE:$LINENO] $BASH_COMMAND")' DEBUG

# SCRIPT_DIR=$(realpath "$(dirname "$0")")

PREFIX=cli
ESM_TESTING_DIR="${TMPDIR}${PREFIX}_esm_testing_$(date '+%Y%m%d_%H%M%S')"
mkdir "$ESM_TESTING_DIR"

yarn --cwd "$ESM_TESTING_DIR" init -2

yarn build

TARBALL=cli.tgz
yarn pack -o $TARBALL
mv ./$TARBALL "$ESM_TESTING_DIR"

(
  PACKAGE=internal
  cd $RWFW_PATH/packages/$PACKAGE
  yarn pack -o $PACKAGE.tgz
  mv ./$PACKAGE.tgz "$ESM_TESTING_DIR"
)

(
  PACKAGE=babel-config
  cd $RWFW_PATH/packages/$PACKAGE
  yarn pack -o $PACKAGE.tgz
  mv ./$PACKAGE.tgz "$ESM_TESTING_DIR"
)

cd "$ESM_TESTING_DIR"
yarn add ./$TARBALL

jq '. + {
  "resolutions": {
    "@redwoodjs/internal": "./internal.tgz",
    "@redwoodjs/babel-config": "./babel-config.tgz"
  }
}' < 'package.json' > 'package.json.temp'

mv 'package.json.temp' 'package.json'

echo "enableGlobalCache: false" > .yarnrc.yml
# echo "nodeLinker: node-modules" >> .yarnrc.yml

yarn

# TODO: real rw app here eventually.
touch 'redwood.toml'
echo 'REDWOOD_DISABLE_TELEMETRY=1' > .env

yarn rw --help

yarn rw info
yarn rw lint

yarn rw test --help
yarn rw test api --no-watch
yarn rw test web --no-watch

# yarn rw check

# Should undo the sb stuff we did...
# yarn rw storybook --smoke-test

# Running into commandDir looks like.
# yarn rw g --help
# yarn rw g script --help
# yarn rw g script testScript
# yarn rw exec testScript

# Hardcodes the path.
# yarn rw prisma --help
# yarn rw prisma generate
# yarn rw prisma migrate dev --name ci-test

# Command dir probably.
# yarn rw setup --help
# yarn rw setup deploy --help

# yarn rw deploy --help

# yarn rw type-check

# yarn rw dataMigrate up
# yarn rw dataMigrate up
# yarn rw data-migrate install
