import os from 'node:os'
import path from 'node:path'

import { exec } from '@actions/exec'
import * as core from '@actions/core'

import http from "http"

console.log(process.env.REDWOOD_REDIRECT_TELEMETRY)

// Build the create-redwood-app package
// TODO: Only build CRWA here?
// await exec(`yarn build`)

// Setup fake telemetry server
const server = http.createServer((req, res) => {
  console.log("------")
  console.log(req.body)
  console.log("------")

  res.writeHead(200)
  res.end()

  // TODO: test telemetry packet structure
  process.exit(0)
});
server.listen(7777, "localhost", () => {
  console.log(`Server is running on http://localhost:7777`);
});

// Run create-redwood-app
try {
  await exec(`yarn node ./packages/create-redwood-app/dist/create-redwood-app.js ../crwa-telemetry --typescript true --git false --yarn-install false`)
} catch (error) {
  console.error(error)
}

await new Promise(r => setTimeout(r, 5_000));
process.exit(1)
