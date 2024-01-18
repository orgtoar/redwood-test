/* eslint-env node */

import * as esbuild from 'esbuild'

import { defaultBuildOptions, writeMetaFile } from '../../../buildDefaults.mjs'

const jsBanner = `\
#!/usr/bin/env node

const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
`

const result = await esbuild.build({
  ...defaultBuildOptions,

  entryPoints: ['src/create-redwood-app.js'],

  format: 'esm',
  bundle: true,
  banner: {
    js: jsBanner,
  },

  minify: true,
})

await writeMetaFile({
  importMetaUrl: import.meta.url,
  metafile: result.metafile,
})
