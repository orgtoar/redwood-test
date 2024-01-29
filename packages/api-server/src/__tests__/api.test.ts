import path from 'path'

import createFastifyInstance from '../fastify'
import { redwoodFastifyAPI } from '../plugins/api'

// Suppress terminal logging.
console.log = jest.fn()
console.warn = jest.fn()

// Set up RWJS_CWD.
let original_RWJS_CWD

beforeAll(() => {
  original_RWJS_CWD = process.env.RWJS_CWD
  process.env.RWJS_CWD = path.resolve(__dirname, 'fixtures/redwood-app')
})

afterAll(() => {
  process.env.RWJS_CWD = original_RWJS_CWD
})

// Set up and teardown the fastify instance for each test.
let fastify

beforeAll(async () => {
  fastify = createFastifyInstance()

  await fastify.register(redwoodFastifyAPI, {
    port: 8911,
    apiRootPath: '/',
  })

  await fastify.ready()
})

afterAll(async () => {
  await fastify.close()
})

describe('redwoodFastifyApi', () => {
  it('configures the `@fastify/url-data` and `fastify-raw-body` plugins', async () => {
    const plugins = fastify.printPlugins()

    expect(plugins.includes('@fastify/url-data')).toEqual(true)
    expect(plugins.includes('fastify-raw-body')).toEqual(true)
  })

  it('configures two additional content type parsers, `application/x-www-form-urlencoded` and `multipart/form-data`', async () => {
    expect(
      fastify.hasContentTypeParser('application/x-www-form-urlencoded')
    ).toEqual(true)
    expect(fastify.hasContentTypeParser('multipart/form-data')).toEqual(true)
  })

  it('can be configured by the user', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/rest/v1/users/get/1',
    })

    expect(res.body).toEqual(JSON.stringify({ id: 1 }))
  })

  // We use `fastify.all` to register functions, which means they're invoked for all HTTP verbs.
  // Only testing GET and POST here at the moment.
  //
  // We can use `printRoutes` with a method for debugging, but not without one.
  // See https://fastify.dev/docs/latest/Reference/Server#printroutes
  it('builds a tree of routes for GET and POST', async () => {
    expect(fastify.printRoutes({ method: 'GET' })).toMatchInlineSnapshot(`
      "└── /
          ├── rest/v1/users/get/
          │   └── :userId (GET)
          └── :routeName (GET)
              └── /
                  └── * (GET)
      "
    `)

    expect(fastify.printRoutes({ method: 'POST' })).toMatchInlineSnapshot(`
      "└── /
          └── :routeName (POST)
              └── /
                  └── * (POST)
      "
    `)
  })

  describe('serves functions', () => {
    it('serves hello.js', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: '/hello',
      })

      expect(res.statusCode).toEqual(200)
      expect(res.json()).toEqual({ data: 'hello function' })
    })

    it('it serves graphql.js', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/graphql?query={redwood{version}}',
      })

      expect(res.statusCode).toEqual(200)
      expect(res.json()).toEqual({ data: { version: 42 } })
    })

    it('serves health.js', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: '/health',
      })

      expect(res.statusCode).toEqual(200)
    })

    it('serves a nested function, nested.js', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: '/nested/nested',
      })

      expect(res.statusCode).toEqual(200)
      expect(res.json()).toEqual({ data: 'nested function' })
    })

    it("doesn't serve deeply-nested functions", async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: '/deeplyNested/nestedDir/deeplyNested',
      })

      expect(res.statusCode).toEqual(404)
      expect(res.body).toEqual(
        'Function &quot;deeplyNested&quot; was not found.'
      )
    })
  })
})
