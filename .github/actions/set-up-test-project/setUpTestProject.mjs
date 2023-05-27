/* eslint-env node */
// @ts-check

import cache from '@actions/cache'
import core from '@actions/core'
import { hashFiles } from '@actions/glob'

const TEST_PROJECT_PATH = core.getInput('test-project-path')

const key = [
  'test-project',
  process.platform,
  await hashFiles('yarn.lock', '.yarnrc.yml'),
  await hashFiles('packages')
].join('-')

/**
 * @returns {Promise<void>}
 */
async function main() {
  const cacheKey = await cache.restoreCache([TEST_PROJECT_PATH], key)

  if (cacheKey) {
    console.log('Cache restored successfully')
    console.log(`Cache restored from key: ${key}`)
    return
  }

  console.log(`Cache not found for input keys: ${key}`)
  console.log(`Creating project at ${TEST_PROJECT_PATH}`)
  console.log()

  await setUpTestProject(TEST_PROJECT_PATH)

  await cache.saveCache([TEST_PROJECT_PATH], key)
  console.log(`Cache saved with key: ${key}`)
}

/**
 * @returns {Promise<void>}
 */
async function setUpTestProject(testProjectPath) {
  const path = await import('node:path')

  const { default: fs } = await import('fs-extra')

  const {
    createExecWithEnvInCwd,
    projectCopy,
    projectDeps,
    REDWOOD_FRAMEWORK_PATH,
  } = await import('../actionsLib.mjs')

  const TEST_PROJECT_FIXTURE_PATH = path.join(
    REDWOOD_FRAMEWORK_PATH,
    '__fixtures__',
    'test-project'
  )

  const execInProject = createExecWithEnvInCwd(testProjectPath)

  await fs.copy(TEST_PROJECT_FIXTURE_PATH, testProjectPath)

  console.log(`Adding framework dependencies to ${testProjectPath}`)
  await projectDeps(testProjectPath)
  console.log()

  console.log(`Installing node_modules in ${testProjectPath}`)
  await execInProject('yarn install')
  console.log()

  console.log('Copying framework packages to project')
  await projectCopy(testProjectPath)
  console.log()

  console.log('Generating dbAuth secret')
  const { stdout } = await execInProject(
    'yarn rw g secret --raw',
    { silent: true }
  )
  fs.appendFileSync(
    path.join(testProjectPath, '.env'),
    `SESSION_SECRET='${stdout}'`
  )
  console.log()

  console.log('Running prisma migrate reset')
  await execInProject(
    'yarn rw prisma migrate reset --force',
  )
}

main()
