import { exec, getExecOutput } from "@actions/exec";

const ALL_CONTRIBUTORS_IGNORE_LIST = [
  // core team
  "agiannelli",
  "ajcwebdev",
  "alicelovescake",
  "aldonline",
  "callingmedic911",
  "cannikin",
  "dac09",
  "dthyresson",
  "forresthayes",
  "jtoar",
  "kimadeline",
  "KrisCoulson",
  "mojombo",
  "noire-munich",
  "peterp",
  "realStandal",
  "RobertBroersma",
  "simoncrypta",
  "Tobbe",
  "thedavidprice",
  "virtuoushub",

  // bots
  "codesee-maps[bot]",
  "dependabot[bot]",
  "dependabot-preview[bot]",
  "redwoodjsbot",
  "renovate[bot]",
];

/**
 * @param {string} command
 */
function allContributors(command) {
  return getExecOutput(
    `yarn run all-contributors --config=.all-contributorsrc ${command}`,
    null,
    {
      cwd: "./tasks/all-contributors",
    },
  );
}

async function run() {
  console.log({
    cwd: process.cwd()
  })

  return

  const { stdout } = await allContributors("check");

  const contributors = stdout
    .trim()
    .split("\n")[1]
    .split(",")
    .map((contributor) => contributor.trim())
    .filter(
      (contributor) => !ALL_CONTRIBUTORS_IGNORE_LIST.includes(contributor),
    );

  if (contributors.length === 0) {
    console.log("No contributors to add");
    return;
  }

  for (const contributor of contributors) {
    await allContributors(`add ${contributor} code`);
  }

  await allContributors("generate --contributorsPerLine=5");

  // Commit and push
  await exec("git config user.name github-actions");
  await exec("git config user.email github-actions@github.com");
  await exec("git commit -am chore: update all contributors");
  await exec("git push");
}

run();
