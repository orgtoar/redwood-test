import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'cell <name>'
export const description = 'Generate a cell component'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'Name of the cell',
      type: 'string',
    })
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
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        `https://redwoodjs.com/docs/cli-commands#generate-cell`
      )}`
    )

  const optionsObj = {
    ...getYargsDefaults(),
    list: {
      alias: 'l',
      default: false,
      description:
        'Use when you want to generate a cell for a list of the model name.',
      type: 'boolean',
    },
    query: {
      default: '',
      description:
        'Use to enforce a specific query name within the generated cell - must be unique.',
      type: 'string',
    },
  }

  // Add in passed in options
  Object.entries(optionsObj).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./cellHandler.js')
  return handler(options)
}
