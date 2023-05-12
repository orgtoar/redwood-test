import terminalLink from 'terminal-link'

export const command = 'remove'

export const description = 'Remove a plugin from the CLI'

export const builder = (yargs) => {
  yargs
    .positional('name', {
      description: 'Plugin package name',
      type: 'string',
    })
    .option('force', {
      alias: 'f',
      default: false,
      description: 'Overwrite any checks',
      type: 'boolean',
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
      )}`
    )
}

export const handler = async (options) => {
  const { handler } = await import('./removeHandler')
  return handler(options)
}
