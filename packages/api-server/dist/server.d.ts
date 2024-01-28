/// <reference types="node" />
import type { FastifyInstance } from 'fastify';
export interface HttpServerParams {
    port: number;
    socket?: string;
    fastify: FastifyInstance;
}
export declare const startServer: ({ port, socket, fastify, }: HttpServerParams) => Promise<FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
//# sourceMappingURL=server.d.ts.map