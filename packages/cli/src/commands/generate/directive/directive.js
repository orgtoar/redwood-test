import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'directive <name>'
export const description = 'Generate a directive component'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: `Name of the directive`,
      type: 'string',
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        `https://redwoodjs.com/docs/cli-commands#generate-directive`
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
    ...getYargsDefaults(),
    type: {
      type: 'string',
      choices: ['validator', 'transformer'],
      description: 'Whether to generate a validator or transformer directive',
    },
  }

  Object.entries(optionsObj).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./directiveHandler.js')
  return handler(options)
}
