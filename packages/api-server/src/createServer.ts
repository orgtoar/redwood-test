import fs from 'fs'
import path from 'path'
import { parseArgs as _parseArgs } from 'util'

import fastifyUrlData from '@fastify/url-data'
import c from 'ansi-colors'
// @ts-expect-error can't be typed
import { config } from 'dotenv-defaults'
import fastify from 'fastify'
import type { FastifyListenOptions, FastifyServerOptions } from 'fastify'
import fastifyRawBody from 'fastify-raw-body'

import { getConfig, getPaths } from '@redwoodjs/project-config'

import {
  loadFunctionsFromDist,
  lambdaRequestHandler,
} from './plugins/lambdaLoader'

// Load .env files if they haven't already been loaded. This makes this file have an effectful import.
// It's here and not in the function below so that users can access env vars before calling `createServer`.
if (process.env.RWJS_CWD && !process.env.REDWOOD_ENV_FILES_LOADED) {
  config({
    path: path.join(getPaths().base, '.env'),
    defaults: path.join(getPaths().base, '.env.defaults'),
    multiline: true,
  })
}

export interface CreateServerOptions {
  /**
   * The prefix for all routes. Defaults to `/`.
   */
  routePrefix?: string

  /**
   * Logger instance or options.
   */
  logger?: FastifyServerOptions['logger']

  /**
   * Options for the fastify server instance.
   * Omitting logger here because we move it up.
   */
  fastifyServerOptions?: Omit<FastifyServerOptions, 'logger'>
}

/**
 * Creates a server for api functions:
 *
 * ```js
 * const server = await createServer({
 *   logger,
 *   routePrefix: '/api'
 * })
 *
 * // Configure the returned fastify instance:
 * server.register(myPlugin)
 *
 * // When ready, start the server:
 * await server.start()
 * ```
 */
