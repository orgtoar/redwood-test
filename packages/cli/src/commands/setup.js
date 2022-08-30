import terminalLink from 'terminal-link'

import { setupCommands } from '../'
import detectRwVersion from '../middleware/detectProjectRwVersion'

export const command = 'setup <command>'

export const description = 'Initialize project config and install packages'

export async function builder(yargs) {
  yargs
    .demandCommand()
    .middleware(detectRwVersion)
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#setup'
      )}`
    )

  const setupAuthCommand = await import('./commands/setup/auth/auth')
  const setupCustomWebIndexCommand = await import(
    './commands/setup/custom-web-index/custom-web-index'
  )
  const setupGeneratorCommand = await import(
    './commands/setup/generator/generator'
  )
  const setupGraphiqlCommand = await import(
    './commands/setup/graphiql/graphiql'
  )
  const setupI18nCommand = await import('./commands/setup/i18n/i18n')
  const setupTSConfigCommand = await import(
    './commands/setup/tsconfig/tsconfig'
  )
  const setupUICommand = await import('./commands/setup/ui/ui')
  const setupWebpackCommand = await import('./commands/setup/webpack/webpack')

  for (const setupCommand of [
    setupAuthCommand,
    setupCustomWebIndexCommand,
    setupGeneratorCommand,
    setupGraphiqlCommand,
    setupI18nCommand,
    setupTSConfigCommand,
    setupUICommand,
    setupWebpackCommand,
    ...setupCommands,
  ]) {
    yargs.command(setupCommand)
  }
}
