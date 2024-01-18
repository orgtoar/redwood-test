import { expect, it, describe, vi } from 'vitest'

import { resolveOptions } from './web'

vi.mock('@redwoodjs/project-config', async () => {
  return {
    getConfig: () => ({
      web: {
        apiUrl: './redwood/functions',
      },
    }),
  }
})

describe('resolveOptions', () => {
  // The possible values we will support for apiUrl and apiUpstreamUrl are:
  // apiUrl: (aka prefix)
  //  - undefined
  //  - empty
  //  - relative
  //  - fully-qualified
  // apiUpstreamUrl: (aka upstream)
  //  - undefined
  //  - empty
  //  - relative
  //  - fully-qualified

  describe('undefined apiUrl', () => {
    it('undefined apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: undefined,
            apiUpstreamUrl: undefined,
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you don't provide \`apiUpstreamUrl\`, \`apiUrl\` needs to be a fully-qualified URL. \`apiUrl\` is './redwood/functions']`
      )
    })

    it('empty apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: undefined,
            apiUpstreamUrl: '',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you don't provide \`apiUpstreamUrl\`, \`apiUrl\` needs to be a fully-qualified URL. \`apiUrl\` is './redwood/functions']`
      )
    })

    it('relative apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: undefined,
            apiUpstreamUrl: '/api',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you provide \`apiUpstreamUrl\`, it has to be a fully-qualified URL. \`apiUpstreamUrl\` is '/api']`
      )
    })

    it('fully-qualified apiUpstreamUrl', () => {
      expect(
        resolveOptions({
          redwood: {
            apiUrl: undefined,
            apiUpstreamUrl: 'http://api.foo.com',
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "redwood": {
            "apiUpstreamUrl": "http://api.foo.com",
            "apiUrl": "./redwood/functions",
          },
        }
      `)
    })
  })

  describe('empty apiUrl', () => {
    it('undefined apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '',
            apiUpstreamUrl: undefined,
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you don't provide \`apiUpstreamUrl\`, \`apiUrl\` needs to be a fully-qualified URL. \`apiUrl\` is '']`
      )
    })

    it('empty apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '',
            apiUpstreamUrl: '',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you don't provide \`apiUpstreamUrl\`, \`apiUrl\` needs to be a fully-qualified URL. \`apiUrl\` is '']`
      )
    })

    it('relative apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '',
            apiUpstreamUrl: '/api',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you provide \`apiUpstreamUrl\`, it has to be a fully-qualified URL. \`apiUpstreamUrl\` is '/api']`
      )
    })

    it('fully-qualified apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '',
            apiUpstreamUrl: 'http://api.foo.com',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you provide \`apiUpstreamUrl\`, \`apiUrl\` has to be a relative URL. \`apiUrl\` is '']`
      )
    })
  })

  describe('relative apiUrl', () => {
    it('undefined apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '/api',
            apiUpstreamUrl: undefined,
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you don't provide \`apiUpstreamUrl\`, \`apiUrl\` needs to be a fully-qualified URL. \`apiUrl\` is '/api']`
      )
    })

    it('empty apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '/api',
            apiUpstreamUrl: '',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you don't provide \`apiUpstreamUrl\`, \`apiUrl\` needs to be a fully-qualified URL. \`apiUrl\` is '/api']`
      )
    })

    it('relative apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: '/api',
            apiUpstreamUrl: '/api',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you provide \`apiUpstreamUrl\`, it has to be a fully-qualified URL. \`apiUpstreamUrl\` is '/api']`
      )
    })

    it('fully-qualified apiUpstreamUrl', () => {
      expect(
        resolveOptions({
          redwood: {
            apiUrl: '/api',
            apiUpstreamUrl: 'http://api.foo.com',
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "redwood": {
            "apiUpstreamUrl": "http://api.foo.com",
            "apiUrl": "/api",
          },
        }
      `)
    })
  })

  describe('fully-qualified apiUrl', () => {
    it('undefined apiUpstreamUrl', () => {
      expect(
        resolveOptions({
          redwood: {
            apiUrl: 'http://api.foo.com',
            apiUpstreamUrl: undefined,
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "redwood": {
            "apiUpstreamUrl": undefined,
            "apiUrl": "http://api.foo.com",
          },
        }
      `)
    })

    it('empty apiUpstreamUrl', () => {
      expect(
        resolveOptions({
          redwood: {
            apiUrl: 'http://api.foo.com',
            apiUpstreamUrl: '',
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "redwood": {
            "apiUpstreamUrl": "",
            "apiUrl": "http://api.foo.com",
          },
        }
      `)
    })

    it('relative apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: 'http://api.foo.com',
            apiUpstreamUrl: '/api',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you provide \`apiUpstreamUrl\`, it has to be a fully-qualified URL. \`apiUpstreamUrl\` is '/api']`
      )
    })

    it('fully-qualified apiUpstreamUrl', () => {
      expect(() =>
        resolveOptions({
          redwood: {
            apiUrl: 'http://api.foo.com',
            apiUpstreamUrl: 'http://api.foo.com',
          },
        })
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: If you provide \`apiUpstreamUrl\`, \`apiUrl\` cannot be a fully-qualified URL. \`apiUrl\` is 'http://api.foo.com']`
      )
    })
  })

  describe('apiHost', () => {
    it('apiHost is a deprecated alias of apiUpstreamUrl', () => {
      expect(
        resolveOptions({
          redwood: {
            apiHost: 'http://api.foo.com',
          },
        })
      ).toMatchInlineSnapshot(`
        {
          "redwood": {
            "apiUpstreamUrl": "http://api.foo.com",
            "apiUrl": "./redwood/functions",
          },
        }
      `)
    })
  })
})
