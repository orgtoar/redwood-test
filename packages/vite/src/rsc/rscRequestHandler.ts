import busboy from 'busboy'
import type { Request, Response } from 'express'

import {
  decodeReply,
  decodeReplyFromBusboy,
} from '../bundled/react-server-dom-webpack.server'
import { hasStatusCode } from '../lib/StatusError.js'

import { sendRscFlightToStudio } from './rscStudioHandlers.js'
import { renderRsc } from './rscWorkerCommunication.js'

export function createRscRequestHandler() {
  // This is mounted at /rw-rsc, so will have /rw-rsc stripped from req.url
  return async (req: Request, res: Response, next: () => void) => {
    const basePath = '/rw-rsc/'
    console.log('basePath', basePath)
    console.log('req.originalUrl', req.originalUrl, 'req.url', req.url)
    console.log('req.headers.host', req.headers.host)
    console.log("req.headers['rw-rsc']", req.headers['rw-rsc'])

    // https://www.rfc-editor.org/rfc/rfc6648
    // "SHOULD NOT prefix their parameter names with "X-" or similar constructs."
    if (req.headers['rw-rsc'] !== '1') {
      return next()
    }

    const url = new URL(req.originalUrl || '', 'http://' + req.headers.host)
    let rscId: string | undefined
    let props = {}
    let rsfId: string | undefined
    let args: unknown[] = []

    console.log('url.pathname', url.pathname)

    if (url.pathname.startsWith(basePath)) {
      rscId = url.pathname.split('/').pop()
      rsfId = url.searchParams.get('action_id') || undefined

      console.log('rscId', rscId)
      console.log('rsfId', rsfId)

      if (rscId && rscId !== '_') {
        res.setHeader('Content-Type', 'text/x-component')
        props = JSON.parse(url.searchParams.get('props') || '{}')
      } else {
        rscId = undefined
      }

      if (rsfId) {
        // TODO (RSC): For React Server Actions we need to limit the request
        // size somehow
        // https://nextjs.org/docs/app/api-reference/functions/server-actions#size-limitation
        if (req.headers['content-type']?.startsWith('multipart/form-data')) {
          console.log('RSA: multipart/form-data')
          const bb = busboy({ headers: req.headers })
          // TODO (RSC): The generic here could be typed better
          const reply = decodeReplyFromBusboy<unknown[]>(bb)

          req.pipe(bb)
          args = await reply

          // TODO (RSC): Loop over args (to not only look at args[0])
          // TODO (RSC): Verify that this works with node16 (MDN says FormData is
          // only supported in node18 and up)
          if (args[0] instanceof FormData) {
            const serializedFormData: Record<string, any> = {}

            for (const [key, value] of args[0]) {
              // Several form fields can share the same name. This should be
              // represented as an array of the values of all those fields
              if (serializedFormData[key] !== undefined) {
                if (!Array.isArray(serializedFormData[key])) {
                  serializedFormData[key] = [serializedFormData[key]]
                }

                serializedFormData[key].push(value)
              } else {
                serializedFormData[key] = value
              }
            }

            args[0] = {
              __formData__: true,
              state: serializedFormData,
            }
          }
        } else {
          console.log('RSA: regular body')
          let body = ''

          for await (const chunk of req) {
            body += chunk
          }

          if (body) {
            args = await decodeReply(body)
          }
        }
      }
    }

    console.log('rscRequestHandler: args', args)

    if (rscId || rsfId) {
      const handleError = (err: unknown) => {
        if (hasStatusCode(err)) {
          res.statusCode = err.statusCode
        } else {
          console.info('Cannot render RSC', err)
          res.statusCode = 500
        }

        // Getting a warning on GitHub about this
        // https://github.com/redwoodjs/redwood/security/code-scanning/211
        // Handle according to TODO below
        res.end(String(err))
        // TODO (RSC): When we have `yarn rw dev` support we should do this:
        // if (options.command === 'dev') {
        //   res.end(String(err))
        // } else {
        //   res.end()
        // }
      }

      try {
        const pipeable = await renderRsc({ rscId, props, rsfId, args })

        await sendRscFlightToStudio({
          rscId,
          props,
          rsfId,
          args,
          basePath,
          req,
          handleError,
        })

        // TODO (RSC): See if we can/need to do more error handling here
        // pipeable.on(handleError)

        pipeable.pipe(res)
      } catch (e) {
        handleError(e)
      }
    }
  }
}
