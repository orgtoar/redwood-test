import fastifyUrlData from '@fastify/url-data'
import type { FastifyInstance, HookHandlerDoneFunction } from 'fastify'
import fastifyRawBody from 'fastify-raw-body'

import type { GlobalContext } from '@redwoodjs/context'
import { getAsyncStoreInstance } from '@redwoodjs/context/dist/store'

import { lambdaRequestHandler, loadFunctionsFromDist } from './lambda'

// add... request adapter?

export interface RedwoodFastifyAPIOptions {
  redwood?: {
    apiRootPath?: string
  }
}

export async function redwoodFastifyAPI(
  fastify: FastifyInstance,
  opts: RedwoodFastifyAPIOptions,
  done: HookHandlerDoneFunction
) {
  const options = resolveOptions(opts)

  await fastify.register(fastifyUrlData)
  await fastify.register(fastifyRawBody)

  fastify.addContentTypeParser(
    ['application/x-www-form-urlencoded', 'multipart/form-data'],
    { parseAs: 'string' },
    fastify.defaultTextParser
  )

  const { apiRootPath } = options.redwood

  fastify.all(`${apiRootPath}:routeName`, lambdaRequestHandler)
  fastify.all(`${apiRootPath}:routeName/*`, lambdaRequestHandler)

  await loadFunctionsFromDist()

  done()
}

export function resolveOptions(options: RedwoodFastifyAPIOptions) {
  const redwood = options.redwood ?? {}

  redwood.apiRootPath = formatRootPath(redwood.apiRootPath)

  return { redwood }
}

function formatRootPath(path?: string) {
  if (!path) {
    return '/'
  }

  let newPath = path

  if (newPath.charAt(0) !== '/') {
    newPath = '/' + newPath
  }

  if (newPath.charAt(newPath.length - 1) !== '/') {
    newPath += '/'
  }

  return newPath
}
