import execa from 'execa'
import terminalLink from 'terminal-link'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import * as cellCommand from './generate/cell/cell'
import * as componentCommand from './generate/component/component'
import * as dataMigrationCommand from './generate/dataMigration/dataMigration'
import * as dbAuthCommand from './generate/dbAuth/dbAuth'
import * as directiveCommand from './generate/directive/directive'
import * as functionCommand from './generate/function/function'
import * as layoutCommand from './generate/layout/layout'
import * as modelCommand from './generate/model/model'
import * as pageCommand from './generate/page/page'
import * as realtimeCommand from './generate/realtime/realtime'
import * as scaffoldCommand from './generate/scaffold/scaffold'
import * as scriptCommand from './generate/script/script'
import * as sdlCommand from './generate/sdl/sdl'
import * as secretCommand from './generate/secret/secret'
import * as serviceCommand from './generate/service/service'

export const command = 'generate <type>'
export const aliases = ['g']
export const description = 'Generate boilerplate code and type definitions'

export function builder(yargs) {
  yargs
    .command(cellCommand)
    .command(componentCommand)
    .command(dataMigrationCommand)
    .command(dbAuthCommand)
    .command(directiveCommand)
    .command(functionCommand)
    .command(layoutCommand)
    .command(modelCommand)
    .command(pageCommand)
    .command(realtimeCommand)
    .command(scaffoldCommand)
    .command(scriptCommand)
    .command(sdlCommand)
    .command(secretCommand)
    .command(serviceCommand)
    .command('types', 'Generate supplementary code', {}, () => {
      recordTelemetryAttributes({
        command: 'generate types',
      })

      try {
        execa.sync('yarn rw-gen', { shell: true, stdio: 'inherit' })
      } catch (error) {
        // rw-gen is responsible for logging its own errors but we need to
        // make sure we exit with a non-zero exit code
        process.exitCode = error.exitCode ?? 1
      }
    })

    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-alias-g'
      )}`
    )
}
