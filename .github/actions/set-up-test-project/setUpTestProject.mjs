/* eslint-env node */
// @ts-check

import path from 'node:path'

import cache from '@actions/cache'
import core from '@actions/core'

import fs from 'fs-extra'

import {
  createCacheKeys,
  createExecWithEnvInCwd,
  projectCopy,
  projectDeps,
  REDWOOD_FRAMEWORK_PATH,
} from '../actionsLib.mjs'

const TEST_PROJECT_PATH = core.getInput('test-project-path')

const {
  dependenciesKey,
  distKey
} = await createCacheKeys('test-project')

/**
 * @returns {Promise<void>}
 */
async function main() {
  const packagesCacheKey = await cache.restoreCache([TEST_PROJECT_PATH], distKey)

  if (packagesCacheKey) {
    console.log(`Cache restored from key: ${distKey}`)
    return
  }

  const dependenciesCacheKey = await cache.restoreCache([TEST_PROJECT_PATH], dependenciesKey)

  if (dependenciesCacheKey) {
    console.log(`Cache restored from key: ${dependenciesKey}`)
    await sharedTasks()
  } else {
    console.log(`Cache not found for input keys: ${distKey}, ${dependenciesKey}`)
    await setUpTestProject()
  }

  await cache.saveCache([TEST_PROJECT_PATH], distKey)
  console.log(`Cache saved with key: ${distKey}`)
}

/**
 * @returns {Promise<void>}
 */
async function setUpTestProject() {
  const TEST_PROJECT_FIXTURE_PATH = path.join(
    REDWOOD_FRAMEWORK_PATH,
    '__fixtures__',
    'test-project'
  )

  console.log(`Creating project at ${TEST_PROJECT_PATH}`)
  console.log()
  await fs.copy(TEST_PROJECT_FIXTURE_PATH, TEST_PROJECT_PATH)

  console.log(`Adding framework dependencies to ${TEST_PROJECT_PATH}`)
  await projectDeps(TEST_PROJECT_PATH)
  console.log()

  console.log(`Installing node_modules in ${TEST_PROJECT_PATH}`)
  await execInProject('yarn install')
  console.log()

  await cache.saveCache([TEST_PROJECT_PATH], dependenciesKey)
  console.log(`Cache saved with key: ${dependenciesKey}`)

  await sharedTasks()
}

const execInProject = createExecWithEnvInCwd(TEST_PROJECT_PATH)

/**
 * @returns {Promise<void>}
 */
async function sharedTasks() {
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
}

main()
