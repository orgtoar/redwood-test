import { exec, getExecOutput } from "@actions/exec";
import core from "@actions/core";

const IGNORE_FILES = [
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

  const { stdout } = await getExecOutput(
    `git diff origin/${branch} --name-only`,
  );

  const changedFiles = stdout.trim().split("\n").filter(Boolean);

  changedFiles
    .filter((changedFile) => changedFile.startsWith("docs"))
    .filter((changedFile) => IGNORE_FILES.includes(changedFile));

  core.setOutput("only-doc-changes", !!changedFiles.length);
}

run();
