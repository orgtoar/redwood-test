import { build } from '@redwoodjs/framework-tools'

import * as esbuild from 'esbuild'

await build()

// Bundle some react dependencies with the "react-server" condition
// so that we don't need to specify it at runtime.

await esbuild.build({
  entryPoints: ['prebundled/react-server-dom-webpack.server.js'],
  outdir: 'compiled',

  bundle: true,
  conditions: ['react-server'],
  platform: 'node',
  target: ['node20'],

  logLevel: 'info',
})
