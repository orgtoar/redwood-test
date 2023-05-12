import terminalLink from 'terminal-link'

export const command = 'update'

export const description = 'Update a CLI plugin'

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
    .version(false) // Disable the built-in version option?
    .option('version', {
      alias: 'v',
      description: 'Plugin package version',
      type: 'string',
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
      )}`
    )
}

export const handler = async (options) => {
  const { handler } = await import('./updateHandler')
  return handler(options)
}
