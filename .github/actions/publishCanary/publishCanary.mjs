import { exec, getExecOutput } from "@actions/exec";

async function run() {
  const args = ["premajor"];

  // @TODO—can use shell? not the end of the world

  // Returns a string like 'v3.8.0'.
  /**
   * @type {`v${number}.${number}.${number}`}
   */
  const { stdout } = await getExecOutput(
    `git tag --sort="-version:refname" --list "v?.?.?" | head -n 1`,
    null,
    { shell: true },
  )

  const latestRelease = stdout.trim();

  // Get the major version from a string like 'v3.8.0'.
  const currentMajor = +latestRelease.match(/^v(?<currentMajor>\d)\./).groups
    .currentMajor;
  const nextMajor = `${currentMajor + 1}.0.0`;

  console.log({ currentMajor, nextMajor });

  // Get the latest RC from NPM.
  /**
   * @type {{ name: string, version: `${number}.${number}.${number}` }}
   */

  await getExecOutput('yarn npm info @redwoodjs/core@rc --fields version --json')
  const { version: latestRC } = JSON.parse(
  );

  if (latestRC.startsWith(nextMajor)) {
    console.log(
      "The latest rc is the same as the canary; adding an extra minor to the canary",
    );

    args.push("--rw-custom-bump");
  }

  args = [
    ...args,
    "--include-merged-tags",
    "--canary",
    `--preid canary`,
    `--dist-tag canary`,
    "--force-publish",
    "--loglevel verbose",
    "--no-git-reset",
    "--yes",
  ];

  console.log({ args });

  await exec(`yarn lerna publish ${args.join(" ")}`);
}

run();
