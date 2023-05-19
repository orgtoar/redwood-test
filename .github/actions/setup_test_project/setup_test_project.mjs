import os from 'node:os'
import path from 'node:path'
import fs from 'fs'

import { exec } from '@actions/exec'
import * as core from '@actions/core'

const test_project_path = path.join(
  os.tmpdir(),
  'test-project',
  // ":" is problematic with paths
  new Date().toISOString().split(':').join('-')
)

console.log({
  test_project_path
})

core.setOutput('test_project_path', test_project_path)

try {
  await exec(`yarn build:test-project --link ${test_project_path}`)

  const dir = fs.readdirSync(path.join(test_project_path, 'web', 'src'))

  console.log('------------------------')
  console.log('readdirSync')
  console.log(JSON.stringify(dir))

} catch(e) {
  console.error(e)
  process.exitCode = 1
}
