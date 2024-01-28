/// <reference types="node" />
import type { FastifyInstance } from 'fastify';
import type { ApiServerArgs } from '../types';
declare const withFunctions: (fastify: FastifyInstance, options: Omit<ApiServerArgs, 'loadEnvFiles'>) => Promise<FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
export default withFunctions;
//# sourceMappingURL=withFunctions.d.ts.map