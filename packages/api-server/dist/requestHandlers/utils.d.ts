/// <reference types="node" />
type ParseBodyResult = {
    body: string;
    isBase64Encoded: boolean;
};
type FastifyHeaderValue = string | number | boolean;
type FastifyMergedHeaders = {
    [name: string]: FastifyHeaderValue[];
};
type FastifyRequestHeader = {
    [header: string]: FastifyHeaderValue;
};
type FastifyLambdaHeaders = FastifyRequestHeader | undefined;
type FastifyLambdaMultiValueHeaders = FastifyMergedHeaders | undefined;
export declare const parseBody: (rawBody: string | Buffer) => ParseBodyResult;
/**
 * `headers` and `multiValueHeaders` are merged into a single object where the
 * key is the header name in lower-case and the value is a list of values for
 * that header. Most multi-values are merged into a single value separated by a
 * semi-colon. The only exception is set-cookie. set-cookie headers should not
 * be merged, they should be set individually by multiple calls to
 * reply.header(). See
 * https://www.fastify.io/docs/latest/Reference/Reply/#set-cookie
 */
export declare const mergeMultiValueHeaders: (headers: FastifyLambdaHeaders, multiValueHeaders: FastifyLambdaMultiValueHeaders) => FastifyMergedHeaders;
export {};
//# sourceMappingURL=utils.d.ts.map