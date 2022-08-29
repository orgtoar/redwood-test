#!/usr/bin/env node
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

import { config } from 'dotenv-defaults'
import execa from 'execa'
import findup from 'findup-sync'
import terminalLink from 'terminal-link'
import toml from 'toml'
import parser from 'yargs-parser'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { telemetryMiddleware } from '@redwoodjs/telemetry'

import * as buildCommand from './commands/build'
import * as checkCommand from './commands/check'
import * as consoleCommand from './commands/console'
import * as dataMigrateInstallCommand from './commands/dataMigrate/install'
import * as dataMigrateUpCommand from './commands/dataMigrate/up'
import * as deployCommand from './commands/deploy'
import * as destroyCommand from './commands/destroy'
import * as devCommand from './commands/dev'
import * as execCommand from './commands/exec'
import * as generateCellCommand from './commands/generate/cell/cell'
import * as generateComponentCommand from './commands/generate/component/component'
import * as generateDataMigrationCommand from './commands/generate/dataMigration/dataMigration'
import * as generateDbAuthCommand from './commands/generate/dbAuth/dbAuth'
import * as generateDirectiveCommand from './commands/generate/directive/directive'
import * as generateFunctionCommand from './commands/generate/function/function'
import * as generateLayoutCommand from './commands/generate/layout/layout'
import * as generateModelCommand from './commands/generate/model/model'
import * as generatePageCommand from './commands/generate/page/page'
import * as generateScaffoldCommand from './commands/generate/scaffold/scaffold'
import * as generateScriptCommand from './commands/generate/script/script'
import * as generateSDLCommand from './commands/generate/sdl/sdl'
import * as generateSecretCommand from './commands/generate/secret/secret'
import * as generateServiceCommand from './commands/generate/service/service'
import * as infoCommand from './commands/info'
import * as lintCommand from './commands/lint'
import * as prerenderCommand from './commands/prerender'
import * as prismaCommand from './commands/prisma'
import * as recordCommand from './commands/record'
import * as serveCommand from './commands/serve'
import * as setupAuthCommand from './commands/setup/auth/auth'
import * as setupCustomWebIndexCommand from './commands/setup/custom-web-index/custom-web-index'
import * as setupGeneratorCommand from './commands/setup/generator/generator'
import * as setupGraphiqlCommand from './commands/setup/graphiql/graphiql'
import * as setupI18nCommand from './commands/setup/i18n/i18n'
import * as setupTSConfigCommand from './commands/setup/tsconfig/tsconfig'
import * as setupUIChakraUICommand from './commands/setup/ui/libraries/chakra-ui'
import * as setupUIMantineCommand from './commands/setup/ui/libraries/mantine'
import * as setupUITailwindCSSCommand from './commands/setup/ui/libraries/tailwindcss'
import * as setupUIWindiCSSCommand from './commands/setup/ui/libraries/windicss'
import * as setupWebpackCommand from './commands/setup/webpack/webpack'
import * as storybookCommand from './commands/storybook'
import * as testCommand from './commands/test'
import * as tstojsCommand from './commands/ts-to-js'
import * as typeCheckCommand from './commands/type-check'
import * as upgradeCommand from './commands/upgrade'
import { getPaths } from './lib'
import detectRwVersion from './middleware/detectProjectRwVersion'

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

const dataMigrateCommands = [dataMigrateInstallCommand, dataMigrateUpCommand]

const dataMigrateCommand = {
  command: 'data-migrate <command>',
  aliases: ['dm', 'dataMigrate'],
  description: 'Migrate the data in your database',
  builder(yargs) {
    yargs
      .demandCommand()
      .epilogue(
        `Also see the ${terminalLink(
          'Redwood CLI Reference',
          'https://redwoodjs.com/docs/cli-commands#datamigrate'
        )}`
      )

    for (const dataMigrateCommand of dataMigrateCommands) {
      yargs.command(dataMigrateCommand)
    }
  },
}

const generateCommands = [
  generateCellCommand,
  generateComponentCommand,
  generateDataMigrationCommand,
  generateDbAuthCommand,
  generateDirectiveCommand,
  generateFunctionCommand,
  generateLayoutCommand,
  generateModelCommand,
  generatePageCommand,
  generateScaffoldCommand,
  generateScriptCommand,
  generateSDLCommand,
  generateSecretCommand,
  generateServiceCommand,
]

const generateCommand = {
  command: 'generate <type>',
  aliases: ['g'],
  description: 'Generate boilerplate code and type definitions',
  builder(yargs) {
    yargs
      .command('types', 'Generate supplementary code', {}, () => {
        execa.sync('yarn rw-gen', { shell: true, stdio: 'inherit' })
      })
      .demandCommand()
      .epilogue(
        `Also see the ${terminalLink(
          'Redwood CLI Reference',
          'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
        )}`
      )

    for (const generateCommand of generateCommands) {
      yargs.command(generateCommand)
    }
  },
}

const setupUICommands = [
  setupUIChakraUICommand,
  setupUIMantineCommand,
  setupUITailwindCSSCommand,
  setupUIWindiCSSCommand,
]

const setupUICommand = {
  command: 'ui <library>',
  description: 'Set up a UI design or style library',
  builder(yargs) {
    yargs
      .demandCommand()
      .epilogue(
        `Also see the ${terminalLink(
          'Redwood CLI Reference',
          'https://redwoodjs.com/docs/cli-commands#setup-ui'
        )}`
      )

    for (const setupUICommand of setupUICommands) {
      yargs.command(setupUICommand)
    }
  },
}

const setupCommands = [
  setupAuthCommand,
  setupCustomWebIndexCommand,
  setupGeneratorCommand,
  setupGraphiqlCommand,
  setupI18nCommand,
  setupTSConfigCommand,
  setupUICommand,
  setupWebpackCommand,
]

const setupCommand = {
  command: 'setup <command>',
  description: 'Initialize project config and install packages',
  builder(yargs) {
    yargs
      .demandCommand()
      .middleware(detectRwVersion)
      .epilogue(
        `Also see the ${terminalLink(
          'Redwood CLI Reference',
          'https://redwoodjs.com/docs/cli-commands#setup'
        )}`
      )

    for (const setupCommand of setupCommands) {
      yargs.command(setupCommand)
    }
  },
}

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

const redwoodToml = toml.parse(fs.readFileSync(redwoodTomlPath, 'utf-8'))

const requireFromRedwoodProject = createRequire(
  require.resolve(path.join(cwd, 'package.json'))
)

for (const plugin of redwoodToml.cli?.plugins ?? []) {
  try {
    // add to the right one...
    // setup commands
    // commands
    // etc...
    commands.push(requireFromRedwoodProject(plugin))
  } catch (error) {
    console.warn(`Couldn't load plugin at ${plugin}`)
  }
}

// # Add commands and plugins to the CLI

for (const command of commands) {
  cli.command(command)
}

// # Run it

cli.parse()
