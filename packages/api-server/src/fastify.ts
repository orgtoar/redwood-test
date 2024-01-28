import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import type { FastifyInstance, FastifyServerOptions } from 'fastify'
import Fastify from 'fastify'

import { getPaths, getConfig } from '@redwoodjs/project-config'

type FastifySideConfigFn = (
  fastify: FastifyInstance,
  options?: {
    side: 'api' | 'web'
    apiRootPath?: string
  }
) => Promise<FastifyInstance> | void

export const DEFAULT_OPTIONS = {
  requestTimeout: 15_000,
  logger: {
    level:
      process.env.LOG_LEVEL ?? process.env.NODE_ENV === 'development'
        ? 'debug'
        : 'info',
  },
}

let serverConfigLoaded = false
let serverConfigFile: {
  config: FastifyServerOptions
  configureFastify: FastifySideConfigFn
} = {
  config: DEFAULT_OPTIONS,
  configureFastify: async (fastify, options) => {
    fastify.log.trace(
      options,
      `In \`configureFastify\` hook for side: ${options?.side}`
    )
    return fastify
  },
}

export function loadUserConfig() {
  if (serverConfigLoaded) {
    return serverConfigFile
  }

  const serverConfigPath = path.join(
    getPaths().base,
    getConfig().api.serverConfig
  )

  if (!fs.existsSync(serverConfigPath)) {
    serverConfigLoaded = true
    return serverConfigFile
  }

  console.log(`Loading server config from ${serverConfigPath}`)
  console.warn(
    chalk.yellow(
      [
        "Using the 'server.config.js' file to configure the server is deprecated. Consider migrating to the new server file:",
        '',
        '  yarn rw setup server-file',
        '',
      ].join('\n')
    )
  )

  serverConfigFile = { ...require(serverConfigPath) }
  serverConfigLoaded = true
  return serverConfigFile
}

export const createFastifyInstance = (
  options?: FastifyServerOptions
): FastifyInstance => {
  const { config } = loadUserConfig()
  const fastify = Fastify(options ?? config ?? DEFAULT_OPTIONS)
  return fastify
}

export default createFastifyInstance
