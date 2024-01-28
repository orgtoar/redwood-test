import fs from 'fs'
import path from 'path'

import type { FastifyInstance, FastifyServerOptions } from 'fastify'
import Fastify from 'fastify'

import type { GlobalContext } from '@redwoodjs/context'
import { getAsyncStoreInstance } from '@redwoodjs/context/dist/store'
import { getPaths, getConfig } from '@redwoodjs/project-config'

import type { FastifySideConfigFn } from './types'

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
  // @TODO use require.resolve to find the config file
  // do we need to babel first?
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

export const createFastifyInstance = (
  options?: FastifyServerOptions
): FastifyInstance => {
  const { config } = loadFastifyConfig()

  const fastify = Fastify(options || config || DEFAULT_REDWOOD_FASTIFY_CONFIG)

  // Ensure that each request has a unique global context
  fastify.addHook('onRequest', (_req, _reply, done) => {
    getAsyncStoreInstance().run(new Map<string, GlobalContext>(), done)
  })

  return fastify
}

export default createFastifyInstance
