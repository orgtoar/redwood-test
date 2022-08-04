import type { QueryHookOptions, QueryResult, MutationHookOptions, MutationTuple, OperationVariables } from '@apollo/client';
declare global {
    interface QueryOperationResult<TData = any, TVariables = OperationVariables> extends QueryResult<TData, TVariables> {
    }
    interface MutationOperationResult<TData, TVariables> extends MutationTuple<TData, TVariables> {
    }
    interface GraphQLQueryHookOptions<TData, TVariables> extends QueryHookOptions<TData, TVariables> {
    }
    interface GraphQLMutationHookOptions<TData, TVariables> extends MutationHookOptions<TData, TVariables> {
    }
}
export {};
//# sourceMappingURL=typeOverride.d.ts.map