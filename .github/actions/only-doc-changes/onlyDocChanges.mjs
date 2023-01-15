import core from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";

// Docs that aren't in the docs directory
const ignoreFiles = [
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "CONTRIBUTORS.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
];

async function run() {
  const branch = process.env.GITHUB_BASE_REF;

  await exec(`git fetch origin ${branch}`);
  console.log();

  const { stdout } = await getExecOutput(
    `git diff origin/${branch} --name-only`,
  );
  console.log()

  // A PR is considered to only have doc changes if it...
  // 1. only changes files in the docs directory
  // 2. only changes files in `ignoreFiles`
  const changedFiles = stdout.trim().split("\n")
    .filter(Boolean)
    .filter((changedFile) => changedFile.startsWith("docs"))
    .filter((changedFile) => ignoreFiles.includes(changedFile));

  console.log({ changedFiles })

  core.setOutput("only-doc-changes", !!changedFiles.length);
}

run();
