import os from 'node:os'
import path from 'node:path'
import fs from 'fs'

import { exec } from '@actions/exec'
import * as core from '@actions/core'

const test_project_path = path.join(os.tmpdir(), 'test-project')

console.log('-'.repeat(process.stdout.columns))
console.log({ test_project_path })
console.log('-'.repeat(process.stdout.columns))

core.setOutput('test_project_path', test_project_path)

try {
  await exec(`yarn build:test-project --link ${test_project_path}`)
} catch(e) {
  console.error(e)
  process.exitCode = 1
}
