import os from 'node:os'
import path from 'node:path'

import { exec } from '@actions/exec'
import * as core from '@actions/core'

import http from "http"

console.log(`Telemetry is being redirected to: ${process.env.REDWOOD_REDIRECT_TELEMETRY}`)

// Setup fake telemetry server
const server = http.createServer((req, res) => {
  let data = ""
  req.on("data", (chunk) => {
    data += chunk
  })
  req.on("end", () => {
    res.writeHead(200)
    res.end()

    const body = JSON.parse(data)
    console.log("------")
    console.log(body)

    // TODO: test telemetry packet structure
    process.exit(0)
  })
});
server.listen(7777, "localhost", () => {
  console.log(`Telemetry listener is running on http://localhost:7777`);
});

// Run create-redwood-app
try {
  await exec(`yarn node ./packages/create-redwood-app/dist/create-redwood-app.js ../crwa-telemetry --typescript true --git false --yarn-install false`)
} catch (error) {
  console.error(error)
}

// If we didn't hear the telemetry after 2 mins then let's fail
await new Promise(r => setTimeout(r, 120_000));
process.exit(1)
