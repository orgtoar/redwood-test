import terminalLink from 'terminal-link'

import { getYargsDefaults } from '../helpers'

export const command = 'dbAuth'
export const description =
  'Generate Login, Signup and Forgot Password pages for dbAuth'

export function builder(yargs) {
  yargs
    .option('skip-forgot', {
      description: 'Skip generating the Forgot Password page',
      type: 'boolean',
      default: false,
    })
    .option('skip-login', {
      description: 'Skip generating the login page',
      type: 'boolean',
      default: false,
    })
    .option('skip-reset', {
      description: 'Skip generating the Reset Password page',
      type: 'boolean',
      default: false,
    })
    .option('skip-signup', {
      description: 'Skip generating the signup page',
      type: 'boolean',
      default: false,
    })
    .option('webauthn', {
      alias: 'w',
      default: null,
      description: 'Include WebAuthn support (TouchID/FaceID)',
      type: 'boolean',
    })
    .option('username-label', {
      default: null,
      description: 'Override default form label for username field',
      type: 'string',
    })
    .option('password-label', {
      default: null,
      description: 'Override default form label for password field',
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
        'https://redwoodjs.com/docs/authentication#self-hosted-auth-installation-and-setup'
      )}`
    )

  Object.entries(getYargsDefaults()).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./dbAuthHandler.js')
  return handler(options)
}
