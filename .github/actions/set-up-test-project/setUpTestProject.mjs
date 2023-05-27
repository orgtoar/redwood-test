/* eslint-env node */
// @ts-check

import cache from '@actions/cache'
import core from '@actions/core'
import { hashFiles } from '@actions/glob'

const TEST_PROJECT_PATH = core.getInput('test-project-path')

const key = [
  'test-project',
  process.platform,
  hashFiles('yarn.lock', '.yarnrc.yml'),
  hashFiles('packages')
].join('-')

async function main() {
  const cacheKey = await cache.restoreCache([TEST_PROJECT_PATH], key)

  if (cacheKey) {
    console.log(`Cache hit; restoring test project at ${TEST_PROJECT_PATH}`)
    return
  }

  await setUpTestProject()
}

async function setUpTestProject() {
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

  const execInProject = createExecWithEnvInCwd(TEST_PROJECT_PATH)

  console.log(`Cache miss; creating project at ${TEST_PROJECT_PATH}`)
  await fs.copy(TEST_PROJECT_FIXTURE_PATH, TEST_PROJECT_PATH)
  console.log()

  console.log(`Adding framework dependencies to ${TEST_PROJECT_PATH}`)
  await projectDeps(TEST_PROJECT_PATH)
  console.log()

  console.log(`Installing node_modules in ${TEST_PROJECT_PATH}`)
  await execInProject('yarn install')
  console.log()

  console.log('Copying framework packages to project')
  await projectCopy(TEST_PROJECT_PATH)
  console.log()

  console.log('Generating dbAuth secret')
  const { stdout } = await execInProject(
    'yarn rw g secret --raw',
    { silent: true }
  )
  fs.appendFileSync(
    path.join(TEST_PROJECT_PATH, '.env'),
    `SESSION_SECRET='${stdout}'`
  )
  console.log()

  console.log('Running prisma migrate reset')
  await execInProject(
    'yarn rw prisma migrate reset --force',
  )

  console.log('Caching test project')
  cache.saveCache([TEST_PROJECT_PATH], key)
}

main()
