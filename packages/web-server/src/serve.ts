import Fastify from 'fastify'

import { redwoodFastifyWeb } from '@redwoodjs/fastify-web'

type ServeOptions = {
  port?: number
  logger?: any
}

export async function serve(options: ServeOptions = {}) {
  const fastify = Fastify({
    requestTimeout: 15_000,

    logger: options.logger ?? {
      level:
        process.env.LOG_LEVEL ?? process.env.NODE_ENV === 'development'
          ? 'debug'
          : 'warn',
    },
  })

  await fastify.register(redwoodFastifyWeb, {
    redwood: options,
  })

  await fastify.listen({
    port: options.port,
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::',
  })
}

serve()
