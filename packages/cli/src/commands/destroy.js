import terminalLink from 'terminal-link'

import * as cellCommand from './destroy/cell/cell'
import * as componentCommand from './destroy/component/component'
import * as directiveCommand from './destroy/directive/directive'
import * as functionCommand from './destroy/function/function'
import * as graphiqlCommand from './destroy/graphiql/graphiql'
import * as layoutCommand from './destroy/layout/layout'
import * as pageCommand from './destroy/page/page'
import * as scaffoldCommand from './destroy/scaffold/scaffold'
import * as sdlCommand from './destroy/sdl/sdl'
import * as serviceCommand from './destroy/service/service'

export const command = 'destroy <type>'
export const aliases = ['d']
export const description = 'Rollback changes made by the generate command'

export function builder(yargs) {
  yargs
    .command(cellCommand)
    .command(componentCommand)
    .command(directiveCommand)
    .command(functionCommand)
    .command(graphiqlCommand)
    .command(layoutCommand)
    .command(pageCommand)
    .command(scaffoldCommand)
    .command(sdlCommand)
    .command(serviceCommand)
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#destroy-alias-d'
      )}`
    )
}
