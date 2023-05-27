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
const TEST_PROJECT_PATH = core.getInput('test-project-path')

const execInProject = createExecWithEnvInCwd(TEST_PROJECT_PATH)

async function main() {
  console.log(`Creating project at ${TEST_PROJECT_PATH}`)
  await fs.copy(TEST_PROJECT_FIXTURE_PATH, TEST_PROJECT_PATH)
  console.log()

  console.log(`Adding framework dependencies to ${TEST_PROJECT_PATH}`)
  await execInFramework(
    'yarn project:deps',
    {
      env: {
        RWJS_CWD: TEST_PROJECT_PATH
      }
    }
  )
  console.log()

  console.log(`Installing node_modules in ${TEST_PROJECT_PATH}`)
  await execInProject('yarn install')
  console.log()

  console.log('Copying framework packages to project')
  await execInFramework(
    'yarn project:copy',
    {
      env: {
        RWJS_CWD: TEST_PROJECT_PATH
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
