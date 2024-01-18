/* eslint-env node */

import fg from 'fast-glob'
import fs from 'fs-extra'

export const defaultBuildOptions = {
  outdir: 'dist',

  platform: 'node',
  target: ['node20'],

  format: 'cjs',

  logLevel: 'info',

  // For visualizing dist.
  // See https://esbuild.github.io/api/#metafile and https://esbuild.github.io/analyze/.
  metafile: true,
}

export async function writeMetaFile({ importMetaUrl, metafile }) {
  await fs.writeJSON(new URL('./meta.json', importMetaUrl), metafile, {
    spaces: 2,
  })
}

export const includeDefaults = ['./src/**/*.{ts,js}']
export const ignoreDefaults = ['**/__tests__', '**/*.test.{ts,js}']

export async function getEntryPoints({ include, ignore } = {}) {
  include ??= includeDefaults
  ignore ??= ignoreDefaults

  const sourceFiles = await fg(include, {
    ignore,
  })

  return sourceFiles
}
