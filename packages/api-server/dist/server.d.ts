/// <reference types="node" />
import { FastifyInstance } from 'fastify';
export interface HttpServerParams {
    port: number;
    socket?: string;
    fastify: FastifyInstance;
}
export declare const startServer: ({ port, socket, fastify, }: HttpServerParams) => FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance, import("fastify").FastifyTypeProviderDefault>;
//# sourceMappingURL=server.d.ts.map