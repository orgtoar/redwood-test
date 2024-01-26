import type { ComponentProps, JSXElementConstructor } from 'react'

import type { OperationVariables } from '@apollo/client'
import type { DocumentNode } from 'graphql'
import type { A, L, O, U } from 'ts-toolbelt'

import { fragmentRegistry } from '../apollo'
import { getOperationName } from '../graphql'

import { useCellCacheContext } from './CellCacheContext'
/**
 * This is part of how we let users swap out their GraphQL client while staying compatible with Cells.
 */
import { useQuery } from './GraphQLHooksProvider'

/**
 *
 * If the Cell has a `beforeQuery` function, then the variables are not required,
 * but instead the arguments of the `beforeQuery` function are required.
 *
 * If the Cell does not have a `beforeQuery` function, then the variables are required.
 *
 * Note that a query that doesn't take any variables is defined as {[x: string]: never}
 * The ternary at the end makes sure we don't include it, otherwise it won't allow merging any
 * other custom props from the Success component.
 *
 */
type CellPropsVariables<Cell, GQLVariables> = Cell extends {
  beforeQuery: (...args: any[]) => any
}
  ? Parameters<Cell['beforeQuery']>[0] extends unknown
    ? Record<string, unknown>
    : Parameters<Cell['beforeQuery']>[0]
  : GQLVariables extends Record<string, never>
  ? unknown
  : GQLVariables

/**
 * Cell component props which is the combination of query variables and Success props.
 */
export type CellProps<
  CellSuccess extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  GQLResult,
  CellType,
  GQLVariables
> = A.Compute<
  Omit<
    ComponentProps<CellSuccess>,
    | keyof CellPropsVariables<CellType, GQLVariables>
    | keyof GQLResult
    | 'updating'
    | 'queryResult'
  > &
    CellPropsVariables<CellType, GQLVariables>
>

export type CellLoadingProps<TVariables extends OperationVariables = any> = {
  queryResult?: Partial<
    Omit<QueryOperationResult<any, TVariables>, 'loading' | 'error' | 'data'>
  >
}

export type CellFailureProps<TVariables extends OperationVariables = any> = {
  queryResult?: Partial<
    Omit<QueryOperationResult<any, TVariables>, 'loading' | 'error' | 'data'>
  >
  error?: QueryOperationResult['error'] | Error // for tests and storybook
  /**
   * @see {@link https://www.apollographql.com/docs/apollo-server/data/errors/#error-codes}
   */
  errorCode?: string
  updating?: boolean
}

// aka guarantee that all properties in T exist
type Guaranteed<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

type KeyCount<T extends object> = L.Length<U.ListOf<O.SelectKeys<T, any>>>

// This is used for the Success component in Cells. If there is only one thing
// being returned by the Cell we can guarantee that the data is not null or
// undefined. If there are are multiple roots we can't guarantee that because
// the default isEmpty check only makes sure there is _some_ data – not that
// all properties have data
// NOTE: This only holds true for Cells as Redwood generates them. If the user
// removes the <Empty> component, or provides their own isEmpty implementation
// there's no way for us to know what the data will look like.
type ConditionallyGuaranteed<T extends object> = KeyCount<T> extends 1
  ? Guaranteed<T>
  : T

/**
 * @params TData = Type of data based on your graphql query. This can be imported from 'types/graphql'
 * @example
 * import type { FindPosts } from 'types/graphql'
 *
 * const { post }: CellSuccessData<FindPosts> = props
 */
export type CellSuccessData<TData = any> = ConditionallyGuaranteed<
  Omit<TData, '__typename'>
>

/**
 * @MARK not sure about this partial, but we need to do this for tests and storybook.
 *
 * `updating` is just `loading` renamed; since Cells default to stale-while-refetch,
 * this prop lets users render something like a spinner to show that a request is in-flight.
 */
export type CellSuccessProps<
  TData = any,
  TVariables extends OperationVariables = any
> = {
  queryResult?: Partial<
    Omit<QueryOperationResult<TData, TVariables>, 'loading' | 'error' | 'data'>
  >
  updating?: boolean
} & A.Compute<CellSuccessData<TData>> // pre-computing makes the types more readable on hover

