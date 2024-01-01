import terminalLink from 'terminal-link'

import { DEFAULT_LENGTH } from './secretLib'

export const command = 'secret'
export const description =
  'Generates a secret key using a cryptographically-secure source of entropy'

export function builder(yargs) {
  yargs
    .option('length', {
      description: 'Length of the generated secret',
      type: 'integer',
      required: false,
      default: DEFAULT_LENGTH,
    })
    .option('raw', {
      description: 'Prints just the raw secret',
      type: 'boolean',
      required: false,
      default: false,
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-secret'
      )}`
    )
}

export async function handler(options) {
  const { handler } = await import('./secretHandler.js')
  return handler(options)
}
