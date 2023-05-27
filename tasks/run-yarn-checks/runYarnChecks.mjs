/* eslint-env node */
// @ts-check

import core from '@actions/core'
import { exec } from '@actions/exec'

const checks = [
  {
    command: 'yarn constraints',
    fix: 'You can fix this by running `yarn constraints --fix`',
  },
  {
    command: 'yarn dedupe --check',
    fix: 'You can fix this by running `yarn dedupe`',
  },
  {
    command: 'yarn workspaces foreach --parallel run sort-package-json --check',
    fix: 'You can fix this by running `yarn workspaces foreach --parallel dlx sort-package-json`',
  },
]

for (const { command, fix } of checks) {
  try {
    await exec(command)
    console.log()
  } catch (_e) {
    console.log()
    core.setFailed(`"${command}" failed`)
    console.log(fix)
    console.log()
  }
}
