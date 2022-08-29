#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

import { config } from 'dotenv-defaults'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { getConfigPath } from '@redwoodjs/internal/dist/paths'
import { telemetryMiddleware } from '@redwoodjs/telemetry'

import * as buildCommand from './commands/build'
import * as checkCommand from './commands/check'
import * as consoleCommand from './commands/console'
import * as dataMigrateCommand from './commands/data-migrate'
import * as deployCommand from './commands/deploy'
import * as destroyCommand from './commands/destroy'
import * as devCommand from './commands/dev'
import * as execCommand from './commands/exec'
import * as generateCommand from './commands/generate'
import * as infoCommand from './commands/info'
import * as lintCommand from './commands/lint'
import * as prerenderCommand from './commands/prerender'
import * as prismaCommand from './commands/prisma'
import * as recordCommand from './commands/record'
import * as serveCommand from './commands/serve'
import * as setupCommand from './commands/setup'
import * as storybookCommand from './commands/storybook'
import * as testCommand from './commands/test'
import * as tstojsCommand from './commands/ts-to-js'
import * as typeCheckCommand from './commands/type-check'
import * as upgradeCommand from './commands/upgrade'
import { getPaths } from './lib'

/**
 * The current working directory can be set via:
 * 1. A `--cwd` option
 * 2. The `RWJS_CWD` env-var
 * 3. Found by traversing directories upwards for the first `redwood.toml`
 *
 * This middleware parses, validates, and sets current working directory
 * in the order above.
 */
const getCwdMiddleware = (argv) => {
  let configPath

  try {
    let cwd
    if (argv.cwd) {
      cwd = argv.cwd
      // We delete the argument because it's not actually referenced in CLI,
      // we use the `RWJS_CWD` env-var,
      // and it conflicts with "forwarding" commands such as test and prisma.
      delete argv.cwd
    } else if (process.env.RWJS_CWD) {
      cwd = process.env.RWJS_CWD
    } else {
      cwd = path.dirname(getConfigPath())
    }

    configPath = path.resolve(process.cwd(), cwd, 'redwood.toml')
    if (!fs.existsSync(configPath)) {
      throw new Error('Could not find `redwood.toml` config file.')
    }

    process.env.RWJS_CWD = cwd
  } catch (e) {
    console.error()
    console.error('Error: Redwood CLI could not find your config file.')
    console.error(`Expected '${configPath}'`)
    console.error()
    console.error(`Did you run Redwood CLI in a RedwoodJS project?`)
    console.error(`Or specify an incorrect '--cwd' option?`)
    console.error()
    process.exit(1)
  }
}

const loadDotEnvDefaultsMiddleware = () => {
  config({
    path: path.join(getPaths().base, '.env'),
    defaults: path.join(getPaths().base, '.env.defaults'),
    multiline: true,
  })
}

const cli = yargs(hideBin(process.argv))
  .scriptName('rw')
  .middleware([
    getCwdMiddleware,
    loadDotEnvDefaultsMiddleware,
    telemetryMiddleware,
  ])
  .option('cwd', {
    describe: 'Working directory to use (where `redwood.toml` is located.)',
  })
  .example(
    'yarn rw g page home /',
    "\"Create a page component named 'Home' at path '/'\""
  )
  .demandCommand()
  .strict()

const commands = [
  buildCommand,
  checkCommand,
  consoleCommand,
  dataMigrateCommand,
  deployCommand,
  destroyCommand,
  devCommand,
  execCommand,
  generateCommand,
  infoCommand,
  lintCommand,
  prerenderCommand,
  prismaCommand,
  recordCommand,
  serveCommand,
  setupCommand,
  storybookCommand,
  testCommand,
  tstojsCommand,
  typeCheckCommand,
  upgradeCommand,
]

for (const command of commands) {
  cli.command(command)
}

cli.parse()
