import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'component <name>'
export const description = 'Generate a component'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: `Name of the component`,
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
        `https://redwoodjs.com/docs/cli-commands#generate-component`
      )}`
    )

  // Add in passed in options
  Object.entries(getYargsDefaults()).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./componentHandler.js')
  return handler(options)
}
