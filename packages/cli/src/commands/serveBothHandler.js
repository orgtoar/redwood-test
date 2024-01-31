import path from 'path'

import concurrently from 'concurrently'
import execa from 'execa'

import { apiServerCLIConfig } from '@redwoodjs/api-server'
import {
  getAPIHost,
  getAPIPort,
  getWebHost,
  getWebPort,
} from '@redwoodjs/api-server/helpers'
import { getConfig, getPaths } from '@redwoodjs/project-config'
import { errorTelemetry } from '@redwoodjs/telemetry'

import { exitWithError } from '../lib/exit'

export const bothServerFileHandler = async (argv) => {
  if (
    getConfig().experimental?.rsc?.enabled ||
    getConfig().experimental?.streamingSsr?.enabled
  ) {
    logSkippingFastifyWebServer()

    await execa('yarn', ['rw-serve-fe'], {
      cwd: getPaths().web.base,
      stdio: 'inherit',
      shell: true,
    })
  } else {
    argv.apiPort ??= getAPIPort()
    argv.apiHost ??= getAPIHost()
    argv.webPort ??= getWebPort()
    argv.webHost ??= getWebHost()

    const apiProxyTarget = `http://${argv.apiHost}:${argv.apiPort}`

    const { result } = concurrently(
      [
        {
          name: 'api',
          command: `yarn node ${path.join('dist', 'server.js')} --port ${
            argv.apiPort
          } --host ${argv.apiHost}`,
          cwd: getPaths().api.base,
          prefixColor: 'cyan',
        },
        {
          name: 'web',
          command: `yarn rw-web-server --port ${argv.webPort} --host ${argv.webHost} --api-proxy-target ${apiProxyTarget}`,
          cwd: getPaths().base,
          prefixColor: 'blue',
        },
      ],
      {
        prefix: '{name} |',
        timestampFormat: 'HH:mm:ss',
        handleInput: true,
      }
    )

    try {
      await result
    } catch (error) {
      if (typeof error?.message !== 'undefined') {
        errorTelemetry(
          process.argv,
          `Error concurrently starting sides: ${error.message}`
        )
        exitWithError(error)
      }
    }
  }
}

export const bothSsrRscServerHandler = async (argv) => {
  // TODO Allow specifying port, socket and apiRootPath
  const apiPromise = apiServerCLIConfig.handler({
    ...argv,
    port: 8911,
    apiRootPath: '/',
  })

  // TODO More gracefully handle Ctrl-C
  // Right now you get a big red error box when you kill the process
  const fePromise = execa('yarn', ['rw-serve-fe'], {
    cwd: getPaths().web.base,
    stdio: 'inherit',
    shell: true,
  })

  await Promise.all([apiPromise, fePromise])
}

function logSkippingFastifyWebServer() {
  console.warn('')
  console.warn('⚠️ Skipping Fastify web server ⚠️')
  console.warn('⚠️ Using new RSC server instead ⚠️')
  console.warn('')
}
