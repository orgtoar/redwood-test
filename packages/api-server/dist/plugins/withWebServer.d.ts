/// <reference types="node" />
import { FastifyInstance } from 'fastify';
export declare const getFallbackIndexPath: () => "200.html" | "index.html";
declare const withWebServer: (app: FastifyInstance) => FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance>;
export default withWebServer;
//# sourceMappingURL=withWebServer.d.ts.map