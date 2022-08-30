import terminalLink from 'terminal-link'

import { setupUIPlugins } from '../../index'

export const command = 'ui <library>'

export const description = 'Set up a UI design or style library'

export async function builder(yargs) {
  yargs
    .demandCommand()
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#setup-ui'
      )}`
    )

  const setupUIChakraUICommand = await import('./libraries/chakra-ui')
  const setupUIMantineCommand = await import('./libraries/mantine')
  const setupUITailwindCSSCommand = await import('./libraries/tailwindcss')
  const setupUIWindiCSSCommand = await import('.//libraries/windicss')

  for (const setupUICommand of [
    setupUIChakraUICommand,
    setupUIMantineCommand,
    setupUITailwindCSSCommand,
    setupUIWindiCSSCommand,
    ...setupUIPlugins,
  ]) {
    yargs.command(setupUICommand)
  }
}
