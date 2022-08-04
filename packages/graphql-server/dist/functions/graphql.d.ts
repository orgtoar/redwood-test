import { FormatErrorHandler } from '@graphql-yoga/common';
import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda';
import type { GraphQLHandlerOptions } from './types';
export declare const formatError: FormatErrorHandler;
/**
 * Creates an Enveloped GraphQL Server, configured with default Redwood plugins
 *
 * You can add your own plugins by passing them to the extraPlugins object
 *
 * @see https://www.envelop.dev/ for information about envelop
 * @see https://www.envelop.dev/plugins for available envelop plugins
 * ```js
 * export const handler = createGraphQLHandler({ schema, context, getCurrentUser })
 * ```
 */
export declare const createGraphQLHandler: ({ healthCheckId, loggerConfig, context, getCurrentUser, onException, generateGraphiQLHeader, extraPlugins, cors, services, sdls, directives, depthLimitOptions, allowedOperations, defaultError, graphiQLEndpoint, schemaOptions, }: GraphQLHandlerOptions) => (event: APIGatewayProxyEvent, context: LambdaContext) => Promise<any>;
//# sourceMappingURL=graphql.d.ts.map