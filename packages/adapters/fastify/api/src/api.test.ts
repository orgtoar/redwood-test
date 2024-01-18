import { expect, it, describe } from 'vitest'

import { resolveOptions } from './api'

describe('resolveOptions', () => {
  it("defaults apiRootPath to '/'", () => {
    expect(resolveOptions({})).toEqual({ redwood: { apiRootPath: '/' } })
  })

  describe('formats apiRootPath', () => {
    it('prepends a slash', () => {
      expect(resolveOptions({ redwood: { apiRootPath: 'api/' } })).toEqual({
        redwood: { apiRootPath: '/api/' },
      })
    })

    it('appends a slash', () => {
      expect(resolveOptions({ redwood: { apiRootPath: '/api' } })).toEqual({
        redwood: { apiRootPath: '/api/' },
      })
    })

    it('prepends and appends slashes', () => {
      expect(resolveOptions({ redwood: { apiRootPath: 'api' } })).toEqual({
        redwood: { apiRootPath: '/api/' },
      })
    })
  })
})
