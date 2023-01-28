import os from 'node:os'
import path from 'node:path'

import { exec } from '@actions/exec'
import * as core from '@actions/core'

import http from "http"

console.log(process.env.REDWOOD_REDIRECT_TELEMETRY)

// Build the create-redwood-app package
// TODO: Only build CRWA here?
await exec(`yarn build`)

// Setup fake telemetry server
const requestListener = function (req, res) {
  console.log(req.body)

  res.writeHead(200)
  res.end()

  // TODO: test telemetry packet structure
  // TODO: exit(0)
}
const server = http.createServer(requestListener);
server.listen(7777, "localhost", () => {
  console.log(`Server is running on http://localhost:7777`);
});

// Run create-redwood-app
const test_project_path = path.join(
  os.tmpdir(),
  'test-project',
  // ":" is problematic with paths
  new Date().toISOString().split(':').join('-')
)
await exec(`yarn ./dist/create-redwood-app.js ${test_project_path}`)

await new Promise(r => setTimeout(r, 5_000));
process.exit(1)
