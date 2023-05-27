/* eslint-env node */
// @ts-check

import path from 'node:path'

import core from '@actions/core'
import fs from 'fs-extra'

import {
  createExecWithEnvInCwd,
  execInFramework,
  projectCopy,
  projectDeps,
  REDWOOD_FRAMEWORK_PATH,
} from '../actionsLib.mjs'

const TUTORIAL_E2E_PROJECT_PATH = core.getInput('tutorial-e2e-project-path')

const execInProject = createExecWithEnvInCwd(TUTORIAL_E2E_PROJECT_PATH)

function getRedwoodFrameworkDependencyVersion(dependency, { redwoodPackage }) {
  return fs.readJSONSync(
    path.join(REDWOOD_FRAMEWORK_PATH, 'packages', redwoodPackage, 'package.json')
  ).dependencies[dependency]
}

async function main() {
  console.log(`Creating project at ${TUTORIAL_E2E_PROJECT_PATH}`)

  await execInFramework([
    'yarn',
    'node',
    path.join('packages', 'create-redwood-app', 'dist', 'create-redwood-app.js'),
    TUTORIAL_E2E_PROJECT_PATH,
    '--typescript',
    '--git',
    "--commit-message 'first'",
  ].join(' '))

  // Add prisma resolutions
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

  console.log('Copying framework packages to project')
  await projectCopy(TUTORIAL_E2E_PROJECT_PATH)
  console.log()
}

main()
