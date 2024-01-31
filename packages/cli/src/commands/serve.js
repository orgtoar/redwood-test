import path from 'path'

import fs from 'fs-extra'
import terminalLink from 'terminal-link'

import { apiServerCLIConfig, bothServerCLIConfig } from '@redwoodjs/api-server'
import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import * as webServerCLIConfig from '@redwoodjs/web-server'

import { getPaths, getConfig } from '../lib'
import c from '../lib/colors'

import { webSsrServerHandler } from './serveWebHandler'

export const command = 'serve [side]'
export const description =
  'Start a server for serving both the api and web sides'

function hasServerFile() {
  const serverFilePath = path.join(getPaths().api.dist, 'server.js')
  return fs.existsSync(serverFilePath)
}

export const builder = async (yargs) => {
  yargs
    .command({
      command: '$0',
      description: bothServerCLIConfig.description,
      builder: (yargs) => {
        if (hasServerFile()) {
          yargs.options({
            webPort: {
              description: 'The port for the web server to listen on',
              type: 'number',
              alias: ['web-port'],
            },
            webHost: {
              description:
                "The host for the web server to listen on. Note that you most likely want this to be '0.0.0.0' in production",
              type: 'string',
              alias: ['web-host'],
            },
            apiPort: {
              description: 'The port for the api server to listen on',
              type: 'number',
              alias: ['api-port'],
            },
            apiHost: {
              description:
                "The host for the api server to listen on. Note that you most likely want this to be '0.0.0.0' in production",
              type: 'string',
              alias: ['api-host'],
            },
          })
        }

        bothServerCLIConfig.builder(yargs)
      },
      handler: async (argv) => {
        recordTelemetryAttributes({
          command: 'serve',
          port: argv.port,
          host: argv.host,
          socket: argv.socket,
        })

        // Run the server file, if it exists, with web side also
        if (hasServerFile()) {
          const { bothServerFileHandler } = await import(
            './serveBothHandler.js'
          )
          await bothServerFileHandler(argv)
        } else if (
          getConfig().experimental?.rsc?.enabled ||
          getConfig().experimental?.streamingSsr?.enabled
        ) {
          const { bothSsrRscServerHandler } = await import(
            './serveBothHandler.js'
          )
          await bothSsrRscServerHandler(argv)
        } else {
          await bothServerCLIConfig.handler(argv)
        }
      },
    })
    .command({
      command: 'api',
      description: apiServerCLIConfig.description,
      builder: apiServerCLIConfig.builder,
      handler: async (argv) => {
        recordTelemetryAttributes({
          command: 'serve',
          port: argv.port,
          host: argv.host,
          socket: argv.socket,
          apiRootPath: argv.apiRootPath,
        })

        // Run the server file, if it exists, api side only
        if (hasServerFile()) {
          const { apiServerFileHandler } = await import('./serveApiHandler.js')
          await apiServerFileHandler(argv)
        } else {
          await apiServerCLIConfig.handler(argv)
        }
      },
    })
    .command({
      command: 'web',
      description: webServerCLIConfig.description,
      builder: webServerCLIConfig.builder,
      handler: async (argv) => {
        recordTelemetryAttributes({
          command: 'serve',
          port: argv.port,
          host: argv.host,
          socket: argv.socket,
          apiHost: argv.apiHost,
        })

        if (getConfig().experimental?.streamingSsr?.enabled) {
          await webSsrServerHandler()
        } else {
          await webServerCLIConfig.handler(argv)
        }
      },
    })
    .middleware((argv) => {
      recordTelemetryAttributes({
        command: 'serve',
      })

      // Make sure the relevant side has been built, before serving
      const positionalArgs = argv._

      if (
        positionalArgs.includes('web') &&
        !fs.existsSync(path.join(getPaths().web.dist), 'index.html')
      ) {
        console.error(
          c.error(
            '\n Please run `yarn rw build web` before trying to serve web. \n'
          )
        )
        process.exit(1)
      }

      if (
        positionalArgs.includes('api') &&
        !fs.existsSync(path.join(getPaths().api.dist))
      ) {
        console.error(
          c.error(
            '\n Please run `yarn rw build api` before trying to serve api. \n'
          )
        )
        process.exit(1)
      }

      if (
        // serve both
        positionalArgs.length === 1 &&
        (!fs.existsSync(path.join(getPaths().api.dist)) ||
          !fs.existsSync(path.join(getPaths().web.dist), 'index.html'))
      ) {
        console.error(
          c.error(
            '\n Please run `yarn rw build` before trying to serve your redwood app. \n'
          )
        )
        process.exit(1)
      }

      // Set NODE_ENV to production, if not set
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production'
      }
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#serve'
      )}`
    )
}
