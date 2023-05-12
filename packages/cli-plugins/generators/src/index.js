import terminalLink from 'terminal-link'

import * as destroyCell from './commands/destroy/cell/cell.js'
import * as destroyComponent from './commands/destroy/component/component.js'
import * as destroyDirective from './commands/destroy/directive/directive.js'
import * as destroyFunc from './commands/destroy/function/function.js'
// import * as destroyGraphiql from './commands/destroy/graphiql/graphiql.js'
import * as destroyLayout from './commands/destroy/layout/layout.js'
import * as destroyPage from './commands/destroy/page/page.js'
import * as destroyScaffold from './commands/destroy/scaffold/scaffold.js'
import * as destroySdl from './commands/destroy/sdl/sdl.js'
import * as destroyService from './commands/destroy/service/service.js'
import * as generateCell from './commands/generate/cell/cell.js'
import * as generateComponent from './commands/generate/component/component.js'
import * as generateDataMigration from './commands/generate/dataMigration/dataMigration.js'
import * as generateDbAuth from './commands/generate/dbAuth/dbAuth.js'
import * as generateDirective from './commands/generate/directive/directive.js'
import * as generateFunc from './commands/generate/function/function.js'
import * as generateLayout from './commands/generate/layout/layout.js'
import * as generateModel from './commands/generate/model/model.js'
import * as generatePage from './commands/generate/page/page.js'
import * as generateScaffold from './commands/generate/scaffold/scaffold.js'
import * as generateScript from './commands/generate/script/script.js'
import * as generateSdl from './commands/generate/sdl/sdl.js'
import * as generateSecret from './commands/generate/secret/secret.js'
import * as generateService from './commands/generate/service/service.js'

/**
 * This package exports the redwood generator related commands under the
 * `generate` and `destroy` subcommand.
 */
export const commands = [
  {
    command: 'generate <type>',
    aliases: ['g'],
    describe: 'Generate boilerplate code and type definitions',
    builder: (yargs) => {
      const commands = [
        generateCell,
        generateComponent,
        generateDataMigration,
        generateDbAuth,
        generateDirective,
        generateFunc,
        generateLayout,
        generateModel,
        generatePage,
        generateScaffold,
        generateScript,
        generateSdl,
        generateSecret,
        generateService,
      ]
      commands.forEach((command) => {
        yargs.command({
          ...command,
          handler: async (args) => {
            const { handler: commandHandler } = await import(command.handler)
            commandHandler(args)
          },
        })
      })
      yargs
        .demandCommand()
        .epilogue(
          `Also see the ${terminalLink(
            'Redwood CLI Reference',
            'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
          )}`
        )
    },
    handler: () => {},
  },
  {
    command: 'destroy <type>',
    aliases: ['d'],
    describe: 'Rollback changes made by the generate command',
    builder: (yargs) => {
      const commands = [
        destroyCell,
        destroyComponent,
        destroyDirective,
        destroyFunc,
        // destroyGraphiql, // Removed because it tries to reach "setup" code that doesn't exist in this plugin
        destroyLayout,
        destroyPage,
        destroyScaffold,
        destroySdl,
        destroyService,
      ]
      commands.forEach((command) => {
        yargs.command({
          ...command,
          handler: async (args) => {
            const { handler: commandHandler } = await import(command.handler)
            commandHandler(args)
          },
        })
      })
      yargs
        .demandCommand()
        .epilogue(
          `Also see the ${terminalLink(
            'Redwood CLI Reference',
            'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
          )}`
        )
    },
    handler: () => {},
  },
]
