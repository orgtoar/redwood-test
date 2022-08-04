/// <reference types="node" />
declare type ParseBodyResult = {
    body: string;
    isBase64Encoded: boolean;
};
declare type FastifyRequestHeader = {
    [header: string]: string | number | boolean;
};
declare type FastifyLambdaHeaders = FastifyRequestHeader | undefined;
declare type FastifyLambdaMultiValueHeaders = {
    [header: string]: (string | number | boolean)[];
} | undefined;
export declare const parseBody: (rawBody: string | Buffer) => ParseBodyResult;
/**
 * In case there are multi-value headers that are not in the headers object,
 * we need to add them to the headers object and ensure the header names are lowercase
 * and there are multiple headers with the same name for each value.
 */
export declare const mergeMultiValueHeaders: (headers: FastifyLambdaHeaders, multiValueHeaders: FastifyLambdaMultiValueHeaders) => FastifyRequestHeader;
export {};
//# sourceMappingURL=utils.d.ts.map