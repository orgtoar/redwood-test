/// <reference types="react" />
import type { DocumentNode } from 'graphql';
declare type DefaultUseQueryType = <TData = any, TVariables = GraphQLOperationVariables>(query: DocumentNode, options?: GraphQLQueryHookOptions<TData, TVariables>) => QueryOperationResult<TData, TVariables>;
declare type DefaultUseMutationType = <TData = any, TVariables = GraphQLOperationVariables>(mutation: DocumentNode, options?: GraphQLMutationHookOptions<TData, TVariables>) => MutationOperationResult<TData, TVariables>;
export interface GraphQLHooks<TuseQuery = DefaultUseQueryType, TuseMutation = DefaultUseMutationType> {
    useQuery: TuseQuery;
    useMutation: TuseMutation;
}
export declare const GraphQLHooksContext: React.Context<GraphQLHooks<DefaultUseQueryType, DefaultUseMutationType>>;
interface GraphQlHooksProviderProps<TuseQuery = DefaultUseQueryType, TuseMutation = DefaultUseMutationType> extends GraphQLHooks<TuseQuery, TuseMutation> {
    children: React.ReactNode;
}
/**
 * GraphQLHooksProvider stores standard `useQuery` and `useMutation` hooks for Redwood
 * that can be mapped to your GraphQL library of choice's own `useQuery`
 * and `useMutation` implementation.
 *
 * @todo Let the user pass in the additional type for options.
 */
export declare const GraphQLHooksProvider: <TuseQuery extends DefaultUseQueryType, TuseMutation extends DefaultUseMutationType>({ useQuery, useMutation, children, }: GraphQlHooksProviderProps<TuseQuery, TuseMutation>) => JSX.Element;
export declare function useQuery<TData = any, TVariables = GraphQLOperationVariables>(query: DocumentNode, options?: GraphQLQueryHookOptions<TData, TVariables>): QueryOperationResult<TData, TVariables>;
export declare function useMutation<TData = any, TVariables = GraphQLOperationVariables>(mutation: DocumentNode, options?: GraphQLMutationHookOptions<TData, TVariables>): MutationOperationResult<TData, TVariables>;
export {};
//# sourceMappingURL=GraphQLHooksProvider.d.ts.map