import type { FastifyListenOptions, FastifyServerOptions, FastifyInstance, HookHandlerDoneFunction } from 'fastify';
type StartOptions = Omit<FastifyListenOptions, 'port' | 'host'>;
interface Server extends FastifyInstance {
    start: (options?: StartOptions) => Promise<string>;
}
export interface CreateServerOptions {
    /**
     * The prefix for all routes. Defaults to `/`.
     */
    apiRootPath?: string;
    /**
     * Logger instance or options.
     */
    logger?: FastifyServerOptions['logger'];
    /**
     * Options for the fastify server instance.
     * Omitting logger here because we move it up.
     */
    fastifyServerOptions?: Omit<FastifyServerOptions, 'logger'>;
}
/**
 * Creates a server for api functions:
 *
 * ```js
 * import { createServer } from '@redwoodjs/api-server'
 *
 * import { logger } from 'src/lib/logger'
 *
  async function main() {
 *   const server = await createServer({
 *     logger,
 *     apiRootPath: 'api'
 *   })
 *
 *   // Configure the returned fastify instance:
 *   server.register(myPlugin)
 *
 *   // When ready, start the server:
 *   await server.start()
 * }
 *
 * main()
 * ```
 */
export declare function createServer(options?: CreateServerOptions): Promise<Server>;
export declare function resolveOptions(options?: CreateServerOptions, args?: string[]): Required<Omit<CreateServerOptions, "logger" | "fastifyServerOptions"> & {
    fastifyServerOptions: FastifyServerOptions;
    port: number;
}>;
type DefaultCreateServerOptions = Required<Omit<CreateServerOptions, 'fastifyServerOptions'> & {
    fastifyServerOptions: Pick<FastifyServerOptions, 'requestTimeout'>;
}>;
export declare const DEFAULT_CREATE_SERVER_OPTIONS: DefaultCreateServerOptions;
export interface RedwoodFastifyAPIOptions {
    redwood: {
        apiRootPath: string;
    };
}
export declare function redwoodFastifyFunctions(fastify: FastifyInstance, opts: RedwoodFastifyAPIOptions, done: HookHandlerDoneFunction): Promise<void>;
export {};
//# sourceMappingURL=createServer.d.ts.map