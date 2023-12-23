import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'page <name> [path]'
export const description = `Generate a page component`

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'Name of the page',
      type: 'string',
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        `https://redwoodjs.com/docs/cli-commands#generate-page`
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

  const positionalsObj = {
    path: {
      description: 'URL path to the page, or just {param}. Defaults to name',
      type: 'string',
    },
  }

  // Add in passed in positionals
  Object.entries(positionalsObj).forEach(([option, config]) => {
    yargs.positional(option, config)
  })

  // Add in passed in options
  Object.entries(getYargsDefaults()).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./pageHandler.js')
  return handler(options)
}
