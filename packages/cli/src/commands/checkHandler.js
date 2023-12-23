import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import { printDiagnostics, DiagnosticSeverity } from '@redwoodjs/structure'

import { getPaths } from '../lib'
import c from '../lib/colors'

export async function handler() {
  recordTelemetryAttributes({
    command: 'check',
  })

  printDiagnostics(getPaths().base, {
    getSeverityLabel: (severity) => {
      if (severity === DiagnosticSeverity.Error) {
        return c.error('error')
      }

      if (severity === DiagnosticSeverity.Warning) {
        return c.warning('warning')
      }

      return c.info('info')
    },
  })
}
