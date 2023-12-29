import path from 'path'

import checkNodeVersionCb from 'check-node-version'
import fs from 'fs-extra'
import terminalLink from 'terminal-link'

export const USE_GITPOD_TEXT = [
  `  As an alternative solution, you can launch a Redwood project using GitPod instead. GitPod is a an online IDE.`,
  `  See: ${terminalLink(
    'Launch Redwood using GitPod',
    'https://gitpod.io/#https://github.com/redwoodjs/starter',
    {
      fallback: () =>
        'Launch Redwood using GitPod https://gitpod.io/#https://github.com/redwoodjs/starter',
    }
  )}`,
]

export const INITIAL_COMMIT_MESSAGE = 'Initial commit'

/**
 * This type has to be updated if the engines field in the create redwood app template package.json is updated.
 * @returns [boolean, Record<'node' | 'yarn', any>]
 */
export function checkNodeVersion(templateDir) {
  return new Promise((resolve) => {
    const { engines } = fs.readJSONSync(path.join(templateDir, 'package.json'))

    checkNodeVersionCb(engines, (_error, result) => {
      return resolve([result.isSatisfied, result.versions])
    })
  })
}
