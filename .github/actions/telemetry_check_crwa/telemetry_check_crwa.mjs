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
  console.log("\n------", req.body, "\n------")

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
await exec(`yarn node ./packages/create-redwood-app/dist/create-redwood-app.js ../crwa-telemetry --typescript true --git true`)

await new Promise(r => setTimeout(r, 5_000));
process.exit(1)
