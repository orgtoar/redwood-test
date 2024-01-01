export const command = 'init'
export const description =
  'Caches a JSON version of your data model and adds `api/src/models/index.js` with some config'

export const handler = async (options) => {
  const { handler } = await import('./initHandler.js')
  return handler(options)
}
