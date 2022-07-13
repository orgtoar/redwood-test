/// <reference types="node" />
import { FastifyInstance } from 'fastify';
export interface HttpServerParams {
    port: number;
    socket?: string;
    app: FastifyInstance;
}
export declare const startServer: ({ port, socket, app }: HttpServerParams) => FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance>;
//# sourceMappingURL=server.d.ts.map