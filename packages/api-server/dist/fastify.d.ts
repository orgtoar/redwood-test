import type { FastifyInstance, FastifyServerOptions } from 'fastify';
import type { FastifySideConfigFn } from './types';
export declare const DEFAULT_OPTIONS: {
    logger: {
        level: string;
    };
};
export declare function loadFastifyConfig(): {
    config: FastifyServerOptions;
    configureFastify: FastifySideConfigFn;
};
export declare const createFastifyInstance: (options?: FastifyServerOptions) => FastifyInstance;
export default createFastifyInstance;
//# sourceMappingURL=fastify.d.ts.map