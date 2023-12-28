import * as esbuild from 'esbuild'
import fs from 'fs-extra'

const outdir = 'dist'

await fs.rm(outdir, { recursive: true, force: true })

const jsBanner = `\
#!/usr/bin/env node

const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
`

const result = await esbuild.build({
  entryPoints: ['src/create-redwood-app.js'],
  outdir,

  platform: 'node',
  format: 'esm',
  bundle: true,

  banner: {
    js: jsBanner,
  },

  minify: true,

  logLevel: 'info',
  metafile: true,
})

await fs.writeJSON('meta.json', result.metafile, { spaces: 2 })
