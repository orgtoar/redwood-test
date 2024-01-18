import type { Argv } from 'yargs'

import { getConfig } from '@redwoodjs/project-config'

export const description = 'Start server for serving only the web side'

export function builder(yargs: Argv) {
  yargs.options({
    port: {
      default: getConfig().web.port,
      type: 'number',
      alias: 'p',
    },
    apiHost: {
      alias: 'api-host',
      type: 'string',
      desc: 'Forward requests from the apiUrl, defined in redwood.toml, to this host',
    },
  })
}
