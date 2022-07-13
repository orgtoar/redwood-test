import type { ComponentProps, JSXElementConstructor } from 'react';
import type { DocumentNode } from 'graphql';
import type { A } from 'ts-toolbelt';
/**
 * Cell component props which is the combination of query variables and Success props.
 */
export declare type CellProps<CellSuccess extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>, GQLResult, GQLVariables> = A.Compute<Omit<ComponentProps<CellSuccess>, keyof QueryOperationResult | keyof GQLResult | 'updating'> & (GQLVariables extends {
    [key: string]: never;
} ? unknown : GQLVariables)>;
export declare type CellLoadingProps<TVariables = any> = Partial<Omit<QueryOperationResult<any, TVariables>, 'loading' | 'error' | 'data'>>;
export declare type CellFailureProps<TVariables = any> = Partial<Omit<QueryOperationResult<any, TVariables>, 'loading' | 'error' | 'data'> & {
    error: QueryOperationResult['error'] | Error;
    /**
     * @see {@link https://www.apollographql.com/docs/apollo-server/data/errors/#error-codes}
     */
    errorCode: string;
    updating: boolean;
}>;
/**
 * @MARK not sure about this partial, but we need to do this for tests and storybook.
 *
 * `updating` is just `loading` renamed; since Cells default to stale-while-refetch,
 * this prop lets users render something like a spinner to show that a request is in-flight.
 */
export declare type CellSuccessProps<TData = any, TVariables = any> = Partial<Omit<QueryOperationResult<TData, TVariables>, 'loading' | 'error' | 'data'> & {
    updating: boolean;
}> & A.Compute<TData>;
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
export interface CreateCellProps<CellProps> {
    /**
     * The GraphQL syntax tree to execute or function to call that returns it.
     * If `QUERY` is a function, it's called with the result of `beforeQuery`.
     */
    QUERY: DocumentNode | ((variables: Record<string, unknown>) => DocumentNode);
    /**
     * Parse `props` into query variables. Most of the time `props` are appropriate variables as is.
     */
    beforeQuery?: <TProps>(props: TProps) => {
        variables: TProps;
    };
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
export declare function createCell<CellProps = any>({ QUERY, beforeQuery, afterQuery, isEmpty, Loading, Failure, Empty, Success, displayName, }: CreateCellProps<CellProps>): React.FC<CellProps>;
//# sourceMappingURL=createCell.d.ts.map