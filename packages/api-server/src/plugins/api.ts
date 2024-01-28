import path from 'path'

import fastifyUrlData from '@fastify/url-data'
import type { Handler } from 'aws-lambda'
import chalk from 'chalk'
import fg from 'fast-glob'
import type { Options as FastGlobOptions } from 'fast-glob'
import type { FastifyInstance, HookHandlerDoneFunction } from 'fastify'
import type {
  FastifyReply,
  FastifyRequest,
  RequestGenericInterface,
} from 'fastify'
import fastifyRawBody from 'fastify-raw-body'
import { escape } from 'lodash'

import { coerceRootPath } from '@redwoodjs/fastify-web/helpers'
import { getPaths } from '@redwoodjs/project-config'

import { loadUserConfig } from '../fastify'

import { requestHandler } from './awsLambdaFastify'

export interface RedwoodFastifyAPIOptions {
  redwood?: {
    apiRootPath?: string
    loadUserConfig?: boolean
  }
}

export async function redwoodFastifyAPI(
  fastify: FastifyInstance,
  opts: RedwoodFastifyAPIOptions,
  done: HookHandlerDoneFunction
) {
  const redwoodOptions = opts.redwood ?? {}
  redwoodOptions.apiRootPath ??= '/'
  redwoodOptions.apiRootPath = coerceRootPath(redwoodOptions.apiRootPath)
  redwoodOptions.loadUserConfig ??= false

  fastify.register(fastifyUrlData)
  await fastify.register(fastifyRawBody)

  fastify.addContentTypeParser(
    ['application/x-www-form-urlencoded', 'multipart/form-data'],
    { parseAs: 'string' },
    fastify.defaultTextParser
  )

  if (redwoodOptions.loadUserConfig) {
    const { configureFastify } = loadUserConfig()
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
    fastGlobOptions: {
      ignore: ['**/dist/functions/graphql.js'],
    },
  })

  done()
}

// Import functions in './api/dist' and add them to `LAMBDA_FUNCTIONS`
export type LambdaFunctions = Record<string, Handler>
export const LAMBDA_FUNCTIONS: LambdaFunctions = {}

export const setLambdaFunctions = async (apiDistFunctions: string[]) => {
  const tsImport = Date.now()
  console.log(chalk.dim.italic('Importing api functions...'))

  const imports = apiDistFunctions.map(async (fnPath) => {
    const ts = Date.now()
    const routeName = path.basename(fnPath).replace('.js', '')

    const { handler } = await import(fnPath)
    if (!handler) {
      console.warn(
        `${routeName} at ${fnPath} doesn't export a function called \`handler\``
      )
      return
    }

    LAMBDA_FUNCTIONS[routeName] = handler

    console.log(chalk.magenta(`/{routeName}`))
    console.log(chalk.dim.italic(Date.now() - ts + ' ms'))
  })

  await Promise.all(imports)
  console.log(
    chalk.dim.italic('Done importing in ' + (Date.now() - tsImport) + ' ms')
  )
}

interface LoadFunctionsFromDistOptions {
  fastGlobOptions?: FastGlobOptions
}

export const loadFunctionsFromDist = async (
  options: LoadFunctionsFromDistOptions = {}
) => {
  const apiDistFunctions = getApiDistFunctions(
    getPaths().api.base,
    options?.fastGlobOptions
  )

  await setLambdaFunctions(apiDistFunctions)
}

// Copied from @redwoodjs/internal/dist/files to avoid depending on @redwoodjs/internal.
function getApiDistFunctions(
  cwd: string = getPaths().api.base,
  options: FastGlobOptions = {}
) {
  return fg.sync('dist/functions/**/*.{ts,js}', {
    cwd,
    deep: 2, // We don't support deeply nested api functions, to maximise compatibility with deployment providers
    absolute: true,
    ...options,
  })
}

interface LambdaHandlerRequest extends RequestGenericInterface {
  Params: {
    routeName: string
  }
}

/**
 * This takes a fastify request and converts it to a lambdaEvent,
 * then passes it to the the appropriate handler for the `routeName`.
 *
 * The `LAMBDA_FUNCTIONS` lookup has been populated already by this point.
 **/
export const lambdaRequestHandler = async (
  req: FastifyRequest<LambdaHandlerRequest>,
  reply: FastifyReply
) => {
  const { routeName } = req.params

  if (!LAMBDA_FUNCTIONS[routeName]) {
    const errorMessage = `Function "${routeName}" was not found.`
    req.log.error(errorMessage)
    reply.status(404)

    if (process.env.NODE_ENV === 'development') {
      const devError = {
        error: errorMessage,
        availableFunctions: Object.keys(LAMBDA_FUNCTIONS),
      }
      reply.send(devError)
    } else {
      reply.send(escape(errorMessage))
    }

    return
  }

  return requestHandler(req, reply, LAMBDA_FUNCTIONS[routeName])
}
