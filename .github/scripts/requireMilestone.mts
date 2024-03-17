import { fs } from 'zx'

import { consoleBoxen } from './lib/consoleHelpers.mjs'

async function requireMilestone() {
  if (await prHasMilestone()) {
    return
  }

  consoleBoxen(
    '🏷️ Missing milestone',
    [
      "A pull request must have a milestone that indicates where it's supposed to be released:",
      '',
      "- next-release       -- the PR should be released in the next minor (it's a feature)",
      "- next-release-patch -- the PR should be released in the next patch (it's a bug fix or project-side chore)",
      "- v7.0.0             -- the PR should be released in v7.0.0 (it's breaking or builds off a breaking PR)",
      "- chore              -- the PR is a framework-side chore (changes CI, tasks, etc.) and it isn't released, per se",
      '',
      `(If you're still not sure, go with "next-release".)`
    ].join('\n')
  )
  process.exitCode = 1
}

await requireMilestone()

async function prHasMilestone() {
  if (!process.env.GITHUB_EVENT_PATH) {
    throw new Error('This action can only be run on pull requests')
  }

  // `GITHUB_EVENT_PATH` is set in the GitHub Actions runner.
  // It's the path to the file on the runner that contains the full event webhook payload.
  // See https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables.
  const event = await fs.readJson(process.env.GITHUB_EVENT_PATH, 'utf-8')
  const milestone = event.pull_request.milestone

  return !!milestone
}
