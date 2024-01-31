import chalk from 'chalk'

import createFastifyInstance from './fastify'
import { getAPIPort, getAPIHost } from './helpers'
import { redwoodFastifyAPI } from './plugins/api'
import type { APIParsedOptions } from './types'

export async function handler(options: APIParsedOptions) {
  const timeStart = Date.now()
  console.log(chalk.dim.italic('Starting API Server...'))

  const fastify = createFastifyInstance()
  fastify.register(redwoodFastifyAPI, {
    redwood: {
      ...options,
      loadUserConfig: true,
    },
  })

  options.host ??= getAPIHost()
  options.port ??= getAPIPort()

  await fastify.listen({
    port: options.port,
    host: options.host,
    listenTextResolver: (address) => {
      // In the past, in development, we've prioritized showing a friendlier
      // host than the listen-on-all-ipv6-addresses '[::]'. Here we replace it
      // with 'localhost' only if 1) we're not in production and 2) it's there.
      // In production it's important to be transparent.
      if (process.env.NODE_ENV !== 'production') {
        address = address.replace(/http:\/\/\[::\]/, 'http://localhost')
      }

      return `Server listening at ${address}`
    },
  })

  fastify.log.trace(
    { custom: { ...fastify.initialConfig } },
    'Fastify server configuration'
  )
  fastify.log.trace(`Registered plugins\n${fastify.printPlugins()}`)

  console.log(chalk.dim.italic('Took ' + (Date.now() - timeStart) + ' ms'))

  // We have this logic for `apiServerHandler` because this is the only
  // handler called by the watch bin (which is called by `yarn rw dev`).
  let address = fastify.listeningOrigin
  if (process.env.NODE_ENV !== 'production') {
    address = address.replace(/http:\/\/\[::\]/, 'http://localhost')
  }

  const apiServer = chalk.magenta(`${address}${options.apiRootPath}`)
  const graphqlEndpoint = chalk.magenta(`${apiServer}graphql`)

  console.log(`API server listening at ${apiServer}`)
  console.log(`GraphQL endpoint at ${graphqlEndpoint}`)

  process?.send?.('ready')
}
