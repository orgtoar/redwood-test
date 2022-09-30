import path from 'path'

// change not in release

import c from 'ansi-colors'
import type { Handler } from 'aws-lambda'
import { FastifyReply, FastifyRequest, RequestGenericInterface } from 'fastify'
import escape from 'lodash.escape'

import { findApiDistFunctions } from '@redwoodjs/internal/dist/files'

import { requestHandler } from '../requestHandlers/awsLambdaFastify'

export type Lambdas = Record<string, Handler>
export const LAMBDA_FUNCTIONS: Lambdas = {}

// Import the API functions and add them to the LAMBDA_FUNCTIONS object

export const setLambdaFunctions = async (foundFunctions: string[]) => {
  const tsImport = Date.now()
  console.log(c.italic(c.dim('Importing Server Functions... ')))

  const imports = foundFunctions.map((fnPath) => {
    return new Promise((resolve) => {
      const ts = Date.now()
      const routeName = path.basename(fnPath).replace('.js', '')

      const { handler } = require(fnPath)
      LAMBDA_FUNCTIONS[routeName] = handler
      if (!handler) {
        console.warn(
          routeName,
          'at',
          fnPath,
          'does not have a function called handler defined.'
        )
      }
      // TODO: Use terminal link.
      console.log(
        c.magenta('/' + routeName),
        c.italic(c.dim(Date.now() - ts + ' ms'))
      )
      return resolve(true)
    })
  })

  Promise.all(imports).then((_results) => {
    console.log(
      c.italic(c.dim('...Done importing in ' + (Date.now() - tsImport) + ' ms'))
    )
  })
}

// TODO: Use v8 caching to load these crazy fast.
export const loadFunctionsFromDist = async () => {
  const serverFunctions = findApiDistFunctions()
  // Place `GraphQL` serverless function at the start.
  const i = serverFunctions.findIndex((x) => x.indexOf('graphql') !== -1)
  if (i >= 0) {
    const graphQLFn = serverFunctions.splice(i, 1)[0]
    serverFunctions.unshift(graphQLFn)
  }
  await setLambdaFunctions(serverFunctions)
}

interface LambdaHandlerRequest extends RequestGenericInterface {
  Params: {
    routeName: string
  }
}

/**
 This will take a fastify request
 Then convert it to a lambdaEvent, and pass it to the the appropriate handler for the routeName
 The LAMBDA_FUNCTIONS lookup has been populated already by this point
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
