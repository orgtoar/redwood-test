import * as esbuild from 'esbuild'

import {
  defaultBuildOptions,
  getEntryPoints,
  writeMetaFile,
} from '../../../../buildDefaults.mjs'

const entryPoints = await getEntryPoints()

const result = await esbuild.build({
  ...defaultBuildOptions,
  entryPoints,
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: result.metafile,
})
