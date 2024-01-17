import path from 'path'

import chalk from 'chalk'
import execa from 'execa'

import {
  coerceRootPath,
  createFastifyInstance,
  redwoodFastifyAPI,
  redwoodFastifyWeb,
} from '@redwoodjs/fastify'
import { getConfig, getPaths } from '@redwoodjs/project-config'

export const bothExperimentalServerFileHandler = async (argv) => {
  logExperimentalHeader()

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
    // need to start two processes...
    execa('yarn', ['node', path.join('dist', 'server.js')], {
      cwd: getPaths().api.base,
      stdio: 'inherit',
      shell: true,
    })

    execa(
      'yarn',
      [
        'rw-web-server',
        '--port',
        argv.port,
        '--socket',
        argv.socket,
        '--api-host',
        argv.apiHost,
      ],
      {
        cwd: getPaths().base,
        stdio: 'inherit',
        shell: true,
      }
    )
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

  process.on('exit', () => {
    fastify?.close()
  })

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

  fastify.listen(listenOptions)

  fastify.ready(() => {
    console.log(chalk.italic.dim('Took ' + (Date.now() - tsServer) + ' ms'))

    const on = socket
      ? socket
      : chalk.magenta(`http://localhost:${port}${apiRootPath}`)

    const webServer = chalk.green(`http://localhost:${port}`)
    const apiServer = chalk.magenta(`http://localhost:${port}`)
    console.log(`Web server started on ${webServer}`)
    console.log(`API serving from ${apiServer}`)
    console.log(`API listening on ${on}`)
    const graphqlEnd = chalk.magenta(`${apiRootPath}graphql`)
    console.log(`GraphQL endpoint at ${graphqlEnd}`)

    sendProcessReady()
  })
}

function sendProcessReady() {
  return process.send && process.send('ready')
}

const separator = chalk.hex('#ff845e')(
  '------------------------------------------------------------------'
)

function logExperimentalHeader() {
  console.log(
    [
      separator,
      `🧪 ${chalk.green('Experimental Feature')} 🧪`,
      separator,
      'Using the experimental API server file at api/dist/server.js',
      separator,
    ].join('\n')
  )
}

function logSkippingFastifyWebServer() {
  console.warn('')
  console.warn('⚠️ Skipping Fastify web server ⚠️')
  console.warn('⚠️ Using new RSC server instead ⚠️')
  console.warn('')
}
