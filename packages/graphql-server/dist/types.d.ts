import { GraphQLObjectType, GraphQLInterfaceType, DocumentNode } from 'graphql';
export declare type Resolver = (...args: unknown[]) => unknown;
export declare type Services = {
    [funcName: string]: Resolver;
};
declare type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export declare type ResolverArgs<TRoot> = {
    root: ThenArg<TRoot>;
};
export declare type SdlGlobImports = {
    [key: string]: {
        schema: DocumentNode;
        resolvers: Record<string, unknown>;
    };
};
export declare type ServicesGlobImports = {
    [serviceName: string]: Services;
};
export interface MakeServicesInterface {
    services: ServicesGlobImports;
}
export declare type MakeServices = (args: MakeServicesInterface) => ServicesGlobImports;
export declare type GraphQLTypeWithFields = GraphQLObjectType | GraphQLInterfaceType;
export {};
//# sourceMappingURL=types.d.ts.map