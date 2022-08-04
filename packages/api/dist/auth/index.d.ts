export * from './parseJWT';
import type { APIGatewayProxyEvent, Context as LambdaContext } from 'aws-lambda';
import type { SupportedAuthTypes } from '@redwoodjs/auth';
import type { DbAuthSession } from '../functions/dbAuth/DbAuthHandler';
export declare const getAuthProviderHeader: (event: APIGatewayProxyEvent) => SupportedAuthTypes;
export interface AuthorizationHeader {
    schema: 'Bearer' | 'Basic' | string;
    token: string;
}
/**
 * Split the `Authorization` header into a schema and token part.
 */
export declare const parseAuthorizationHeader: (event: APIGatewayProxyEvent) => AuthorizationHeader;
export declare type AuthContextPayload = [
    string | Record<string, unknown> | null | DbAuthSession,
    {
        type: SupportedAuthTypes;
    } & AuthorizationHeader,
    {
        event: APIGatewayProxyEvent;
        context: LambdaContext;
    }
];
/**
 * Get the authorization information from the request headers and request context.
 * @returns [decoded, { type, schema, token }, { event, context }]
 **/
export declare const getAuthenticationContext: ({ event, context, }: {
    event: APIGatewayProxyEvent;
    context: LambdaContext;
}) => Promise<undefined | AuthContextPayload>;
//# sourceMappingURL=index.d.ts.map