/// <reference types="node" />
import { FastifyInstance } from 'fastify';
export interface ApiProxyOptions {
    apiUrl: string;
    apiHost: string;
}
declare const withApiProxy: (fastify: FastifyInstance, { apiUrl, apiHost }: ApiProxyOptions) => Promise<FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance, import("fastify").FastifyTypeProviderDefault>>;
export default withApiProxy;
//# sourceMappingURL=withApiProxy.d.ts.map