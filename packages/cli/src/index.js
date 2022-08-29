#!/usr/bin/env node
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

import { config } from 'dotenv-defaults'
import findup from 'findup-sync'
import toml from 'toml'
import parser from 'yargs-parser'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

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

// # Setting the CWD
//
// The current working directory can be set via:
//
// 1. The `--cwd` option
// 2. The `RWJS_CWD` env-var
// 3. By traversing directories upwards for the first `redwood.toml`
//
// ## Examples
//
// ```
// yarn rw info --cwd /path/to/project
// RWJS_CWD=/path/to/project yarn rw info
//
// # In this case, `--cwd` wins out
// RWJS_CWD=/path/to/project yarn rw info --cwd /path/to/other/project
//
// # Here `findup` traverses upwards.
// cd api
// yarn rw info
// ```
let { cwd } = parser(hideBin(process.argv))
cwd ??= process.env.RWJS_CWD
const redwoodTomlPath = findup('redwood.toml', { cwd: cwd ?? process.cwd() })

try {
  if (!redwoodTomlPath) {
    throw new Error(
      `Couldn't find a "redwood.toml" file--are you sure you're in a Redwood project?`
    )
  }
} catch (error) {
  console.error(
    [
      `The Redwood CLI couldn't find your project's "redwood.toml".`,
      'Did you run the Redwood CLI in a RedwoodJS project? Or specify "--cwd" incorrectly?',
    ].join('\n')
  )
  process.exit(1)
}

cwd ??= path.dirname(redwoodTomlPath)
process.env.RWJS_CWD = cwd

const rwPaths = getPaths()

// # Load .env, .env.defaults
//
// This should be done as early as possible.
// And the earliest we can do it is after setting the cwd.

config({
  path: path.join(rwPaths.base, '.env'),
  defaults: path.join(rwPaths.base, '.env.defaults'),
  multiline: true,
})

// # Configure the CLI
//
// We don't add commands yet till later cause we have to do so dynamically.
// But we can set options up front.

const cli = yargs(hideBin(process.argv))
  .scriptName('rw')
  .middleware([
    // We've already handled cwd above, but it's still in argv.
    // Let's delete it, and add paths.
    (argv) => {
      if (argv.cwd) {
        delete argv.cwd
      }

      argv.rwPaths = rwPaths
    },
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

// # Redwood's built in commands

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

// # Load plugins

const plugins = []

const redwoodToml = toml.parse(fs.readFileSync(redwoodTomlPath, 'utf-8'))

const requireFromRedwoodProject = createRequire(
  require.resolve(path.join(cwd, 'package.json'))
)

for (const plugin of redwoodToml.cli?.plugins ?? []) {
  try {
    plugins.push(requireFromRedwoodProject(plugin))
  } catch (error) {
    console.warn(`Couldn't load plugin at ${plugin}`)
  }
}

// # Add commands and plugins to the CLI

for (const command of [...commands, ...plugins]) {
  cli.command(command)
}

// # Run it

cli.parse()
