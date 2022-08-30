import terminalLink from 'terminal-link'

import { generatePlugins } from '../index'
import { isTypeScriptProject } from '../lib/project'

export const command = 'generate <type>'
export const aliases = ['g']
export const description = 'Generate boilerplate code and type definitions'

export async function builder(yargs) {
  const execa = await import(execa)

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

  const generateCellCommand = await import('./commands/generate/cell/cell')
  const generateComponentCommand = await import(
    './commands/generate/component/component'
  )
  const generateDataMigrationCommand = await import(
    './commands/generate/dataMigration/dataMigration'
  )
  const generateDbAuthCommand = await import(
    './commands/generate/dbAuth/dbAuth'
  )
  const generateDirectiveCommand = await import(
    './commands/generate/directive/directive'
  )
  const generateFunctionCommand = await import(
    './commands/generate/function/function'
  )
  const generateLayoutCommand = await import(
    './commands/generate/layout/layout'
  )
  const generateModelCommand = await import('./commands/generate/model/model')
  const generatePageCommand = await import('./commands/generate/page/page')
  const generateScaffoldCommand = await import(
    './commands/generate/scaffold/scaffold'
  )
  const generateScriptCommand = await import(
    './commands/generate/script/script'
  )
  const generateSDLCommand = await import('./commands/generate/sdl/sdl')
  const generateSecretCommand = await import(
    './commands/generate/secret/secret'
  )
  const generateServiceCommand = await import(
    './commands/generate/service/service'
  )

  for (const generateCommand of [
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
    ...generatePlugins,
  ]) {
    yargs.command(generateCommand)
  }
}

/** @type {Record<string, import('yargs').Options>} */
export const yargsDefaults = {
  force: {
    alias: 'f',
    default: false,
    description: 'Overwrite existing files',
    type: 'boolean',
  },
  typescript: {
    alias: 'ts',
    default: isTypeScriptProject(),
    description: 'Generate TypeScript files',
    type: 'boolean',
  },
}
