import fastifyUrlData from '@fastify/url-data'
import type { Options as FastGlobOptions } from 'fast-glob'
import type { FastifyInstance } from 'fastify'
import fastifyRawBody from 'fastify-raw-body'

import type { GlobalContext } from '@redwoodjs/context'
import { getAsyncStoreInstance } from '@redwoodjs/context/dist/store'
import { coerceRootPath } from '@redwoodjs/fastify-web/dist/helpers'

import { loadFastifyConfig } from '../fastify'

import { lambdaRequestHandler, loadFunctionsFromDist } from './lambdaLoader'

export interface RedwoodFastifyApiOptions {
  redwood: {
    apiRootPath?: string
    fastGlobOptions?: FastGlobOptions
    loadUserConfig?: boolean
  }
}

export async function redwoodFastifyApi(
  fastify: FastifyInstance,
  opts: RedwoodFastifyApiOptions
) {
  const redwoodOptions = opts.redwood ?? {}
  redwoodOptions.apiRootPath ??= '/'
  redwoodOptions.apiRootPath = coerceRootPath(redwoodOptions.apiRootPath)
  redwoodOptions.fastGlobOptions ??= {}
  redwoodOptions.loadUserConfig ??= false

  fastify.register(fastifyUrlData)
  // Starting in Fastify v4, we have to await the fastifyRawBody plugin's registration
  // to ensure it's ready
  await fastify.register(fastifyRawBody)

  fastify.addHook('onRequest', (_req, _reply, done) => {
    getAsyncStoreInstance().run(new Map<string, GlobalContext>(), done)
  })

  fastify.addContentTypeParser(
    ['application/x-www-form-urlencoded', 'multipart/form-data'],
    { parseAs: 'string' },
    fastify.defaultTextParser
  )

  if (redwoodOptions.loadUserConfig) {
    const { configureFastify } = await loadFastifyConfig()
    if (configureFastify) {
      await configureFastify(fastify, {
        side: 'api',
        apiRootPath: redwoodOptions.apiRootPath,
      })
    }
  }

  fastify.all(`${redwoodOptions.apiRootPath}:routeName`, lambdaRequestHandler)
  fastify.all(`${redwoodOptions.apiRootPath}:routeName/*`, lambdaRequestHandler)
  await loadFunctionsFromDist({
    fastGlobOptions: redwoodOptions.fastGlobOptions,
  })
}
