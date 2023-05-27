/* eslint-env node */
// @ts-check

import path from 'node:path'

import core from '@actions/core'
import fs from 'fs-extra'

import {
  REDWOOD_FRAMEWORK_PATH,
  execInFramework,
  createExecWithEnvInCwd
} from '../actionsLib.mjs'

const TEST_PROJECT_FIXTURE_PATH = path.join(
  REDWOOD_FRAMEWORK_PATH,
  '__fixtures__',
  'test-project'
)
const REDWOOD_PROJECT_PATH = core.getInput('test-project-path')

const execInProject = createExecWithEnvInCwd(REDWOOD_PROJECT_PATH)

async function main() {
  console.log(`Creating project at ${REDWOOD_PROJECT_PATH}`)
  await fs.copy(TEST_PROJECT_FIXTURE_PATH, REDWOOD_PROJECT_PATH)
  console.log()

  console.log(`Adding framework dependencies to ${REDWOOD_PROJECT_PATH}`)
  await execInFramework(
    'yarn project:deps',
    {
      env: {
        RWJS_CWD: REDWOOD_PROJECT_PATH
      }
    }
  )
  console.log()

  console.log(`Installing node_modules in ${REDWOOD_PROJECT_PATH}`)
  await execInProject('yarn install')
  console.log()

  console.log('Copying framework packages to project')
  await execInFramework(
    'yarn project:copy',
    {
      env: {
        RWJS_CWD: REDWOOD_PROJECT_PATH
      }
    }
  )
  console.log()

  console.log('Generating dbAuth secret')
  const { stdout } = await execInProject(
    'yarn rw g secret --raw',
    { silent: true }
  )
  fs.appendFileSync(
    path.join(REDWOOD_PROJECT_PATH, '.env'),
    `SESSION_SECRET='${stdout}'`
  )
  console.log()

  console.log('Running prisma migrate reset')
  await execInProject(
    'yarn rw prisma migrate reset --force',
  )
}

main()
