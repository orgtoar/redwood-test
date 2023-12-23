import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import { generateSecret } from './secretLib'

export const handler = ({ length, raw }) => {
  recordTelemetryAttributes({
    command: 'generate secret',
    length,
    raw,
  })

  if (raw) {
    console.log(generateSecret(length))
    return
  }

  console.info('')
  console.info(`  ${generateSecret(length)}`)
  console.info('')
  console.info(
    "If you're using this with dbAuth, set a SESSION_SECRET environment variable to this value."
  )
  console.info('')
  console.info('Keep it secret, keep it safe!')
}