/**
 * A coarse type for the `data` prop returned by `useQuery`.
 *
 * ```js
 * {
 *   data: {
 *     post: { ... }
 *   }
 * }
 * ```
 */
export type DataObject = { [key: string]: unknown }

/**
 * The main interface.
 */
export interface CreateCellProps<CellProps, CellVariables> {
  /**
   * The GraphQL syntax tree to execute or function to call that returns it.
   * If `QUERY` is a function, it's called with the result of `beforeQuery`.
   */
  QUERY: DocumentNode | ((variables: Record<string, unknown>) => DocumentNode)
  /**
   * Parse `props` into query variables. Most of the time `props` are appropriate variables as is.
   */
  beforeQuery?:
    | ((props: CellProps) => { variables: CellVariables })
    | (() => { variables: CellVariables })
  /**
   * Sanitize the data returned from the query.
   */
  afterQuery?: (data: DataObject) => DataObject
  /**
   * How to decide if the result of a query should render the `Empty` component.
   * The default implementation checks that the first field isn't `null` or an empty array.
   *
   * @example
   *
   * In the example below, only `users` is checked:
   *
   * ```js
   * export const QUERY = gql`
   *   users {
   *     name
   *   }
   *   posts {
   *     title
   *   }
   * `
   * ```
   */
  isEmpty?: (
    response: DataObject,
    options: {
      isDataEmpty: (data: DataObject) => boolean
    }
  ) => boolean
  /**
   * If the query's in flight and there's no stale data, render this.
   */
  Loading?: React.FC<CellLoadingProps & Partial<CellProps>>
  /**
   * If something went wrong, render this.
   */
  Failure?: React.FC<CellFailureProps & Partial<CellProps>>
  /**
   * If no data was returned, render this.
   */
  Empty?: React.FC<CellSuccessProps & Partial<CellProps>>
  /**
   * If data was returned, render this.
   */
  Success: React.FC<CellSuccessProps & Partial<CellProps>>
  /**
   * What to call the Cell. Defaults to the filename.
   */
  displayName?: string
}

/**
 * The default `isEmpty` implementation. Checks if any of the field is `null` or an empty array.
 *
 * Consider the following queries. The former returns an object, the latter a list:
 *
 * ```js
 * export const QUERY = gql`
 *   post {
 *     title
 *   }
 * `
 *
 * export const QUERY = gql`
 *   posts {
 *     title
 *   }
 * `
 * ```
 *
 * If either are "empty", they return:
 *
 * ```js
 * {
 *   data: {
 *     post: null
 *   }
 * }
 *
 * {
 *   data: {
 *     posts: []
 *   }
 * }
 * ```
 *
 * Note that the latter can return `null` as well depending on the SDL (`posts: [Post!]`).
 * ```
 */
function isFieldEmptyArray(field: unknown) {
  return Array.isArray(field) && field.length === 0
}

function isDataEmpty(data: DataObject) {
  return Object.values(data).every((fieldValue) => {
    return fieldValue === null || isFieldEmptyArray(fieldValue)
  })
}

/**
 * Creates a Cell out of a GraphQL query and components that track to its lifecycle.
 */
export function createCell<
  CellProps extends Record<string, unknown>,
  CellVariables extends Record<string, unknown>
