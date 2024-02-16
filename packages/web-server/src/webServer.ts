import path from 'path'

import chalk from 'chalk'
import fs from 'fs-extra'

import { getPaths } from '@redwoodjs/project-config'

import { getWebHost, getWebPort } from './cliHelpers'
import { createServer } from './createServer'
import type { ParsedOptions } from './types'

export async function serveWeb(options: ParsedOptions = {}) {
  const start = Date.now()
  console.log(chalk.dim.italic('Starting web server...'))

  const distIndexExists = await fs.pathExists(
    path.join(getPaths().web.dist, 'index.html')
  )
  if (!distIndexExists) {
    throw new Error(
      'no built files to serve; run `yarn rw build web` before serving the web side'
    )
  }

  options.host ??= getWebHost()
  options.port ??= getWebPort()

  const server = await createServer({
    parseArgs: false,
    apiProxyTarget: options.apiProxyTarget,
  })
  await server.listen({
    host: options.host,
    port: options.port,
  })

  console.log(chalk.dim.italic('Took ' + (Date.now() - start) + ' ms'))
}