export async function createServer(options: CreateServerOptions = {}) {
  const { routePrefix, fastifyServerOptions } =
    resolveCreateServerOptions(options)

  // ------------------------
  // Warn about `api/server.config.js`.
  const serverConfigPath = path.join(
    getPaths().base,
    getConfig().api.serverConfig
  )

  if (fs.existsSync(serverConfigPath)) {
    console.warn(
      c.yellow(
        [
          '',
          `Ignoring \`config\` and \`configureServer\` in api/server.config.js.`,
          `Migrate them to api/src/server.{ts,js}`,
          '',
          `\`\`\`js title="api/src/server.{ts,js}"`,
          '// Pass your config to `createServer`',
          'const server = createServer({',
          '  fastifyServerOptions: myFastifyConfig',
          '})',
          '',
          '// Then inline your `configureFastify` logic:',
          'server.register(myFastifyPlugin)',
          '```',
          '',
        ].join('\n')
      )
    )
  }

  // ------------------------
  // Initialize the fastify instance.
  const server = fastify(fastifyServerOptions)

  // ------------------------
  // Register api/dist functions.
  // TODO: this should probably all be in a plugin.
  // TODO: isolate context.
  server.register(fastifyUrlData)
  await server.register(fastifyRawBody)

  server.addContentTypeParser(
    ['application/x-www-form-urlencoded', 'multipart/form-data'],
    { parseAs: 'string' },
    server.defaultTextParser
  )

  server.all(`${routePrefix}:routeName`, lambdaRequestHandler)
  server.all(`${routePrefix}:routeName/*`, lambdaRequestHandler)

  await loadFunctionsFromDist()

  // ------------------------
  // See https://github.com/redwoodjs/redwood/pull/4744.
  server.addHook('onReady', (done) => {
    process.send?.('ready')
    done()
  })

  // ------------------------
  // Just logging. The conditional here is to appease TS.
  // `server.server.address()` can return a string, an AddressInfo object, or null.
  // Note that the logging here ("Listening on...") seems to be duplicated, probably by `@redwoodjs/graphql-server`.
  server.addHook('onListen', (done) => {
    const addressInfo = server.server.address()

    if (!addressInfo || typeof addressInfo === 'string') {
      done()
      return
    }

    server.log.info(
      `Listening on ${c.magenta(
        `http://${addressInfo.address}:${addressInfo.port}${routePrefix}`
      )}`
    )
    done()
  })

  /**
   * A wrapper around `fastify.listen` that handles `--port`, `REDWOOD_API_PORT` and [api].port in redwood.toml
   *
   * The order of precedence is:
   * - `--port`
   * - `REDWOOD_API_PORT`
   * - [api].port in redwood.toml
   */
  function start(options: Omit<FastifyListenOptions, 'port' | 'host'> = {}) {
    return server.listen(resolveStartOptions(options))
  }

  // TODO: type this.
  // @ts-expect-error TODO
  server.start = start

  return server
}

type ResolvedCreateServerOptions = Required<
  Omit<CreateServerOptions, 'logger' | 'fastifyServerOptions'> & {
    fastifyServerOptions: FastifyServerOptions
  }
>

export function resolveCreateServerOptions(
  options: CreateServerOptions = {}
): ResolvedCreateServerOptions {
  options.logger ??= DEFAULT_CREATE_SERVER_OPTIONS.logger

  // Set defaults.
  const resolvedOptions: ResolvedCreateServerOptions = {
    routePrefix:
      options.routePrefix ?? DEFAULT_CREATE_SERVER_OPTIONS.routePrefix,

    fastifyServerOptions: options.fastifyServerOptions ?? {
      requestTimeout:
        DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout,
      logger: options.logger ?? DEFAULT_CREATE_SERVER_OPTIONS.logger,
    },
  }

  // Merge fastifyServerOptions.
  resolvedOptions.fastifyServerOptions.requestTimeout ??=
    DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout
  resolvedOptions.fastifyServerOptions.logger = options.logger

  // Ensure the routePrefix begins and ends with a slash.
  if (resolvedOptions.routePrefix.charAt(0) !== '/') {
    resolvedOptions.routePrefix = `/${resolvedOptions.routePrefix}`
  }

  if (
    resolvedOptions.routePrefix.charAt(
      resolvedOptions.routePrefix.length - 1
    ) !== '/'
  ) {
    resolvedOptions.routePrefix = `${resolvedOptions.routePrefix}/`
  }

  return resolvedOptions
}

type DefaultCreateServerOptions = Required<
  Omit<CreateServerOptions, 'fastifyServerOptions'> & {
    fastifyServerOptions: Pick<FastifyServerOptions, 'requestTimeout'>
  }
>

export const DEFAULT_CREATE_SERVER_OPTIONS: DefaultCreateServerOptions = {
  routePrefix: '/',
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  },
  fastifyServerOptions: {
    requestTimeout: 15_000,
  },
}

function resolveStartOptions(
  options: Omit<FastifyListenOptions, 'port' | 'host'>
): FastifyListenOptions {
  const resolvedOptions: FastifyListenOptions = options

  // Right now, `host` isn't configurable and is set based on `NODE_ENV` for Docker.
  resolvedOptions.host =
    process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::'

  const args = parseArgs()

  if (args.port) {
    resolvedOptions.port = args.port
  } else {
    if (process.env.REDWOOD_API_PORT === undefined) {
      resolvedOptions.port = getConfig().api.port
    } else {
      resolvedOptions.port = parseInt(process.env.REDWOOD_API_PORT)
    }
  }

  return resolvedOptions
}

/**
 * The `args` parameter is just for testing. `_parseArgs` defaults to `process.argv`, which is what we want.
 * This is also exported just for testing.
 */
export function parseArgs(args?: string[]) {
  const options = {
    port: {
      type: 'string',
      short: 'p',
    },
  }

  const { values } = _parseArgs({
    // When running Jest, `process.argv` is...
    //
    // ```js
    // [
    //    'path/to/node'
    //    'path/to/jest.js'
    //    'file/under/test.js'
    // ]
    // ```
    //
    // `parseArgs` strips the first two, leaving the third, which is interpreted as a positional argument.
    // Which fails our options. We'd still like to be strict, but can't do it for tests.
    strict: process.env.NODE_ENV === 'test' ? false : true,

    ...(args && { args }),
    // @ts-expect-error TODO
    options,
  })

  const parsedArgs: { port?: number } = {}

  if (values.port) {
    parsedArgs.port = +values.port

    if (isNaN(parsedArgs.port)) {
      throw new Error('`--port` must be a number')
    }
  }

  return parsedArgs
}
