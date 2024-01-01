// Inspired by Gatsby and Gridsome. See https://github.com/gatsbyjs/gatsby/blob/ee158d9f23854bd2ced46db3183de52f001f25a7/packages/gatsby-cli/src/create-cli.ts#L346-L354
// and https://github.com/gridsome/gridsome/blob/e396e60ddb9435813dc56cc2d1f98c91c7d64367/packages/cli/lib/commands/info.js#L4-L11.
import envinfo from 'envinfo'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

export async function handler() {
  recordTelemetryAttributes({
    command: 'info',
  })

  const output = await envinfo.run({
    System: ['OS', 'Shell'],
    Binaries: ['Node', 'Yarn'],
    Databases: ['SQLite'],
    Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
    // Getting all the `@redwoodjs/*` packages in all the workspaces isn't supported.
    // See https://github.com/tabrindle/envinfo/issues/121.
    npmPackages: '@redwoodjs/*',
  })

  console.log(output)
}
