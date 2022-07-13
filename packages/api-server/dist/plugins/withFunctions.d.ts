/// <reference types="node" />
import type { Handler } from 'aws-lambda';
import { FastifyInstance } from 'fastify';
export declare type Lambdas = Record<string, Handler>;
export declare const setLambdaFunctions: (foundFunctions: string[]) => Promise<void>;
declare const withFunctions: (app: FastifyInstance, apiRootPath: string) => Promise<FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance>>;
export default withFunctions;
//# sourceMappingURL=withFunctions.d.ts.map