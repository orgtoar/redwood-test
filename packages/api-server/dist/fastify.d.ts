/// <reference types="node" />
import type { FastifyInstance, FastifyServerOptions } from 'fastify';
import { FastifySideConfigFn } from './types';
export declare function loadFastifyConfig(): {
    config: FastifyServerOptions<import("http").Server, import("fastify").FastifyLoggerInstance>;
    configureFastify: FastifySideConfigFn;
};
export declare const createFastifyInstance: (options?: FastifyServerOptions) => FastifyInstance;
export default createFastifyInstance;
//# sourceMappingURL=fastify.d.ts.map