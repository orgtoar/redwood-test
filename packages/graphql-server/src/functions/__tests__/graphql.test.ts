/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { envelop, Plugin } from 'graphql-yoga'

import { context, getAsyncStoreInstance } from '../../index'
import { useRedwoodGlobalContextSetter } from '../../plugins/useRedwoodGlobalContextSetter'
import { useRedwoodPopulateContext } from '../../plugins/useRedwoodPopulateContext'

const createContextHandler = (userContext?: Record<string, any>) => {
  const plugins: Plugin<any>[] = [useRedwoodGlobalContextSetter()]

  if (userContext) {
    plugins.push(useRedwoodPopulateContext(userContext))
  }

  const getEnveloped = envelop({ plugins })

  return ({ context }: Record<string, any>) =>
    getEnveloped(context).contextFactory()
}

describe('global context handlers', () => {
  beforeAll(() => {
    process.env.DISABLE_CONTEXT_ISOLATION = '1'
  })

  afterAll(() => {
    process.env.DISABLE_CONTEXT_ISOLATION = '0'
  })

  it('merges the graphql-server resolver and global context correctly', async () => {
    const handler = createContextHandler({ a: 1 })
    // @ts-ignore

    const inlineContext = await handler({ context: { b: 2 } })
    expect(inlineContext).toEqual({
      a: 1,
      b: 2,
    })

    expect(context).toEqual({
      a: 1,
      b: 2,
    })
  })

  it('deals with undefined contexts properly', async () => {
    const handler1 = createContextHandler()
    // @ts-ignore
    expect(await handler1({ context: { b: 2 } })).toEqual({
      b: 2,
    })
  })

  it('also accepts a function', async () => {
    const handler = createContextHandler(() => ({ c: 3 }))
    // @ts-ignore
    expect(await handler({ context: { d: 4 } })).toEqual({
      c: 3,
      d: 4,
    })
  })

  it('also accepts a promise', async () => {
    const handler = createContextHandler(async () => Promise.resolve({ c: 3 }))
    // @ts-ignore
    expect(await handler({ context: { d: 4 } })).toEqual({
      c: 3,
      d: 4,
    })
  })

  it('also accepts a promise that resolve dynamic value on each run', async () => {
    const handler = createContextHandler(async ({ context }) => {
      return Promise.resolve({ c: context.d * 5 })
    })
    // @ts-ignore
    expect(await handler({ context: { d: 4 } })).toEqual({
      c: 20,
      d: 4,
    })
    // now run same handler again to simulate second request
    // with different event and context
    // @ts-ignore
    expect(await handler({ context: { d: 5 } })).toEqual({
      c: 25,
      d: 5,
    })
  })
})

describe('per request context handlers', () => {
  it('merges the graphql-server resolver and global context correctly', async () => {
    const localAsyncStorage = getAsyncStoreInstance()

    localAsyncStorage.run(new Map(), async () => {
      const handler = createContextHandler({ a: 1 })
      // @ts-ignore
      const inlineContext = await handler({ context: { b: 2 } })
      expect(inlineContext).toEqual({
        a: 1,
        b: 2,
      })

      expect(context).toEqual({
        a: 1,
        b: 2,
      })
    })
  })

  it('maintains separate contexts for each request', (done) => {
    const localAsyncStorage = getAsyncStoreInstance()

    // request 1 and request 2...
    // request 1 is slow...
    // request 2 is fast!
    // they should have different contexts.

    let request2Complete = false
    localAsyncStorage.run(new Map(), async () => {
      const handler = createContextHandler({ request: 1 })
      // @ts-ignore
      await handler({ context: { favoriteFood: 'cheese' } })
      setTimeout(() => {
        expect(context).toMatchObject({ request: 1, favoriteFood: 'cheese' })
        // If this isn't true, then we might need to increase the timeouts
        expect(request2Complete).toBeTruthy()
        done()
      }, 1)
    })

    localAsyncStorage.run(new Map(), async () => {
      const handler = createContextHandler({ request: 2 })
      // @ts-ignore
      await handler({ context: { favoriteFood: 'cake' } })
      request2Complete = true
      expect(context).toMatchObject({ request: 2, favoriteFood: 'cake' })
    })
  })
})
