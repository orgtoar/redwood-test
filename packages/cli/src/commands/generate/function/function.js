import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'function <name>'
export const description = 'Generate a Function'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'Name of the Function',
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
        'https://redwoodjs.com/docs/cli-commands#generate-function'
      )}`
    )

  // Add default options, includes '--typescript', '--javascript', '--force', ...
  Object.entries(getYargsDefaults).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./functionHandler.js')
  await handler(options)
}
