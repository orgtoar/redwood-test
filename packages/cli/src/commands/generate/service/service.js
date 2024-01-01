import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'service <name>'
export const description = `Generate a service component`

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'Name of the service',
      type: 'string',
    })
    .option('rollback', {
      description: 'Revert all generator actions if an error occurs',
      type: 'boolean',
      default: true,
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-service'
      )}`
    )

  Object.entries(getDefaults()).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export function getDefaults() {
  return {
    ...getYargsDefaults(),
    tests: {
      description: 'Generate test files',
      type: 'boolean',
    },
    crud: {
      default: true,
      description: 'Create CRUD functions',
      type: 'boolean',
    },
  }
}

export async function handler(options) {
  const { handler } = await import('./serviceHandler.js')
  return handler(options)
}
