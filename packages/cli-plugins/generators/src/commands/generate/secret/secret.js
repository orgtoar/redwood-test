import password from 'secure-random-password'
import terminalLink from 'terminal-link'

const DEFAULT_LENGTH = 64

export const generateSecret = (length = DEFAULT_LENGTH) => {
  return password.randomPassword({
    length,
    characters: [password.lower, password.upper, password.digits],
  })
}

export const command = 'secret'
export const description =
  'Generates a secret key using a cryptographically-secure source of entropy'

export const builder = (yargs) =>
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

export const handler = ({ length, raw }) => {
  if (raw) {
    console.log(generateSecret(length))
    return
  }

  console.info('')
  console.info(`  ${generateSecret(length)}`)
  console.info('')
  console.info(
    "If you're using this with dbAuth, set a SESSION_SECRET environment variable to this value."
  )
  console.info('')
  console.info('Keep it secret, keep it safe!')
}
