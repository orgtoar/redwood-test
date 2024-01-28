import type { FastifyInstance, HookHandlerDoneFunction } from 'fastify';
import type { GraphQLYogaOptions } from '@redwoodjs/graphql-server';
export interface RedwoodFastifyGraphQLOptions {
    redwood: {
        apiRootPath: string;
        graphql?: GraphQLYogaOptions;
    };
}
/**
 * Redwood GraphQL Server Fastify plugin based on GraphQL Yoga
 *
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {GraphQLYogaOptions} options GraphQLYogaOptions options used to configure the GraphQL Yoga Server
 */
export declare function redwoodFastifyGraphQLServer(fastify: FastifyInstance, options: RedwoodFastifyGraphQLOptions, done: HookHandlerDoneFunction): Promise<void>;
//# sourceMappingURL=graphql.d.ts.map