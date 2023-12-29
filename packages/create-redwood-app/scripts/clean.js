/* eslint-env node */

import fs from 'fs-extra'

const distPath = new URL('../dist', import.meta.url)
const tarballPath = new URL('../create-redwood-app.tgz', import.meta.url)

const artifactPaths = [distPath, tarballPath]

await Promise.all(
  artifactPaths.map(async (path) => {
    console.log(`Removing ${path}`)
    await fs.rm(path, { recursive: true, force: true })
  })
)

console.log('Done')
