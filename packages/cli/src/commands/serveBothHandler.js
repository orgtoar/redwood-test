import path from 'path'

import chalk from 'chalk'
import concurrently from 'concurrently'
import execa from 'execa'

import { createFastifyInstance, redwoodFastifyAPI } from '@redwoodjs/fastify'
import { redwoodFastifyWeb, coerceRootPath } from '@redwoodjs/fastify-web'
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
    const apiHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::'
    const apiProxyTarget = `http://${apiHost}:${argv.apiPort}`

    const { result } = concurrently(
      [
        {
          name: 'api',
          command: `yarn node ${path.join('dist', 'server.js')} --port ${
            argv.apiPort
          }`,
          cwd: getPaths().api.base,
          prefixColor: 'cyan',
        },
        {
          name: 'web',
          command: `yarn rw-web-server --port ${argv.webPort} --api-proxy-target ${apiProxyTarget}`,
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
  const { apiServerHandler } = await import('./serveApiHandler.js')

  // TODO Allow specifying port, socket and apiRootPath
  const apiPromise = apiServerHandler({
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

export const bothServerHandler = async (options) => {
  const { port, socket } = options
  const tsServer = Date.now()

  console.log(chalk.italic.dim('Starting API and Web Servers...'))

  const fastify = createFastifyInstance()

  await fastify.register(redwoodFastifyWeb, {
    redwood: {
      ...options,
    },
  })

  const apiRootPath = coerceRootPath(getConfig().web.apiUrl)

  await fastify.register(redwoodFastifyAPI, {
    redwood: {
      ...options,
      apiRootPath,
    },
  })

  let listenOptions

  if (socket) {
    listenOptions = { path: socket }
  } else {
    listenOptions = {
      port,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::',
    }
  }

  const address = await fastify.listen(listenOptions)

  fastify.ready(() => {
    console.log(chalk.dim.italic('Took ' + (Date.now() - tsServer) + ' ms'))

    const webServer = chalk.green(address)
    const apiServer = chalk.magenta(`${address}${apiRootPath}`)
    const graphqlEndpoint = chalk.magenta(`${apiServer}graphql`)

    console.log(`Web server listening at ${webServer}`)
    console.log(`API server listening at ${apiServer}`)
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`)

    sendProcessReady()
  })
}

function sendProcessReady() {
  return process.send && process.send('ready')
}

function logSkippingFastifyWebServer() {
  console.warn('')
  console.warn('⚠️ Skipping Fastify web server ⚠️')
  console.warn('⚠️ Using new RSC server instead ⚠️')
  console.warn('')
}
