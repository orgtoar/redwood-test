import React from 'react';
import { DocumentNode } from 'graphql';
export interface QueryInfo {
    query: DocumentNode;
    variables?: Record<string, unknown>;
    hasFetched: boolean;
    data?: unknown;
}
export interface CellCacheState {
    queryCache: Record<string, QueryInfo | undefined>;
}
interface Props {
    queryCache: Record<string, QueryInfo | undefined>;
    children?: React.ReactNode;
}
export declare const CellCacheContextProvider: ({ queryCache, children }: Props) => JSX.Element;
export declare function useCellCacheContext(): CellCacheState;
export {};
//# sourceMappingURL=CellCacheContext.d.ts.map