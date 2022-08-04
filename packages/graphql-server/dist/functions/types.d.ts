import { DepthLimitConfig } from '@envelop/depth-limit';
import type { AllowedOperations } from '@envelop/filter-operation-type';
import { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type { PluginOrDisabledPlugin } from '@graphql-yoga/common';
import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda';
import type { AuthContextPayload } from '@redwoodjs/api';
import { CorsConfig } from '@redwoodjs/api';
import { DirectiveGlobImports } from 'src/directives/makeDirectives';
import { LoggerConfig } from '../plugins/useRedwoodLogger';
import { SdlGlobImports, ServicesGlobImports } from '../types';
declare type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export declare type GetCurrentUser = (decoded: AuthContextPayload[0], raw: AuthContextPayload[1], req?: AuthContextPayload[2]) => Promise<null | Record<string, unknown> | string>;
export declare type GenerateGraphiQLHeader = () => string;
export declare type Context = Record<string, unknown>;
export declare type ContextFunction = (...args: any[]) => Context | Promise<Context>;
/** This is an interface so you can extend it inside your application when needed */
export interface RedwoodGraphQLContext {
    event: APIGatewayProxyEvent;
    requestContext: LambdaContext;
    currentUser?: ThenArg<ReturnType<GetCurrentUser>> | AuthContextPayload | null;
    [index: string]: unknown;
}
/**
 * GraphQLHandlerOptions
 */
export interface GraphQLHandlerOptions {
    /**
     * @description The identifier used in the GraphQL health check response.
     * It verifies readiness when sent as a header in the readiness check request.
     *
     * By default, the identifier is `yoga` as seen in the HTTP response header `x-yoga-id: yoga`
     */
    healthCheckId?: string;
    /**
     * @description Customize GraphQL Logger
     *
     * Collect resolver timings, and exposes trace data for
     * an individual request under extensions as part of the GraphQL response.
     */
    loggerConfig: LoggerConfig;
    /**
     * @description Modify the resolver and global context.
     */
    context?: Context | ContextFunction;
    /**
     * @description An async function that maps the auth token retrieved from the
     * request headers to an object.
     * Is it executed when the `auth-provider` contains one of the supported
     * providers.
     */
    getCurrentUser?: GetCurrentUser;
    /**
     * @description A callback when an unhandled exception occurs. Use this to disconnect your prisma instance.
     */
    onException?: () => void;
    /**
     * @description Services passed from the glob import:
     * import services from 'src/services\/**\/*.{js,ts}'
     */
    services: ServicesGlobImports;
    /**
     * @description SDLs (schema definitions) passed from the glob import:
     * import sdls from 'src/graphql\/**\/*.{js,ts}'
     */
    sdls: SdlGlobImports;
    /**
     * @description Directives passed from the glob import:
     * import directives from 'src/directives/**\/*.{js,ts}'
     */
    directives?: DirectiveGlobImports;
    /**
     * @description A list of options passed to [makeExecutableSchema]
     * (https://www.graphql-tools.com/docs/generate-schema/#makeexecutableschemaoptions).
     */
    schemaOptions?: Partial<IExecutableSchemaDefinition>;
    /**
     * @description CORS configuration
     */
    cors?: CorsConfig;
    /**
     *  @description Limit the complexity of the queries solely by their depth.
     *
     * @see https://www.npmjs.com/package/graphql-depth-limit#documentation
     */
    depthLimitOptions?: DepthLimitConfig;
    /**
     * @description Customize the default error message used to mask errors.
     *
     * By default, the masked error message is "Something went wrong"
     *
     * @see https://github.com/dotansimha/envelop/blob/main/packages/core/docs/use-masked-errors.md
     */
    defaultError?: string;
    /**
     * @description Only allows the specified operation types (e.g. subscription, query or mutation).
     *
     * By default, only allow query and mutation (ie, do not allow subscriptions).
     *
     * An array of GraphQL's OperationTypeNode enums:
     * - OperationTypeNode.SUBSCRIPTION
     * - OperationTypeNode.QUERY
     * - OperationTypeNode.MUTATION
     *
     * @see https://github.com/dotansimha/envelop/tree/main/packages/plugins/filter-operation-type
     */
    allowedOperations?: AllowedOperations;
    /**
     * @description Custom Envelop plugins
     */
    extraPlugins?: PluginOrDisabledPlugin[];
    /**
     * @description Customize the GraphiQL Endpoint that appears in the location bar of the GraphQL Playground
     *
     * Defaults to '/graphql' as this value must match the name of the `graphql` function on the api-side.
     */
    graphiQLEndpoint?: string;
    /**
     * @description Function that returns custom headers (as string) for GraphiQL.
     *
     * Headers must set auth-provider, Authorization and (if using dbAuth) the encrypted cookie.
     */
    generateGraphiQLHeader?: GenerateGraphiQLHeader;
}
export {};
//# sourceMappingURL=types.d.ts.map