>({
  QUERY,
  beforeQuery = (props) => ({
    // By default, we assume that the props are the gql-variables.
    variables: props as unknown as CellVariables,
    /**
     * We're duplicating these props here due to a suspected bug in Apollo Client v3.5.4
     * (it doesn't seem to be respecting `defaultOptions` in `RedwoodApolloProvider`.)
     *
     * @see {@link https://github.com/apollographql/apollo-client/issues/9105}
     */
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  }),
  afterQuery = (data) => ({ ...data }),
  isEmpty = isDataEmpty,
  Loading = () => <>Loading...</>,
  Failure,
  Empty,
  Success,
  displayName = 'Cell',
}: CreateCellProps<CellProps, CellVariables>): React.FC<CellProps> {
  function NamedCell(props: React.PropsWithChildren<CellProps>) {
    /**
     * Right now, Cells don't render `children`.
     */
    const { children: _, ...variables } = props
    const options = beforeQuery(variables as CellProps)
    const query = typeof QUERY === 'function' ? QUERY(options) : QUERY

    // queryRest includes `variables: { ... }`, with any variables returned
    // from beforeQuery
    let {
      // eslint-disable-next-line prefer-const
      error,
      loading,
      data,
      ...queryResult
    } = useQuery(query, options)

    if (globalThis.__REDWOOD__PRERENDERING) {
      // __REDWOOD__PRERENDERING will always either be set, or not set. So
      // rules-of-hooks are still respected, even though we wrap this in an if
      // statement
      /* eslint-disable-next-line react-hooks/rules-of-hooks */
      const { queryCache } = useCellCacheContext()
      const operationName = getOperationName(query)
      const transformedQuery = fragmentRegistry.transform(query)

      let cacheKey

      if (operationName) {
        cacheKey = operationName + '_' + JSON.stringify(variables)
      } else {
        const cellName = displayName === 'Cell' ? 'the cell' : displayName

        throw new Error(
          `The gql query in ${cellName} is missing an operation name. ` +
            'Something like FindBlogPostQuery in ' +
            '`query FindBlogPostQuery($id: Int!)`'
        )
      }

      const queryInfo = queryCache[cacheKey]

      // This is true when the graphql handler couldn't be loaded
      // So we fallback to the loading state
      if (queryInfo?.renderLoading) {
        loading = true
      } else {
        if (queryInfo?.hasProcessed) {
          loading = false
          data = queryInfo.data

          // All of the gql client's props aren't available when pre-rendering,
          // so using `any` here
          queryResult = { variables } as any
        } else {
          queryCache[cacheKey] ||
            (queryCache[cacheKey] = {
              query: transformedQuery,
              variables: options.variables,
              hasProcessed: false,
            })
        }
      }
    }

    if (error) {
      if (Failure) {
        // errorCode is not part of the type returned by useQuery
        // but it is returned as part of the queryResult
        type QueryResultWithErrorCode = typeof queryResult & {
          errorCode: string
        }

        return (
          <Failure
            error={error}
            errorCode={
              // Use the ad-hoc QueryResultWithErrorCode type to access the errorCode
              (queryResult as QueryResultWithErrorCode).errorCode ??
              (error.graphQLErrors?.[0]?.extensions?.['code'] as string)
            }
            {...props}
            updating={loading}
            queryResult={queryResult}
          />
        )
      } else {
        throw error
      }
    } else if (data) {
      const afterQueryData = afterQuery(data)

      if (isEmpty(data, { isDataEmpty }) && Empty) {
        return (
          <Empty
            {...props}
            {...afterQueryData}
            updating={loading}
            queryResult={queryResult}
          />
        )
      } else {
        return (
          <Success
            {...props}
            {...afterQueryData}
            updating={loading}
            queryResult={queryResult}
          />
        )
      }
    } else if (loading) {
      return <Loading {...props} queryResult={queryResult} />
    } else {
      /**
       * There really shouldn't be an `else` here, but like any piece of software, GraphQL clients have bugs.
       * If there's no `error` and there's no `data` and we're not `loading`, something's wrong. Most likely with the cache.
       *
       * @see {@link https://github.com/redwoodjs/redwood/issues/2473#issuecomment-971864604}
       */
      console.warn(
        `If you're using Apollo Client, check for its debug logs here in the console, which may help explain the error.`
      )
      throw new Error(
        'Cannot render Cell: reached an unexpected state where the query succeeded but `data` is `null`. If this happened in Storybook, your query could be missing fields; otherwise this is most likely a GraphQL caching bug. Note that adding an `id` field to all the fields on your query may fix the issue.'
      )
    }
  }

  NamedCell.displayName = displayName

  return (props: CellProps) => {
    return <NamedCell {...props} />
  }
}
