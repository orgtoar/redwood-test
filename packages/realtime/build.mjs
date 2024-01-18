import * as esbuild from 'esbuild'

import { defaultBuildOptions, writeMetaFile } from '../../buildDefaults.mjs'

const result = await esbuild.build({
  ...defaultBuildOptions,
  entryPoints: ['./src/index.ts'],

  bundle: true,
  packages: 'external',
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: result.metafile,
})
