export const command = 'check'
export const aliases = ['diagnostics']
export const description =
  'Get structural diagnostics for a Redwood project (experimental)'

export async function handler(options) {
  const { handler } = await import('./checkHandler.js')
  return handler(options)
}
