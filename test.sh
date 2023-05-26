#!/bin/bash
REDWOOD_FRAMEWORK_PATH=$(pwd)

echo 'cp -r __fixtures__/test-project/ ../test-project'
rsync -r __fixtures__/test-project/ ../test-project

echo 'yarn run project:deps ../test-project'
yarn run project:deps ../test-project

cd ../test-project || exit 1
yarn install
cd "$REDWOOD_FRAMEWORK_PATH" || exit 1

yarn run project:copy ../test-project

cd ../test-project || exit 1
yarn rw g secret --raw >> .env
yarn rw prisma migrate reset --force
cd ../redwood || exit 1
