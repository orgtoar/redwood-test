import { FastifyInstance } from 'fastify';
import { HttpServerParams } from './server';
export interface WebServerArgs extends Omit<HttpServerParams, 'fastify'> {
    apiHost?: string;
}
export interface ApiServerArgs extends Omit<HttpServerParams, 'fastify'> {
    apiRootPath: string;
}
export declare type BothServerArgs = Omit<HttpServerParams, 'fastify'>;
export declare type FastifySideConfigFnOptions = {
    side: SupportedSides;
} & (WebServerArgs | BothServerArgs | ApiServerArgs);
export declare type SupportedSides = 'api' | 'web';
export declare type FastifySideConfigFn = (fastify: FastifyInstance, options?: FastifySideConfigFnOptions) => Promise<FastifyInstance> | void;
//# sourceMappingURL=types.d.ts.map