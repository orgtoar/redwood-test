/* eslint-env node */
// @ts-check

import { fileURLToPath } from 'node:url'
import { getExecOutput } from '@actions/exec'

/**
 * @typedef {import('@actions/exec').ExecOptions} ExecOptions
 */

const REDWOOD_FRAMEWORK_PATH = fileURLToPath(new URL('../../', import.meta.url))

/**
 * @param {string} command
 * @param {ExecOptions} options
 */
function execWithEnv(command, { env = {}, ...rest } = {}) {
  return getExecOutput(
    command,
    undefined,
    {
      // @ts-expect-error TS doesn't like spreading process.env here but it's fine
      env: {
        ...process.env,
        ...env
      },
      ...rest
    }
  )
}

/**
 * @param {string} cwd
 */
function createExecWithEnvInCwd(cwd) {
  /**
   * @param {string} command
   * @param {Omit<ExecOptions, 'cwd'>} options
   */
  return function (command, options = {}) {
    return execWithEnv(command, { cwd, ...options })
  }
}

const execInFramework = createExecWithEnvInCwd(REDWOOD_FRAMEWORK_PATH)

export {
  REDWOOD_FRAMEWORK_PATH,
  execInFramework,
  createExecWithEnvInCwd,
}
