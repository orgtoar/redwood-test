import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

export const command = 'server-file'

export const description = 'Setup the server file'

export function builder(yargs) {
  yargs
    .option('web', {
      default: false,
      description: 'Set up the server file for serving the web too',
      type: 'boolean',
    })
    .option('force', {
      alias: 'f',
      default: false,
      description: 'Overwrite existing configuration',
      type: 'boolean',
    })
    .option('verbose', {
      alias: 'v',
      default: false,
      description: 'Print more logs',
      type: 'boolean',
    })
}

export async function handler(options) {
  recordTelemetryAttributes({
    command: 'setup server-file',
    web: options.web,
    force: options.force,
    verbose: options.verbose,
  })
  const { handler } = await import('./serverFileHandler.js')
  return handler(options)
}
