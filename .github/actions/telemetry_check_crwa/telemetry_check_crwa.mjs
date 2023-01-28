import os from 'node:os'
import path from 'node:path'

import { exec } from '@actions/exec'
import * as core from '@actions/core'

import http from "http"

console.log(process.env.REDWOOD_REDIRECT_TELEMETRY)

// Build the create-redwood-app package
await exec(`yarn build`)

const test_project_path = path.join(
  os.tmpdir(),
  'test-project',
  // ":" is problematic with paths
  new Date().toISOString().split(':').join('-')
)

// Redirect telemetry
if (os.type() === "Windows_NT") {
  await exec(`echo "127.0.0.1 telemetry.redwoodjs.com" >> C:\Windows\System32\Drivers\etc\hosts`)
  process.exit(0) // TODO: Fix this
} else if (os.type() === "Linux") {
  await exec("sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``")
  await exec(`sudo echo "127.0.0.1 telemetry.redwoodjs.com" | sudo tee -a /etc/hosts`)
} else {
  throw new Error("unhandled OS type")
}

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
  console.log(`Server is running on http://${host}:${port}`);
});

// Run create-redwood-app
await exec(`yarn ./dist/create-redwood-app.js ${test_project_path}`)

await new Promise(r => setTimeout(r, 5_000));
process.exit(1)
