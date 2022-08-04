import type { ComponentProps, JSXElementConstructor } from 'react';
import type { DocumentNode } from 'graphql';
import type { A } from 'ts-toolbelt';
declare type CustomCellProps<Cell, GQLVariables> = Cell extends {
    beforeQuery: (...args: unknown[]) => unknown;
} ? Parameters<Cell['beforeQuery']> extends [unknown, ...any] ? Parameters<Cell['beforeQuery']>[0] : Record<string, never> : GQLVariables extends {
    [key: string]: never;
} ? unknown : GQLVariables;
/**
 * Cell component props which is the combination of query variables and Success props.
 */
export declare type CellProps<CellSuccess extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>, GQLResult, CellType, GQLVariables> = A.Compute<Omit<ComponentProps<CellSuccess>, keyof QueryOperationResult | keyof GQLResult | 'updating'> & CustomCellProps<CellType, GQLVariables>>;
export declare type CellLoadingProps<TVariables = any> = Partial<Omit<QueryOperationResult<any, TVariables>, 'loading' | 'error' | 'data'>>;
export declare type CellFailureProps<TVariables = any> = Partial<Omit<QueryOperationResult<any, TVariables>, 'loading' | 'error' | 'data'> & {
    error: QueryOperationResult['error'] | Error;
    /**
     * @see {@link https://www.apollographql.com/docs/apollo-server/data/errors/#error-codes}
     */
    errorCode: string;
    updating: boolean;
}>;
declare type Guaranteed<T> = {
    [K in keyof T]-?: NonNullable<T[K]>;
};
/**
 * Use this type, if you are forwarding on the data from your Cell's Success component
 * Because Cells automatically checks for "empty", or "errors" - if you receive the data type in your
 * Success component, it means the data is guaranteed (and non-optional)
 *
 * @params TData = Type of data based on your graphql query. This can be imported from 'types/graphql'
 * @example
 * import type {FindPosts} from 'types/graphql'
 *
 * const { post } = CellSuccessData<FindPosts>
 *
 * post.id // post is non optional, so no need to do post?.id
 *
 */
export declare type CellSuccessData<TData = any> = Omit<Guaranteed<TData>, '__typename'>;
/**
 * @MARK not sure about this partial, but we need to do this for tests and storybook.
 *
 * `updating` is just `loading` renamed; since Cells default to stale-while-refetch,
 * this prop lets users render something like a spinner to show that a request is in-flight.
 */
export declare type CellSuccessProps<TData = any, TVariables = any> = Partial<Omit<QueryOperationResult<TData, TVariables>, 'loading' | 'error' | 'data'> & {
    updating: boolean;
}> & A.Compute<CellSuccessData<TData>>;
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
export declare type DataObject = {
    [key: string]: unknown;
};
/**
 * The main interface.
 */
export interface CreateCellProps<CellProps, CellVariables> {
    /**
     * The GraphQL syntax tree to execute or function to call that returns it.
     * If `QUERY` is a function, it's called with the result of `beforeQuery`.
     */
    QUERY: DocumentNode | ((variables: Record<string, unknown>) => DocumentNode);
    /**
     * Parse `props` into query variables. Most of the time `props` are appropriate variables as is.
     */
    beforeQuery?: ((props: CellProps) => {
        variables: CellVariables;
    }) | (() => {
        variables: CellVariables;
    });
    /**
     * Sanitize the data returned from the query.
     */
    afterQuery?: (data: DataObject) => DataObject;
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
    isEmpty?: (response: DataObject, options: {
        isDataEmpty: (data: DataObject) => boolean;
    }) => boolean;
    /**
     * If the query's in flight and there's no stale data, render this.
     */
    Loading?: React.FC<CellLoadingProps & Partial<CellProps>>;
    /**
     * If something went wrong, render this.
     */
    Failure?: React.FC<CellFailureProps & Partial<CellProps>>;
    /**
     * If no data was returned, render this.
     */
    Empty?: React.FC<CellSuccessProps & Partial<CellProps>>;
    /**
     * If data was returned, render this.
     */
    Success: React.FC<CellSuccessProps & Partial<CellProps>>;
    /**
     * What to call the Cell. Defaults to the filename.
     */
    displayName?: string;
}
/**
 * Creates a Cell out of a GraphQL query and components that track to its lifecycle.
 */
export declare function createCell<CellProps extends Record<string, unknown>, CellVariables extends Record<string, unknown>>({ QUERY, beforeQuery, afterQuery, isEmpty, Loading, Failure, Empty, Success, displayName, }: CreateCellProps<CellProps, CellVariables>): React.FC<CellProps>;
export {};
//# sourceMappingURL=createCell.d.ts.map