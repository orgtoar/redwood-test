import type { ProcessOutput } from 'zx'

export function unwrap(po: ProcessOutput) {
  return po.stdout
}

export function getLines(po) {
  const stdout = unwrap(po)
  return stdout.trim().split('\n')
}
