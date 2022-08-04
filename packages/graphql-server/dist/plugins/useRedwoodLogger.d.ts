import { Plugin } from '@graphql-yoga/common';
import type { Logger, LevelWithSilent } from '@redwoodjs/api/logger';
import { RedwoodGraphQLContext } from '../functions/types';
/**
 * Options for request and response information to include in the log statements
 * output by UseRedwoodLogger around the execution event
 *
 * @param level - Sets log level specific to GraphQL log output. Defaults to current logger level.
 * @param data - Include response data sent to client.
 * @param operationName - Include operation name.
 * @param requestId - Include the event's requestId, or if none, generate a uuid as an identifier.
 * @param query - Include the query. This is the query or mutation (with fields) made in the request.
 * @param tracing - Include the tracing and timing information.
 * @param userAgent - Include the browser (or client's) user agent.
 * @param excludeOperations - Exclude the specified operations from being logged.
 *
 */
declare type GraphQLLoggerOptions = {
    /**
     * Sets log level for GraphQL logging.
     * This level setting can be different from the one used in api side logging.
     * Defaults to the same level as the logger unless set here.
     *
     * Available log levels:
     *
     * - 'fatal'
     * - 'error'
     * - 'warn'
     * - 'info'
     * - 'debug'
     * - 'trace'
     * - 'silent'
     *
     * The logging level is a __minimum__ level. For instance if `logger.level` is `'info'` then all `'fatal'`, `'error'`, `'warn'`,
     * and `'info'` logs will be enabled.
     *
     * You can pass `'silent'` to disable logging.
     *
     * @default level of the logger set in LoggerConfig
     *
     */
    level?: LevelWithSilent | string;
    /**
     * @description Include response data sent to client.
     */
    data?: boolean;
    /**
     * @description Include operation name.
     *
     * The operation name is a meaningful and explicit name for your operation. It is only required in multi-operation documents,
     * but its use is encouraged because it is very helpful for debugging and server-side logging.
     * When something goes wrong (you see errors either in your network logs, or in the logs of your GraphQL server)
     * it is easier to identify a query in your codebase by name instead of trying to decipher the contents.
     * Think of this just like a function name in your favorite programming language.
     *
     * @see https://graphql.org/learn/queries/#operation-name
     */
    operationName?: boolean;
    /**
     * @description Include the event's requestId, or if none, generate a uuid as an identifier.
     *
     * The requestId can be helpful when contacting your deployment provider to resolve issues when encountering errors or unexpected behavior.
     */
    requestId?: boolean;
    /**
     * @description Include the query. This is the query or mutation (with fields) made in the request.
     */
    query?: boolean;
    /**
     * @description Include the tracing and timing information.
     *
     * This will log various performance timings withing the GraphQL event lifecycle (parsing, validating, executing, etc).
     */
    tracing?: boolean;
    /**
     * @description Include the browser (or client's) user agent.
     *
     * This can be helpful to know what type of client made the request to resolve issues when encountering errors or unexpected behavior.
     */
    userAgent?: boolean;
    /**
     * @description Exclude operation from the log output.
     *
     * This is useful when you want to filter out certain operations from the log output.
     * For example `IntrospectionQuery` from GraphQL playground.
     */
    excludeOperations?: string[];
};
/**
 * Configure the logger used by the GraphQL server.
 *
 * @param logger your logger
 * @param options the GraphQLLoggerOptions such as tracing, operationName, etc
 */
export declare type LoggerConfig = {
    logger: Logger;
    options?: GraphQLLoggerOptions;
};
/**
 * This plugin logs every time an operation is being executed and
 * when the execution of the operation is done.
 *
 * It adds information using a child logger from the context
 * such as the operation name, request id, errors, and header info
 * to help trace and diagnose issues.
 *
 * Tracing and timing information can be enabled via the
 * GraphQLHandlerOptions traction option.
 *
 * @see https://www.envelop.dev/docs/plugins/lifecycle
 * @returns
 */
export declare const useRedwoodLogger: (loggerConfig: LoggerConfig) => Plugin<RedwoodGraphQLContext>;
export {};
//# sourceMappingURL=useRedwoodLogger.d.ts.map