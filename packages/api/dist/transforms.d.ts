import type { APIGatewayProxyEvent } from 'aws-lambda';
export interface Request {
    body?: any;
    headers: Headers;
    method: string;
    query: any;
}
/**
 * Extracts and parses body payload from event with base64 encoding check
 */
export declare const parseEventBody: (event: APIGatewayProxyEvent) => any;
export declare function normalizeRequest(event: APIGatewayProxyEvent): Request;
//# sourceMappingURL=transforms.d.ts.map