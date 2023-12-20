import * as esbuild from 'esbuild'
import fs from 'fs-extra'

const outdir = 'dist'

await fs.rm(outdir, { recursive: true, force: true })

const nodeShebang = '#!/usr/bin/env node'

const jsBanner = `\
${nodeShebang}

const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
`

let result = await esbuild.build({
  entryPoints: ['src/index.js', 'src/rwfw.js'],
  outdir,

  platform: 'node',
  format: 'esm',
  bundle: true,

  external: ['@vue/compiler-sfc', 'svelte2tsx'],

  banner: {
    js: jsBanner,
  },

  // minify: true,

  logLevel: 'info',
  metafile: true,
})

await fs.writeJSON('meta.json', result.metafile, { spaces: 2 })

const binProxyEntryPoints = fs
  .readdirSync('./src/binProxies')
  .map((binProxy) => `./src/binProxies/${binProxy}`)

await esbuild.build({
  entryPoints: binProxyEntryPoints,
  outdir: `${outdir}/binProxies`,

  platform: 'node',
  format: 'esm',

  banner: {
    js: nodeShebang,
  },

  // minify: true,

  logLevel: 'info',
  metafile: true,
})
