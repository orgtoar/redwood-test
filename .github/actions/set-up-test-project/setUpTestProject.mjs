/* eslint-env node */
// @ts-check

import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fs from 'fs-extra'

import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { exec, getExecOutput } from '@actions/exec'
import * as glob from '@actions/glob'

const REDWOOD_FRAMEWORK_PATH = fileURLToPath(new URL('../../../', import.meta.url))
const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__',
  'test-project'
)
const REDWOOD_PROJECT_PATH = path.join(
  os.tmpdir(),
  'test-project',
  // ":" is problematic with paths
  new Date().toISOString().split(':').join('-')
)

core.setOutput('TEST_PROJECT_PATH', REDWOOD_PROJECT_PATH)

const hash = await glob.hashFiles(['yarn.lock', '.yarnrc.yml'].join('\n'), undefined, undefined, true)

const key = [
  'test-project-cache',
  process.platform,
  process.version,
  process.env.GITHUB_REF_NAME,
  hash,
].join('-')

console.log({
  REDWOOD_PROJECT_PATH,
  key,
})

console.log(`Attempting to restore cache at ${REDWOOD_PROJECT_PATH} with key ${key}`)
const cacheKey = await cache.restoreCache(
  [REDWOOD_PROJECT_PATH],
  key,
)
console.log({
  cacheKey,
})

if (!cacheKey) {
  console.log()
  console.log(`Cache miss; creating project at ${REDWOOD_PROJECT_PATH}`)
  await fs.copy(TEST_PROJECT_FIXTURE_PATH, REDWOOD_PROJECT_PATH)
  console.log()

  console.log(`Adding framework dependencies to ${REDWOOD_PROJECT_PATH}`)
  await run('yarn project:deps')
  console.log()

  console.log(`Installing node_modules in ${REDWOOD_PROJECT_PATH}`)
  await run('yarn install', { cwd: REDWOOD_PROJECT_PATH })
  console.log()

  console.log('Copying framework packages to project')
  await run('yarn project:copy')
  console.log()

  console.log('Generating dbAuth secret')
  const { stdout } = await getExecOutput(
    'yarn rw g secret --raw',
    undefined,
    { cwd: REDWOOD_PROJECT_PATH, silent: true }
  )
  fs.appendFileSync(
    path.join(REDWOOD_PROJECT_PATH, '.env'),
    `SESSION_SECRET='${stdout}'`
  )
  console.log()

  console.log('Running prisma migrate reset')
  await run(
    'yarn rw prisma migrate reset --force',
    { cwd: REDWOOD_PROJECT_PATH }
  )

  console.log(`Caching test project at ${REDWOOD_PROJECT_PATH} with key ${key}`)
  await cache.saveCache([REDWOOD_PROJECT_PATH], key)
}

function run(command, { cwd = REDWOOD_FRAMEWORK_PATH, env = {} } = {}) {
  return exec(command, undefined, {
    cwd, env: {
      ...process.env,
      RWJS_CWD: REDWOOD_PROJECT_PATH,
      ...env
    }
  })
}
