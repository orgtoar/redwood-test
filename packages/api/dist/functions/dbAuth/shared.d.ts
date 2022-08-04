import type { APIGatewayProxyEvent } from 'aws-lambda';
export declare const extractCookie: (event: APIGatewayProxyEvent) => any;
export declare const decryptSession: (text: string | null) => any[];
export declare const getSession: (text?: string) => string | null;
export declare const dbAuthSession: (event: APIGatewayProxyEvent) => any;
export declare const webAuthnSession: (event: APIGatewayProxyEvent) => string | null;
//# sourceMappingURL=shared.d.ts.map