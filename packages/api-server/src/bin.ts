#!/usr/bin/env node

import path from 'path'

import { config } from 'dotenv-defaults'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { getPaths } from '@redwoodjs/project-config'
import * as webServerCLIConfig from '@redwoodjs/web-server'

import {
  apiCliOptions,
  apiServerHandler,
  bothServerHandler,
  commonOptions,
} from './cliHandlers'

if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  config({
    path: path.join(getPaths().base, '.env'),
    defaults: path.join(getPaths().base, '.env.defaults'),
    multiline: true,
  })

  process.env.REDWOOD_ENV_FILES_LOADED = 'true'
}

yargs(hideBin(process.argv))
  .scriptName('rw-server')
  .example('Serve both the api and web', '$0')
  .example('Serve only the api', '$0 api')
  .example('Serve only the web', '$0 web')
  .strict()

  .command(
    '$0',
    'Start a server for serving both the api and the web',
    // @ts-expect-error The yargs types seem wrong; it's ok for builder to be a function
    (yargs) => {
      yargs.options(commonOptions)
    },
    bothServerHandler
  )
  .command(
    'api',
    'Start a server for serving only the api side',
    // @ts-expect-error The yargs types seem wrong; it's ok for builder to be a function
    (yargs) => {
      yargs.options(apiCliOptions)
    },
    apiServerHandler
  )
  .command(
    'web',
    webServerCLIConfig.description,
    // @ts-expect-error The yargs types seem wrong; it's ok for builder to be a function
    webServerCLIConfig.builder,
    webServerCLIConfig.handler
  )
  .parse()
