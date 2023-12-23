import terminalLink from 'terminal-link'

export const command = 'info'
export const description = 'Print your system environment information'

export function builder(yargs) {
  yargs.epilogue(
    `Also see the ${terminalLink(
      'Redwood CLI Reference',
      'https://redwoodjs.com/docs/cli-commands#info'
    )}`
  )
}

export async function handler(options) {
  const { handler } = await import('./infoHandler.js')
  return handler(options)
}
