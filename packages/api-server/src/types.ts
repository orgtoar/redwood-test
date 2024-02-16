import type { FastifyInstance } from 'fastify'

import type { RedwoodFastifyApiOptions } from './plugins/api'

// Types for using server.config.js
export type FastifySideConfigFnOptions = {
  side: 'api' | 'web'
}

export type FastifySideConfigFn = (
  fastify: FastifyInstance,
  options?: FastifySideConfigFnOptions &
    Pick<RedwoodFastifyApiOptions['redwood'], 'apiRootPath'>
) => Promise<FastifyInstance> | void

export type ApiParsedOptions = {
  port?: number
  host?: string
  loadEnvFiles?: boolean
} & Omit<RedwoodFastifyApiOptions['redwood'], 'fastGlobOptions'>

export type BothParsedOptions = {
  webPort?: number
  webHost?: string
  apiPort?: number
  apiHost?: string
  apiRootPath?: string
} & Omit<RedwoodFastifyApiOptions['redwood'], 'fastGlobOptions'>
