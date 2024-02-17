import path from 'path'

import concurrently from 'concurrently'
import execa from 'execa'

import { handler as apiServerHandler } from '@redwoodjs/api-server/dist/apiCLIConfigHandler'
import {
  getApiHost,
  getApiPort,
  getWebHost,
  getWebPort,
} from '@redwoodjs/api-server/dist/cliHelpers'
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
    argv.apiPort ??= getApiPort()
    argv.apiHost ??= getApiHost()
    argv.webPort ??= getWebPort()
    argv.webHost ??= getWebHost()

    const apiProxyTarget = [
      'http://',
      argv.apiHost.includes(':') ? `[${argv.apiHost}]` : argv.apiHost,
      ':',
      argv.apiPort,
      argv.apiRootPath,
    ].join('')

    const { result } = concurrently(
      [
        {
          name: 'api',
          command: `yarn node ${path.join('dist', 'server.js')} --port ${
            argv.apiPort
          } --host ${argv.apiHost} --api-root-path ${argv.apiRootPath}`,
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
  const apiPromise = apiServerHandler({
    apiRootPath: argv.apiRootPath,
    host: argv.apiHost,
    port: argv.apiPort,
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
