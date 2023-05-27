/* eslint-env node */
// @ts-check

import path from 'node:path'

import cache from '@actions/cache'
import core from '@actions/core'
import { hashFiles } from '@actions/glob'

import fs from 'fs-extra'

import {
  createExecWithEnvInCwd,
  projectCopy,
  projectDeps,
  REDWOOD_FRAMEWORK_PATH,
} from '../actionsLib.mjs'

const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__',
  'test-project'
)

const TEST_PROJECT_PATH = core.getInput('test-project-path')

const execInProject = createExecWithEnvInCwd(TEST_PROJECT_PATH)

const baseKey = [
  'test-project',
  process.env.RUNNER_OS,
].join('-')

const dependenciesKey = [
  baseKey,
  await hashFiles('yarn.lock', '.yarnrc.yml'),
].join('-')

const packagesKey = [
  dependenciesKey,
  await hashFiles('packages')
].join('-')

/**
 * @returns {Promise<void>}
 */
async function main() {
  const packagesCacheKey = await cache.restoreCache([TEST_PROJECT_PATH], packagesKey)

  if (packagesCacheKey) {
    console.log(`Cache restored from key: ${packagesKey}`)
    return
  }

  const dependenciesCacheKey = await cache.restoreCache([TEST_PROJECT_PATH], dependenciesKey)

  if (dependenciesCacheKey) {
    console.log(`Cache restored from key: ${dependenciesKey}`)
    await sharedTasks()
  } else {
    console.log(`Cache not found for input keys: ${packagesKey}, ${dependenciesKey}`)
    console.log(`Creating project at ${TEST_PROJECT_PATH}`)
    console.log()

    await setUpTestProject(TEST_PROJECT_PATH)
  }

  await cache.saveCache([TEST_PROJECT_PATH], packagesKey)
  console.log(`Cache saved with key: ${packagesKey}`)
}

/**
 * @returns {Promise<void>}
 */
async function setUpTestProject(testProjectPath) {
  await fs.copy(TEST_PROJECT_FIXTURE_PATH, testProjectPath)

  console.log(`Adding framework dependencies to ${testProjectPath}`)
  await projectDeps(testProjectPath)
  console.log()

  console.log(`Installing node_modules in ${testProjectPath}`)
  await execInProject('yarn install')
  console.log()

  await cache.saveCache([TEST_PROJECT_PATH], dependenciesKey)
  console.log(`Cache saved with key: ${dependenciesKey}`)

  await sharedTasks()
}

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
