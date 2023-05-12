import terminalLink from 'terminal-link'

export const command = 'plugin <command>'
export const aliases = ['p']
export const description = 'Helpers for working with Redwood CLI plugins'

export const builder = (yargs) =>
  yargs
    .commandDir('./plugin', {
      recurse: true,
      // @NOTE This regex will ignore all commands nested more than two
      // levels deep.
      // e.g. /generate/hi.js & setup/hi/hi.js are picked up, but
      // generate/hi/hello/bazinga.js will be ignored
      // The [/\\] bit is for supporting both windows and unix style paths
      // Also take care to not trip up on paths that have "setup" earlier
      // in the path by eagerly matching in the start of the regexp
      exclude: /.*[/\\]generate[/\\].*[/\\].*[/\\]/,
    })
    .demandCommand()
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
      )}`
    )
