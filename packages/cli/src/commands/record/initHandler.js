import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import { exitWithError } from '../../lib/exit'

export async function handler() {
  recordTelemetryAttributes({
    command: 'record',
  })

  try {
    const {
      default: { parseDatamodel },
    } = await import('@redwoodjs/record')

    await parseDatamodel()
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }

    exitWithError(undefined, {
      message: [
        "Error: Can't find module `@redwoojds/record`. Have you added `@redwoodjs/record` to the api side?",
        '',
        '  yarn workspace api add @redwoodjs/record',
        '',
      ].join('\n'),
      includeEpilogue: false,
    })
  }
}
