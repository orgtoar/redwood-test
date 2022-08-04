/// <reference types="node" />
import { FastifyInstance } from 'fastify';
import { WebServerArgs } from '../types';
export declare const getFallbackIndexPath: () => "200.html" | "index.html";
declare const withWebServer: (fastify: FastifyInstance, options: WebServerArgs) => Promise<FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance, import("fastify").FastifyTypeProviderDefault>>;
export default withWebServer;
//# sourceMappingURL=withWebServer.d.ts.map