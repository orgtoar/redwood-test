/* eslint-env node */
// @ts-check

import http from 'http'
import path from 'path'

import { exec } from '@actions/exec'

console.log(
  `Telemetry is being redirected to ${process.env.REDWOOD_REDIRECT_TELEMETRY}`
)

// Set up fake telemetry server.
const server = http.createServer((req, res) => {
  let data = ''
  req.on('data', (chunk) => {
    data += chunk
  })
  req.on('end', () => {
    res.writeHead(200)
    res.end()
    console.log('Telemetry packet received')
    process.exit(0)
  })
})

// Run the fake telemetry server at the redirected location.

// @ts-expect-error REDWOOD_REDIRECT_TELEMETRY is set by the action
const host = process.env.REDWOOD_REDIRECT_TELEMETRY.split(':')[1].slice(2)
// @ts-expect-error REDWOOD_REDIRECT_TELEMETRY is set by the action
const port = parseInt(process.env.REDWOOD_REDIRECT_TELEMETRY.split(':')[2])

server.listen(port, host, () => {
  console.log(`Telemetry listener is running on http://${host}:${port}`)
})

// Run a command and await output.
try {
  const mode = process.argv[process.argv.indexOf('--mode') + 1]
  let exitCode = 0
  switch (mode) {
    case 'crwa':
      exitCode = await exec(
        `yarn node ./packages/create-redwood-app/dist/create-redwood-app.js ../project-for-telemetry --typescript true --git false`
      )

      if (exitCode) {
        process.exit(1)
      }

      break

    case 'cli':
      exitCode = await exec(
        `yarn install`, undefined, {
          cwd: path.join(process.cwd(), '../project-for-telemetry')
        }
      )

      if (exitCode) {
        process.exit(1)
      }

      exitCode = await exec(
        `yarn node ../redwood/packages/cli/dist/index.js info --cwd ../project-for-telemetry`
      )

      if (exitCode) {
        process.exit(1)
      }

      break

    default:
      console.error(`Unknown mode: ${mode}`)
      process.exit(1)
  }
} catch (error) {
  console.error(error)
}

// Fail if we didn't hear the telemetry after two minutes.
await new Promise((r) => setTimeout(r, 120_000))
console.error('No telemetry response within 120 seconds. Failing.')
process.exitCode = 1
