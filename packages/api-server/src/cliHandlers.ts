import chalk from 'chalk'

import { coerceRootPath, redwoodFastifyWeb } from '@redwoodjs/fastify-web'
import { getConfig } from '@redwoodjs/project-config'

import createFastifyInstance from './fastify'
import { redwoodFastifyAPI } from './plugins/api'

function sendProcessReady() {
  process.send && process.send('ready')
}

export const commonOptions = {
  port: {
    description: 'The port to listen on',
    type: 'number',
    alias: 'p',
    default: getConfig().web?.port,
  },
} as const

export const apiCliOptions = {
  port: commonOptions.port,
  apiRootPath: {
    description: 'Prefix for all api routes',
    type: 'string',
    alias: ['api-root-path', 'rootPath', 'root-path'],
    default: '/',
  },
  // No-ops (env files are always loaded), but here so that we don't break existing projects
  loadEnvFiles: {
    hidden: true,
  },
} as const

export const apiServerHandler = async (options: {
  port: number
  apiRootPath: string
}) => {
  const tsApiServer = Date.now()
  console.log(chalk.dim.italic('Starting API server...'))
  const apiRootPath = coerceRootPath(options.apiRootPath)

  const fastify = createFastifyInstance()
  await fastify.register(redwoodFastifyAPI, { redwood: options })

  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::'

  await fastify.listen({
    port: options.port,
    host,
    listenTextResolver: (address) => {
      // In the past, in development, we've prioritized showing a friendlier
      // host than the listen-on-all-ipv6-addresses '[::]'. Here we replace it
      // with 'localhost' only if 1) we're not in production and 2) it's there.
      // In production it's important to be transparent.
      //
      // We have this logic for `apiServerHandler` because this is the only
      // handler called by the watch bin (which is called by `yarn rw dev`).
      if (process.env.NODE_ENV !== 'production') {
        address = address.replace(/http:\/\/\[::\]/, 'http://localhost')
      }

      return `Server listening at ${address}`
    },
  })

  fastify.ready(() => {
    console.log(chalk.dim.italic('Took ' + (Date.now() - tsApiServer) + ' ms'))

    let address = fastify.listeningOrigin
    if (process.env.NODE_ENV !== 'production') {
      address = address.replace(/http:\/\/\[::\]/, 'http://localhost')
    }

    const apiServer = chalk.magenta(`${address}${apiRootPath}`)
    const graphqlEndpoint = chalk.magenta(`${apiServer}graphql`)

    console.log(`API server listening at ${apiServer}`)
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`)

    sendProcessReady()
  })
}

export const bothServerHandler = async (options: { port: number }) => {
  const tsServer = Date.now()
  console.log(chalk.dim.italic('Starting API and Web servers...'))
  const apiRootPath = coerceRootPath(getConfig().web.apiUrl)

  const fastify = createFastifyInstance()

  await fastify.register(redwoodFastifyWeb)
  await fastify.register(redwoodFastifyAPI, { redwood: { apiRootPath } })

  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::'

  await fastify.listen({
    port: options.port,
    host,
    listenTextResolver: (address) => {
      if (process.env.NODE_ENV !== 'production') {
        address = address.replace(/http:\/\/\[::\]/, 'http://localhost')
      }

      return `Server listening at ${address}`
    },
  })

  fastify.ready(() => {
    console.log(chalk.dim.italic('Took ' + (Date.now() - tsServer) + ' ms'))

    const webServer = chalk.green(fastify.listeningOrigin)
    const apiServer = chalk.magenta(`${fastify.listeningOrigin}${apiRootPath}`)
    const graphqlEndpoint = chalk.magenta(`${apiServer}graphql`)

    console.log(`Web server listening at ${webServer}`)
    console.log(`API server listening at ${apiServer}`)
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`)

    sendProcessReady()
  })
}

export { createServer } from './createServer'
