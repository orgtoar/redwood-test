import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda';
import type { SupportedAuthTypes } from '@redwoodjs/auth';
interface Req {
    event: APIGatewayProxyEvent;
    context: LambdaContext;
}
declare type Decoded = null | string | Record<string, unknown>;
export declare const decodeToken: (type: SupportedAuthTypes, token: string, req: Req) => Promise<Decoded>;
export {};
//# sourceMappingURL=index.d.ts.map