import type { APIGatewayProxyEvent, APIGatewayProxyEventHeaders, Context } from 'aws-lambda';
import type { SupportedVerifierTypes } from '@redwoodjs/api/webhooks';
interface BuildEventParams extends Partial<APIGatewayProxyEvent> {
    payload?: string | null | Record<any, any>;
    signature?: string;
    signatureHeader?: string;
    headers?: APIGatewayProxyEventHeaders;
}
/**
 * @description Use this to mock out the http request event that is received by your function in unit tests
 *
 * @example Mocking sending headers
 * mockHttpEvent({header: {'X-Custom-Header': 'bazinga'}})
 *
 * @example Adding a JSON payload
 * mockHttpEvent({payload: JSON.stringify(mockedRequestBody)})
 *
 * @returns APIGatewayProxyEvent
 */
export declare const mockHttpEvent: ({ payload, signature, signatureHeader, queryStringParameters, httpMethod, headers, path, isBase64Encoded, ...others }: BuildEventParams) => APIGatewayProxyEvent;
/**
 * @description Use this function to mock the http event's context
 * @see: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
 **/
export declare const mockContext: () => Context;
interface MockedSignedWebhookParams extends Omit<BuildEventParams, 'signature' | 'signatureHeader'> {
    signatureType: Exclude<SupportedVerifierTypes, 'skipVerifier'>;
    signatureHeader: string;
    secret: string;
}
/**
 * @description Use this function to mock a signed webhook
 * @see https://redwoodjs.com/docs/webhooks#webhooks
 **/
export declare const mockSignedWebhook: ({ payload, signatureType, signatureHeader, secret, ...others }: MockedSignedWebhookParams) => APIGatewayProxyEvent;
export {};
//# sourceMappingURL=apiFunction.d.ts.map