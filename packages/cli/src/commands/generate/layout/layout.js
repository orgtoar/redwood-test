import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'layout <name>'

export const description = 'Generate a layout component'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'Name of the layout',
      type: 'string',
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        `https://redwoodjs.com/docs/cli-commands#generate-layout`
      )}`
    )
    .option('tests', {
      description: 'Generate test files',
      type: 'boolean',
    })
    .option('stories', {
      description: 'Generate storybook files',
      type: 'boolean',
    })
    .option('verbose', {
      description: 'Print all logs',
      type: 'boolean',
      default: false,
    })
    .option('rollback', {
      description: 'Revert all generator actions if an error occurs',
      type: 'boolean',
      default: true,
    })

  const optionsObj = {
    skipLink: {
      default: false,
      description: 'Generate with skip link',
      type: 'boolean',
    },
    ...getYargsDefaults(),
  }

  Object.entries(optionsObj).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./layoutHandler.js')
  return handler(options)
}
