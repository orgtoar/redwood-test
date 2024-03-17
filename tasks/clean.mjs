#!/usr/bin/env node
/* eslint-env node */

import { rimraf } from 'rimraf'
import { $ } from 'zx'

await $`yarn clean:prisma`

await rimraf('packages/**/dist', {
  glob: {
    ignore: 'packages/**/{fixtures,__fixtures__}/**/dist',
  },
})

// Remove all `tsconfig.tsbuildinfo` files.
await rimraf('packages/**/tsconfig.tsbuildinfo', {
  glob: true,
})

// `@redwoodjs/vite` bundles some react packages at build time.
await rimraf('packages/vite/bundled/*.js', {
  glob: true,
})
