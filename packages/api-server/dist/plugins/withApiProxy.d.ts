/// <reference types="node" />
import { FastifyInstance } from 'fastify';
interface ApiProxyOptions {
    apiUrl: string;
    apiHost: string;
}
declare const withApiProxy: (app: FastifyInstance, { apiUrl, apiHost }: ApiProxyOptions) => FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance>;
export default withApiProxy;
//# sourceMappingURL=withApiProxy.d.ts.map