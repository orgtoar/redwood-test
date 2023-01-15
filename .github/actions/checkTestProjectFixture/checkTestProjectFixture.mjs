/* eslint-env node */

/**
 * todo...
 *
 * - colors, boxen styles
 * - if failure, comment on pr. checkbox?
 * - need to get fetch origin main? why doesn't only doc changes?
 */

import { context } from "@actions/github";
import { exec, getExecOutput } from "@actions/exec";

import boxen from "boxen";

import chalk from 'chalk'

function logSuccess(message) {
  console.log(boxen(message, { title: chalk.green("Ok") }));
}

// If a PR changes a file in one of these directories, the fixture may need to be rebuilt.
const sensitivePaths = [
  // yarn rw g
  "packages/cli/src/commands/generate",
  // yarn rw setup
  "packages/cli/src/commands/setup",
  "packages/cli-helpers/src/",
  // yarn create redwood-app
  "packages/create-redwood-app/template",
  // yarn rw setup auth
  "packages/auth-providers/dbAuth/setup",
];

async function run() {
  // ------------------------
  // If the PR has the "fixture-ok" label, just pass
  console.log({ labels: context.payload.pull_request.labels });

  const hasFixtureOkLabel = context.payload.pull_request.labels.some((label) =>
    label.name === "fixture-ok"
  );

  if (hasFixtureOkLabel) {
    logSuccess('This PR has the "fixture-ok" label');
    return;
  }

  console.log();

  // ------------------------
  // Check if the PR rebuilds the fixture
  await exec("git fetch origin main");
  console.log();
  const { stdout } = await getExecOutput("git diff origin/main --name-only");

  const changedFiles = stdout.trim().split("\n").filter(Boolean);
  const rebuiltFixture = changedFiles.some((file) =>
    file.startsWith("__fixtures__/test-project")
  );

  if (rebuiltFixture) {
    logSuccess("This PR rebuilt the test project fixture");
    return;
  }

  // ------------------------
  // If it doesn't, does it need to be rebuilt?
  const shouldRebuildFixture = changedFiles.some(
    (file) => sensitivePaths.some((path) => file.startsWith(path)),
  );

  if (!shouldRebuildFixture) {
    logSuccess("The test project fixture doesn't need to be rebuilt");
    return;
  }

  console.log(
    boxen(
      [
        "This PR changes files that could affect the test project fixture.",
        `It may need to be rebuilt. But if you know that it doesn't, add the "fixture-ok" label.`,
        "Otherwise, rebuild the test project fixture (this may take a while), commit the changes, and push:",
        "",
        "  yarn build:test-project --rebuild-fixture",
        "",
      ].join("\n"),
      {
        title: "Heads up",
      },
    ),
  );

  process.exitCode = 1;
}

run();
