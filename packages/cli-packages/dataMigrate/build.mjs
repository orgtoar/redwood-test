import * as esbuild from 'esbuild'

import {
  defaultBuildOptions,
  getEntryPoints,
  writeMetaFile,
  ignoreDefaults,
} from '../../../buildDefaults.mjs'

const entryPoints = await getEntryPoints({
  ignore: [...ignoreDefaults, './src/types.ts', './src/bin.ts'],
})

const packageResult = await esbuild.build({
  ...defaultBuildOptions,
  entryPoints,
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: packageResult.metafile,
})

// Build bin.
const binResult = await esbuild.build({
  ...defaultBuildOptions,
  entryPoints: ['./src/bin.ts'],

  banner: {
    js: '#!/usr/bin/env node',
  },

  bundle: true,
  minify: true,

  packages: 'external',
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: binResult.metafile,
})
