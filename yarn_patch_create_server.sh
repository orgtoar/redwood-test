#!/bin/bash

# For debugging:
# set -x

if [ -z "$RWFW_PATH" ]; then
  echo "RWFW_PATH is not defined"
  exit 1
fi

if [ -z "$REDWOOD_PROJECT_PATH" ]; then
  echo "REDWOOD_PROJECT_PATH is not defined"
  exit 1
fi

cd "$RWFW_PATH/packages/api-server" || exit 1
yarn build

cd "$REDWOOD_PROJECT_PATH" || exit 1
yarn workspace api add @redwoodjs/api-server

patchDirectory=$(
  yarn patch @redwoodjs/api-server \
  | grep -o "yarn patch-commit -s /private/var/folders/[a-zA-Z0-9/\-]*" \
  | awk '{print $4}'
)

cp -r "$RWFW_PATH/packages/api-server/dist" "$patchDirectory"
yarn patch-commit -s "$patchDirectory"
yarn

cat "$RWFW_PATH/packages/cli/src/commands/experimental/templates/server.ts.template" > "$REDWOOD_PROJECT_PATH/api/src/server.ts"

git add .
git commit -m "chore(createServer): patch @redwoodjs/api-server"
