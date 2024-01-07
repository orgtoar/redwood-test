#!/usr/bin/env node

import path from 'path'

import chalk from 'chalk'
import { config } from 'dotenv-defaults'
import Fastify from 'fastify'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { getPaths, getConfig } from '@redwoodjs/project-config'

import { redwoodFastifyWeb } from './web'
import { withApiProxy } from './withApiProxy'

async function serve() {
  const options = yargs(hideBin(process.argv))
    .scriptName('rw-web-server')
    .usage('$0', 'Start server for serving only the web side')
    .strict()

    .options({
      port: {
        default: getConfig().web?.port || 8910,
        type: 'number',
        alias: 'p',
      },
      socket: { type: 'string' },
      apiHost: {
        alias: 'api-host',
        type: 'string',
        desc: 'Forward requests from the apiUrl, defined in redwood.toml to this host',
      },
    })
    .parseSync()

  const redwoodProjectPaths = getPaths()
  const redwoodConfig = getConfig()

  const apiUrl = redwoodConfig.web.apiUrl

  const tsServer = Date.now()

  // Load .env files
  config({
    path: path.join(redwoodProjectPaths.base, '.env'),
    defaults: path.join(redwoodProjectPaths.base, '.env.defaults'),
    multiline: true,
  })

  console.log(chalk.italic.dim('Starting Web Server...'))

  // Configure Fastify
  const fastify = Fastify({
    requestTimeout: 15_000,
    logger: {
      // Note: If running locally using `yarn rw serve` you may want to adust
      // the default non-development level to `info`
      level:
        process.env.LOG_LEVEL ?? process.env.NODE_ENV === 'development'
          ? 'debug'
          : 'warn',
    },
  })

  await fastify.register(redwoodFastifyWeb, {
    redwood: {
      ...options,
    },
  })

  // TODO: Could this be folded into redwoodFastifyWeb?
  // If apiHost is supplied, it means the functions are running elsewhere, so we should just proxy requests.
  if (options.apiHost) {
    // Attach plugin for proxying
    fastify.register(withApiProxy, { apiHost: options.apiHost, apiUrl })
  }

  let listenOptions:
    | { path: string; port?: never; host?: never }
    | { path?: never; port?: number; host?: string }

  if (options.socket) {
    listenOptions = { path: options.socket }
  } else {
    listenOptions = {
      port: options.port,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::',
    }
  }

  // Start
  fastify.listen(listenOptions).then(() => {
    console.log(chalk.italic.dim('Took ' + (Date.now() - tsServer) + ' ms'))
    if (options.socket) {
      console.log(`Web server started on ${options.socket}`)
    } else {
      console.log(`Web server started on http://localhost:${options.port}`)
    }
  })

  process.on('exit', () => {
    fastify.close()
  })
}

serve()
