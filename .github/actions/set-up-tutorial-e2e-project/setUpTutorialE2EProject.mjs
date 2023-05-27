/* eslint-env node */
// @ts-check

import path from 'node:path'

import cache from '@actions/cache'
import core from '@actions/core'

import fs from 'fs-extra'

import {
  createCacheKeys,
  createExecWithEnvInCwd,
  execInFramework,
  projectCopy,
  projectDeps,
  REDWOOD_FRAMEWORK_PATH,
} from '../actionsLib.mjs'

const TUTORIAL_E2E_PROJECT_PATH = core.getInput('tutorial-e2e-project-path')

const {
  dependenciesKey,
  distKey
} = await createCacheKeys('tutorial-e2e-project')

/**
 * @returns {Promise<void>}
 */
async function main() {
  const distCacheKey = await cache.restoreCache([TUTORIAL_E2E_PROJECT_PATH], distKey)

  if (distCacheKey) {
    console.log(`Cache restored from key: ${distKey}`)
    return
  }

  const dependenciesCacheKey = await cache.restoreCache([TUTORIAL_E2E_PROJECT_PATH], dependenciesKey)

  if (dependenciesCacheKey) {
    console.log(`Cache restored from key: ${dependenciesKey}`)
    await sharedTasks()
  } else {
    console.log(`Cache not found for input keys: ${distKey}, ${dependenciesKey}`)
    await setUpTutorialE2EProject()
  }

  await cache.saveCache([TUTORIAL_E2E_PROJECT_PATH], distKey)
  console.log(`Cache saved with key: ${distKey}`)
}

/**
 * @returns {Promise<void>}
 */
async function sharedTasks() {
  console.log('Copying framework packages to project')
  await projectCopy(TUTORIAL_E2E_PROJECT_PATH)
  console.log()
}

/**
 * @returns {Promise<void>}
 */
async function setUpTutorialE2EProject() {
  console.log(`Creating project at ${TUTORIAL_E2E_PROJECT_PATH}`)
  console.log()

  await execInFramework([
    'yarn',
    'node',
    path.join('packages', 'create-redwood-app', 'dist', 'create-redwood-app.js'),
    TUTORIAL_E2E_PROJECT_PATH,
    '--typescript',
    '--git',
    "--commit-message first",
  ].join(' '))

  const packageConfigPath = path.join(TUTORIAL_E2E_PROJECT_PATH, 'package.json')
  const packageConfig = fs.readJSONSync(packageConfigPath)

  packageConfig.resolutions = {
    prisma: getRedwoodFrameworkDependencyVersion('prisma', { redwoodPackage: 'cli' }),
    '@prisma/client': getRedwoodFrameworkDependencyVersion('@prisma/client', { redwoodPackage: 'api' }),
    '@prisma/internals': getRedwoodFrameworkDependencyVersion('@prisma/internals', { redwoodPackage: 'cli' }),
    'graphql-yoga': getRedwoodFrameworkDependencyVersion('graphql-yoga', { redwoodPackage: 'graphql-server' }),
  }

  fs.writeFileSync(packageConfigPath, JSON.stringify(packageConfig, null, 2))
  console.log()

  console.log(`Adding framework dependencies to ${TUTORIAL_E2E_PROJECT_PATH}`)
  await projectDeps(TUTORIAL_E2E_PROJECT_PATH)
  console.log()

  console.log(`Installing node_modules in ${TUTORIAL_E2E_PROJECT_PATH}`)
  await execInProject('yarn install')
  console.log()

  console.log(`Adding and committing changes`)
  await execInProject('git add .')
  await execInProject('git commit -m "yarn install"')
  console.log()

  await cache.saveCache([TUTORIAL_E2E_PROJECT_PATH], dependenciesKey)
  console.log(`Cache saved with key: ${dependenciesKey}`)

  await sharedTasks()
}

/**
 * @param {string} dependency
 * @param {{ redwoodPackage: string }} options
 * @returns {string}
 */
function getRedwoodFrameworkDependencyVersion(dependency, { redwoodPackage }) {
  return fs.readJSONSync(
    path.join(REDWOOD_FRAMEWORK_PATH, 'packages', redwoodPackage, 'package.json')
  ).dependencies[dependency]
}

const execInProject = createExecWithEnvInCwd(TUTORIAL_E2E_PROJECT_PATH)

main()
