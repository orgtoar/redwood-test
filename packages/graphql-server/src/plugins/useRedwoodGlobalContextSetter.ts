import { Plugin } from 'graphql-yoga'

import { setContext } from '../index'
import { RedwoodGraphQLContext } from '../types'

/**
 * This Envelop plugin waits until the GraphQL context is done building and sets the
 * Redwood global context which can be imported with:
 * // import { context } from '@redwoodjs/graphql-server'
 * @returns
 */
export const useRedwoodGlobalContextSetter =
  (): Plugin<RedwoodGraphQLContext> => ({
    onContextBuilding() {
      return ({ context: redwoodGraphqlContext }) => {
        setContext(redwoodGraphqlContext)
      }
    },
  })

// test change
