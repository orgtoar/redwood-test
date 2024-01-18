/* eslint-disable import/no-extraneous-dependencies */

import * as esbuild from 'esbuild'

import { defaultBuildOptions, writeMetaFile } from '../../buildDefaults.mjs'

const options = {
  ...defaultBuildOptions,
  entryPoints: ['./src/index.ts'],
  bundle: true,
  packages: 'external',
}

const esmResult = await esbuild.build({
  ...options,
  format: 'esm',
  outExtension: { '.js': '.mjs' },
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: esmResult.metafile,
})

const cjsResult = await esbuild.build({
  ...options,
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: cjsResult.metafile,
})
