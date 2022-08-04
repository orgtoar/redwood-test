import { RequestHandler, GraphQLContext, GraphQLRequest, ResponseTransformer, MockedResponse } from 'msw';
import type { StartOptions as StartMSWWorkerOptions } from 'msw/lib/types/setupWorker/glossary';
import type { SharedOptions as SharedMSWOptions } from 'msw/lib/types/sharedOptions';
/**
 * Plugs fetch for the correct target in order to capture requests.
 *
 * Request handlers can be registered lazily (via `mockGraphQL<Query|Mutation>`),
 * the queue will be drained and used.
 */
declare type StartOptions<Target> = Target extends 'browsers' ? StartMSWWorkerOptions : SharedMSWOptions;
export declare const startMSW: <Target extends "node" | "browsers">(target: Target, options?: StartOptions<Target> | undefined) => Promise<any>;
export declare const setupRequestHandlers: () => void;
export declare const registerHandler: (handler: RequestHandler) => void;
export declare type DataFunction<Query extends Record<string, unknown> = Record<string, unknown>, QueryVariables = Record<string, any>> = (variables: QueryVariables, { req, ctx, }: {
    req: GraphQLRequest<any>;
    ctx: GraphQLContext<Record<string, any>>;
}) => Query | void;
declare type ResponseFunction<BodyType = any> = (...transformers: ResponseTransformer<BodyType>[]) => MockedResponse<BodyType>;
declare type ResponseEnhancers = {
    once: ResponseFunction<any>;
    networkError: (message: string) => void;
};
declare type ResponseEnhancer = keyof ResponseEnhancers;
export declare const mockGraphQLQuery: <Query extends Record<string, unknown> = Record<string, unknown>, QueryVariables = Record<string, any>>(operation: string, data: Query | DataFunction<Query, QueryVariables>, responseEnhancer?: ResponseEnhancer) => Record<string, any> | DataFunction<Record<string, unknown>, Record<string, any>>;
export declare const mockGraphQLMutation: <Query extends Record<string, unknown> = Record<string, unknown>, QueryVariables = Record<string, any>>(operation: string, data: Query | DataFunction<Query, QueryVariables>, responseEnhancer?: ResponseEnhancer) => Record<string, any> | DataFunction<Record<string, unknown>, Record<string, any>>;
export declare const mockedUserMeta: {
    currentUser: Record<string, unknown> | null;
};
export declare const mockCurrentUser: (user: Record<string, unknown> | null) => void;
export {};
//# sourceMappingURL=mockRequests.d.ts.map