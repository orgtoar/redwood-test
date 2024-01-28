import fs from 'node:fs'
import path from 'node:path'

import type { FastifyInstance, FastifyServerOptions } from 'fastify'

import { getPaths, getConfig } from '@redwoodjs/project-config'

import type { FastifySideConfigFn, FastifySideConfigFnOptions } from './types'

export const DEFAULT_REDWOOD_FASTIFY_CONFIG: FastifyServerOptions = {
  requestTimeout: 15_000,
  logger: {
    level:
      process.env.LOG_LEVEL ?? process.env.NODE_ENV === 'development'
        ? 'debug'
        : 'info',
  },
}

let isServerConfigLoaded = false

let serverConfigFile: {
  config: FastifyServerOptions
  configureFastify: FastifySideConfigFn
} = {
  config: DEFAULT_REDWOOD_FASTIFY_CONFIG,
  configureFastify: async (fastify, options) => {
    fastify.log.trace(
      options,
      `In configureFastify hook for side: ${options?.side}`
    )
    return fastify
  },
}

export function loadFastifyConfig() {
  const serverTsFileExists = fs.existsSync(
    path.join(getPaths().api.src, 'server.ts')
  )
  const serverJsFileExists =
    !serverTsFileExists &&
    fs.existsSync(path.join(getPaths().api.src, 'server.js'))

  if (serverTsFileExists || serverJsFileExists) {
    const ext = serverTsFileExists ? 'ts' : 'js'
    console.log(`Ignoring Fastify config inside 'api/src/server.config.${ext}`)

    return {
      config: {},
      configureFastify: async (
        fastify: FastifyInstance,
        _options: FastifySideConfigFnOptions
      ) => fastify,
    }
  }

  // TODO: Use `require.resolve` to find the config file. Do we need to babel first?
  const serverConfigPath = path.join(
    getPaths().base,
    getConfig().api.serverConfig
  )

  // If a server.config.js is not found, use the default options.
  if (!fs.existsSync(serverConfigPath)) {
    return serverConfigFile
  }

  if (!isServerConfigLoaded) {
    console.log(`Loading server config from ${serverConfigPath}`)
    serverConfigFile = { ...require(serverConfigPath) }
    isServerConfigLoaded = true
  }

  return serverConfigFile
}
