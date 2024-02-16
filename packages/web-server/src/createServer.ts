import path from 'path'

import chalk from 'chalk'
import { config } from 'dotenv-defaults'
import fastify from 'fastify'
import type { FastifyListenOptions, FastifyInstance } from 'fastify'

import { redwoodFastifyWeb } from '@redwoodjs/fastify-web'
import { getPaths } from '@redwoodjs/project-config'

import { resolveOptions } from './createServerHelpers'
import type { CreateServerOptions } from './createServerHelpers'

type StartOptions = Omit<FastifyListenOptions, 'port' | 'host'>

interface Server extends FastifyInstance {
  start: (options?: StartOptions) => Promise<string>
}

// Load .env files if they haven't already been loaded. This makes importing this file effectful:
//
// ```js
// # Loads dotenv...
// import { createServer } from '@redwoodjs/web-server'
// ```
//
// We do it here and not in the function below so that users can access env vars before calling `createServer`
if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  config({
    path: path.join(getPaths().base, '.env'),
    defaults: path.join(getPaths().base, '.env.defaults'),
    multiline: true,
  })

  process.env.REDWOOD_ENV_FILES_LOADED = 'true'
}

/**
 * Creates a server for the web side:
 *
 * ```js
 * import { createServer } from '@redwoodjs/web-server'
 *
 * import { logger } from 'src/lib/logger'
 *
  async function main() {
 *   const server = await createServer({
 *     logger,
 *   })
 *
 *   // Configure the returned fastify instance:
 *   server.register(myPlugin)
 *
 *   // When ready, start the server:
 *   await server.start()
 * }
 *
 * main()
 * ```
 */
export async function createServer(options: CreateServerOptions = {}) {
  const { fastifyServerOptions, port, host, apiProxyTarget } =
    resolveOptions(options)

  const server: Server = Object.assign(fastify(fastifyServerOptions), {
    // `start` will get replaced further down in this file
    start: async () => {
      throw new Error('Not implemented yet')
    },
  })

  await server.register(redwoodFastifyWeb, {
    redwood: {
      apiProxyTarget,
    },
  })

  server.addHook('onListen', (done) => {
    console.log(
      `Web server listening at ${chalk.magenta(`${server.listeningOrigin}`)}`
    )
    done()
  })

  /**
   * A wrapper around `fastify.listen` that handles `--port`, `REDWOOD_API_PORT` and [api].port in redwood.toml
   *
   * The order of precedence is:
   * - `--webPort`
   * - `REDWOOD_WEB_PORT`
   * - [web].port in redwood.toml
   */
  server.start = (options: StartOptions = {}) => {
    return server.listen({
      ...options,
      port,
      host,
    })
  }

  return server
}
