import type { APIGatewayEvent, Context as LambdaContext } from 'aws-lambda';
import type { GetCurrentUser } from './types';
interface Args {
    handlerFn: (event: APIGatewayEvent, context: LambdaContext, ...others: any) => any;
    getCurrentUser: GetCurrentUser;
}
export declare const useRequireAuth: ({ handlerFn, getCurrentUser }: Args) => (event: import("aws-lambda").APIGatewayProxyEvent, context: LambdaContext, ...rest: any) => Promise<any>;
export {};
//# sourceMappingURL=useRequireAuth.d.ts.map