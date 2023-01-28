import { exec } from '@actions/exec'

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

    const packet = JSON.parse(data)

    const correctFields = JSON.stringify(Object.keys(packet)) === JSON.stringify([
      "type",
      "command",
      "duration",
      "uid",
      "ci",
      "redwoodCi",
      "NODE_ENV",
      "os",
      "osVersion",
      "shell",
      "nodeVersion",
      "yarnVersion",
      "npmVersion",
      "redwoodVersion",
      "system",
      "complexity",
      "sides"
    ])
    const isCI = packet.ci ?? false

    if((correctFields && isCI)){
      console.log("Valid telemetry received")
      process.exit(0)
    }else{
      console.error("Invalid telemetry received")
      console.error(packet)
      process.exit(1)
    }

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
console.error("No telemetry response within 120 seconds. Failing...")
process.exit(1)
