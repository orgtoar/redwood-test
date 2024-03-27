import path from 'node:path'

import * as esbuild from 'esbuild'
import type { BuildOptions as ESBuildOptions } from 'esbuild'
import fg from 'fast-glob'
import fs from 'fs-extra'

export const defaultBuildOptions: ESBuildOptions = {
  outdir: 'dist',

  platform: 'node',
  target: ['node20'],

  format: 'cjs',

  logLevel: 'info',

  // For visualizing dist. See:
  // - https://esbuild.github.io/api/#metafile
  // - https://esbuild.github.io/analyze/
  metafile: true,
}

export const defaultPatterns = ['./src/**/*.{ts,js,tsx,jsx}']
export const defaultIgnorePatterns = [
  '**/__tests__',
  '**/*.test.{ts,js}',
  '**/__fixtures__',
  '**/testUtils',
  '**/__testfixtures__',
]

interface BuildOptions {
  cwd?: string
  buildOptions?: ESBuildOptions
  entryPointOptions?: {
    patterns?: string[]
    ignore?: string[]
  }
  metafileName?: string
}

export async function build({
  cwd,
  buildOptions,
  entryPointOptions,
  metafileName,
}: BuildOptions = {}) {
  // Yarn and Nx both set this to the package's root dir path
  cwd ??= process.cwd()

  buildOptions ??= defaultBuildOptions
  metafileName ??= 'meta.json'

  // If the user didn't explicitly provide entryPoints,
  // then we'll use fg to find all the files in `${cwd}/src`
  let entryPoints = buildOptions.entryPoints

  if (!entryPoints) {
    const patterns = entryPointOptions?.patterns ?? defaultPatterns
    const ignore = entryPointOptions?.ignore ?? defaultIgnorePatterns

    entryPoints = await fg(patterns, {
      cwd,
      ignore,
    })
  }

  const result = await esbuild.build({
    entryPoints,
    ...buildOptions,
  })

  await fs.writeJSON(path.join(cwd, metafileName), result.metafile, {
    spaces: 2,
  })
}
