import { DocumentNode } from 'graphql';
export declare function executeQuery(gqlHandler: (args: any) => Promise<any>, query: DocumentNode, variables?: Record<string, unknown>): Promise<any>;
export declare function getGqlHandler(): Promise<(operation: Record<string, unknown>) => Promise<any>>;
//# sourceMappingURL=graphql.d.ts.map