/// <reference types="node" />
import { FastifyInstance } from 'fastify';
import type { ApiServerArgs } from '../types';
declare const withFunctions: (fastify: FastifyInstance, options: ApiServerArgs) => Promise<FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance, import("fastify").FastifyTypeProviderDefault>>;
export default withFunctions;
//# sourceMappingURL=withFunctions.d.ts.map