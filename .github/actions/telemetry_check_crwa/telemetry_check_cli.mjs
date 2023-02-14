import { exec } from '@actions/exec'

import http from "http"

console.log(process.version)

console.log(`Telemetry is being redirected to ${process.env.REDWOOD_REDIRECT_TELEMETRY}`)
const host = process.env.REDWOOD_REDIRECT_TELEMETRY.split(":")[1]
const port = parseInt(process.env.REDWOOD_REDIRECT_TELEMETRY.split(":")[2])

// All the fields we expect inside a telemetry packet
const expectedPacketFields = [
  "type",
  "command",
  "duration",
  "uid",
  "ci",
  "redwoodCi",
  "NODE_ENV",
  "os",
  "osVersion",
  // "shell", // Not expected on windows
  "nodeVersion",
  "yarnVersion",
  "npmVersion",
  "redwoodVersion",
  "system",
  "complexity",
  "sides",
  "bundler"
]

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

    let hasAllFields = true
    for (const field of expectedPacketFields) {
      if(packet[field] === undefined){
        hasAllFields = false
        console.error(`Telemetry packet is missing field "${field}"`)
      }
    }

    const isCI = packet.ci ?? false

    if((hasAllFields && isCI)){
      console.log("Valid telemetry received")
      process.exit(0)
    }else{
      console.error("Invalid telemetry received")
      console.error(packet)
      process.exit(1)
    }
  })
});
server.listen(port, host, () => {
  console.log(`Telemetry listener is running on http://${host}:${port}`);
});

// Run a cli command
try {
  await exec(`yarn rw info`)
} catch (error) {
  console.error(error)
}

// If we didn't hear the telemetry after 2 mins since running crwa then let's fail
await new Promise(r => setTimeout(r, 120_000));
console.error("No telemetry response within 120 seconds. Failing...")
process.exit(1)
