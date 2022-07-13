/// <reference types="node" />
import type { Handler } from 'aws-lambda';
import type { FastifyRequest, FastifyReply } from 'fastify';
declare type ParseBodyResult = {
    body: string;
    isBase64Encoded: boolean;
};
export declare const parseBody: (rawBody: string | Buffer) => ParseBodyResult;
export declare const requestHandler: (req: FastifyRequest, reply: FastifyReply, handler: Handler) => Promise<void>;
export {};
//# sourceMappingURL=awsLambdaFastify.d.ts.map