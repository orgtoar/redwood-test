import type { OperationVariables } from '@apollo/client'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { DocumentNode } from 'graphql'

export type { TypedDocumentNode }

type DefaultUseQueryType = <
  TData = any,
  TVariables extends OperationVariables = GraphQLOperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: GraphQLQueryHookOptions<TData, TVariables>
) => QueryOperationResult<TData, TVariables>

type DefaultUseMutationType = <
  TData = any,
  TVariables = GraphQLOperationVariables
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: GraphQLMutationHookOptions<TData, TVariables>
) => MutationOperationResult<TData, TVariables>

type DefaultUseSubscriptionType = <
  TData = any,
  TVariables extends OperationVariables = GraphQLOperationVariables
>(
  subscription: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: GraphQLSubscriptionHookOptions<TData, TVariables>
) => SubscriptionOperationResult<TData, TVariables>
export interface GraphQLHooks<
  TuseQuery = DefaultUseQueryType,
  TuseMutation = DefaultUseMutationType,
  TuseSubscription = DefaultUseSubscriptionType
> {
  useQuery: TuseQuery
  useMutation: TuseMutation
  useSubscription: TuseSubscription
}

export const GraphQLHooksContext = React.createContext<GraphQLHooks>({
  useQuery: () => {
    throw new Error(
      'You must register a useQuery hook via the `GraphQLHooksProvider`'
    )
  },
  useMutation: () => {
    throw new Error(
      'You must register a useMutation hook via the `GraphQLHooksProvider`'
    )
  },
  useSubscription: () => {
    throw new Error(
      'You must register a useSubscription hook via the `GraphQLHooksProvider`'
    )
  },
})

interface GraphQlHooksProviderProps<
  TuseQuery = DefaultUseQueryType,
  TuseMutation = DefaultUseMutationType,
  TuseSubscription = DefaultUseSubscriptionType
> extends GraphQLHooks<TuseQuery, TuseMutation, TuseSubscription> {
  children: React.ReactNode
}

/**
 * GraphQLHooksProvider stores standard `useQuery` and `useMutation` hooks for Redwood
 * that can be mapped to your GraphQL library of choice's own `useQuery`
 * and `useMutation` implementation.
 *
 * @todo Let the user pass in the additional type for options.
 */
export const GraphQLHooksProvider = <
  TuseQuery extends DefaultUseQueryType,
  TuseMutation extends DefaultUseMutationType
>({
  useQuery,
  useMutation,
  useSubscription,
  children,
}: GraphQlHooksProviderProps<TuseQuery, TuseMutation>) => {
  return (
    <GraphQLHooksContext.Provider
      value={{
        useQuery,
        useMutation,
        useSubscription,
      }}
    >
      {children}
    </GraphQLHooksContext.Provider>
  )
}

export function useQuery<
  TData = any,
  TVariables extends OperationVariables = GraphQLOperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: GraphQLQueryHookOptions<TData, TVariables>
): QueryOperationResult<TData, TVariables> {
  return React.useContext(GraphQLHooksContext).useQuery<TData, TVariables>(
    query,
    options
  )
}

export function useMutation<
  TData = any,
  TVariables = GraphQLOperationVariables
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: GraphQLMutationHookOptions<TData, TVariables>
): MutationOperationResult<TData, TVariables> {
  return React.useContext(GraphQLHooksContext).useMutation<TData, TVariables>(
    mutation,
    options
  )
}

export function useSubscription<
  TData = any,
  TVariables extends OperationVariables = GraphQLOperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: GraphQLSubscriptionHookOptions<TData, TVariables>
): SubscriptionOperationResult<TData, TVariables> {
  return React.useContext(GraphQLHooksContext).useSubscription<
    TData,
    TVariables
  >(query, options)
}
