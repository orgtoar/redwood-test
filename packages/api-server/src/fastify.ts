import fs from 'fs'
import path from 'path'

// change not in release

import type { FastifyInstance, FastifyServerOptions } from 'fastify'
import Fastify from 'fastify'

import { getConfig } from '@redwoodjs/internal/dist/config'
import { getPaths } from '@redwoodjs/internal/dist/paths'

import { FastifySideConfigFn } from './types'

const DEFAULT_OPTIONS = {
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
}

let isServerConfigLoaded = false
let serverConfigFile: {
  config: FastifyServerOptions
  configureFastify: FastifySideConfigFn
} = {
  config: DEFAULT_OPTIONS,
  configureFastify: async (fastify, options) => {
    fastify.log.info(
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

  // If a server.config.js is not found, use the default
  // options set in packages/api-server/src/app.ts
  if (!fs.existsSync(serverConfigPath)) {
    return serverConfigFile
  }

  if (!isServerConfigLoaded) {
    console.log(`Loading server config from ${serverConfigPath} \n`)
    serverConfigFile = { ...require(serverConfigPath) }
    isServerConfigLoaded = true
  }

  return serverConfigFile
}

export const createFastifyInstance = (
  options?: FastifyServerOptions
): FastifyInstance => {
  const { config } = loadFastifyConfig()

  const fastify = Fastify(options || config || DEFAULT_OPTIONS)

  return fastify
}

export default createFastifyInstance
