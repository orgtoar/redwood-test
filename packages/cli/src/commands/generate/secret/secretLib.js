import crypto from 'node:crypto'

export const DEFAULT_LENGTH = 32

export function generateSecret(length = DEFAULT_LENGTH) {
  return crypto.randomBytes(length).toString('base64')
}
