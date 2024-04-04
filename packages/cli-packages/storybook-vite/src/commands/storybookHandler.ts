import fs from 'node:fs'
import path from 'node:path'

import type { ExecaError } from 'execa'
import execa from 'execa'

import { getPaths } from '@redwoodjs/project-config'
// Allow import of untyped package
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { errorTelemetry } from '@redwoodjs/telemetry'

import c from '../lib/colors'
import type { StorybookYargsOptions } from '../types'

export async function handler({
  build,
  buildDirectory,
  ci,
  open,
  port,
  smokeTest,
}: StorybookYargsOptions) {
  // We add a stub file to type generation because users don't have Storybook
  // installed when they first start a project. We need to remove the file once
  // they install Storybook so that the real types come through.
  fs.rmSync(
    path.join(getPaths().generated.types.includes, 'web-storybook.d.ts'),
    { force: true }
  )

  /*
   * TODO: Check if the user has Storybook installed and if not, install it.
   * This will mainly involve installing the 'storybook-framework-redwoodjs-vite' package
   * and initializing the `web/.storybook` directory (along with, at minimum, the `main.ts` file).
   */

  // Check for conflicting options
  if (build && smokeTest) {
    throw new Error('Can not provide both "--build" and "--smoke-test"')
  }

  if (build && open) {
    console.warn(
      c.warning(
        'Warning: --open option has no effect when running Storybook build'
      )
    )
  }

  const cwd = getPaths().web.base
  const staticAssetsFolder = path.join(cwd, 'public')
  const execaOptions: Partial<execa.Options> = {
    stdio: 'inherit',
    shell: true,
    cwd,
  }

  // Create the `MockServiceWorker.js` file. See https://mswjs.io/docs/cli/init.
  await execa.command(
    `yarn msw init "${staticAssetsFolder}" --no-save`,
    execaOptions
  )

  const redwoodProjectPaths = getPaths()
  const storybookConfigPath = path.dirname(
    `${redwoodProjectPaths.web.storybook}/main.ts`
  )

  let command = ''
  const flags = [`--config-dir "${storybookConfigPath}"`]

  if (build) {
    command = `yarn storybook build ${[
      ...flags,
      `--output-dir "${buildDirectory}"`,
    ]
      .filter(Boolean)
      .join(' ')}`
  } else if (smokeTest) {
    command = `yarn storybook dev ${[
      ...flags,
      `--port ${port}`,
      `--smoke-test`,
      `--ci`,
      `--no-version-updates`,
    ]
      .filter(Boolean)
      .join(' ')}`
  } else {
    command = `yarn storybook dev ${[
      ...flags,
      `--port ${port}`,
      `--no-version-updates`,
      ci && '--ci',
      !open && `--no-open`,
    ]
      .filter(Boolean)
      .join(' ')}`
  }

  try {
    await execa.command(command, execaOptions)
  } catch (e) {
    if ((e as ExecaError).signal !== 'SIGINT') {
      console.log(c.error((e as Error).message))
      errorTelemetry(process.argv, (e as Error).message)
    }
    process.exit((e as ExecaError).exitCode ?? 1)
  }
}
