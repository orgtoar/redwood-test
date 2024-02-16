import { parseArgs } from 'util'

import type { FastifyServerOptions } from 'fastify'

import { getConfig } from '@redwoodjs/project-config'

import { getWebHost, getWebPort, getApiHost, getApiPort } from './cliHelpers'

export interface CreateServerOptions {
  /**
   * Logger instance or options.
   */
  logger?: FastifyServerOptions['logger']

  /**
   * Options for the fastify server instance.
   * Omitting logger here because we move it up.
   */
  fastifyServerOptions?: Omit<FastifyServerOptions, 'logger'>

  /**
   * Whether to parse args or not. Defaults to `true`.
   */
  parseArgs?: boolean

  /**
   * The fully-qualified URL to proxy requests to from `apiUrl`.
   */
  apiProxyTarget?: string
}

type DefaultCreateServerOptions = Omit<
  CreateServerOptions,
  'fastifyServerOptions'
> & {
  fastifyServerOptions: Pick<FastifyServerOptions, 'requestTimeout'>
}

export const DEFAULT_CREATE_SERVER_OPTIONS: DefaultCreateServerOptions = {
  logger: {
    level:
      process.env.LOG_LEVEL ??
      (process.env.NODE_ENV === 'development' ? 'debug' : 'warn'),
  },
  fastifyServerOptions: {
    requestTimeout: 15_000,
  },
  parseArgs: true,
}

type ResolvedOptions = Required<
  Omit<CreateServerOptions, 'logger' | 'fastifyServerOptions' | 'parseArgs'> & {
    fastifyServerOptions: FastifyServerOptions
    port: number
    host: string
    apiProxyTarget: string | undefined
  }
>

export function resolveOptions(
  options: CreateServerOptions = {},
  args?: string[]
) {
  options.logger ??= DEFAULT_CREATE_SERVER_OPTIONS.logger

  const apiUrl = getConfig().web.apiUrl
  const apiUrlIsFullyQualifiedUrl = isFullyQualifiedUrl(apiUrl)

  let apiHost
  let apiPort
  let apiRootPath
  let apiProxyTarget

  if (!apiUrlIsFullyQualifiedUrl) {
    apiHost = getApiHost()
    apiPort = getApiPort()
    apiRootPath = '/'
    apiProxyTarget = `http://${apiHost}:${apiPort}${apiRootPath}`
  }

  // Set defaults.
  const resolvedOptions: ResolvedOptions = {
    fastifyServerOptions: options.fastifyServerOptions ?? {
      requestTimeout:
        DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout,
      logger: options.logger ?? DEFAULT_CREATE_SERVER_OPTIONS.logger,
    },

    host: getWebHost(),
    port: getWebPort(),

    apiProxyTarget,
  }

  // Merge fastifyServerOptions.
  resolvedOptions.fastifyServerOptions.requestTimeout ??=
    DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout
  resolvedOptions.fastifyServerOptions.logger = options.logger

  // Parse args so that the user has the chance to override host and port at the CLI.
  // We parse api host and port as well so that we can proxy requests to the api server.
  if (options.parseArgs) {
    const { values } = parseArgs({
      options: {
        webHost: {
          type: 'string',
        },
        webPort: {
          type: 'string',
        },
        apiHost: {
          type: 'string',
        },
        apiPort: {
          type: 'string',
          short: 'p',
        },
        apiRootPath: {
          type: 'string',
        },
      },
      ...(args && { args }),
    })

    if (values.webHost && typeof values.webHost !== 'string') {
      throw new Error('`webHost` must be a string')
    }
    if (values.webHost) {
      resolvedOptions.host = values.webHost
    }
    if (values.webPort) {
      resolvedOptions.port = +values.webPort

      if (isNaN(resolvedOptions.port)) {
        throw new Error('`webPort` must be an integer')
      }
    }

    if (values.apiHost && typeof values.apiHost !== 'string') {
      throw new Error('`host` must be a string')
    }
    if (values.apiHost) {
      apiHost = values.apiHost
    }

    if (values.apiPort) {
      apiPort = +values.apiPort

      if (isNaN(apiPort)) {
        throw new Error('`apiPort` must be an integer')
      }
    }

    if (values.apiRootPath && typeof values.apiRootPath !== 'string') {
      throw new Error('`apiRootPath` must be a string')
    }
    if (values.apiRootPath) {
      apiRootPath = values.apiRootPath
    }
  }

  if (apiHost?.includes(':')) {
    apiHost = `[${apiHost}]`
  }

  if (!apiUrlIsFullyQualifiedUrl) {
    resolvedOptions.apiProxyTarget = `http://${apiHost}:${apiPort}${apiRootPath}`
  }

  return resolvedOptions
}

function isFullyQualifiedUrl(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}
