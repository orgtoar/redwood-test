import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'data-migration <name>'
export const aliases = ['dataMigration', 'dm']
export const description = 'Generate a data migration'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'A descriptor of what this data migration does',
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
        'https://redwoodjs.com/docs/cli-commands#generate-datamigration'
      )}`
    )

  Object.entries(getYargsDefaults()).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}
