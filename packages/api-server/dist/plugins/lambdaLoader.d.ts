import type { Handler } from 'aws-lambda';
import type { Options as FastGlobOptions } from 'fast-glob';
import type { FastifyReply, FastifyRequest, RequestGenericInterface } from 'fastify';
export type Lambdas = Record<string, Handler>;
export declare const LAMBDA_FUNCTIONS: Lambdas;
export declare const setLambdaFunctions: (foundFunctions: string[]) => Promise<void>;
type LoadFunctionsFromDistOptions = {
    fastGlobOptions?: FastGlobOptions;
};
export declare const loadFunctionsFromDist: (options?: LoadFunctionsFromDistOptions) => Promise<void>;
interface LambdaHandlerRequest extends RequestGenericInterface {
    Params: {
        routeName: string;
    };
}
/**
 This will take a fastify request
 Then convert it to a lambdaEvent, and pass it to the the appropriate handler for the routeName
 The LAMBDA_FUNCTIONS lookup has been populated already by this point
 **/
export declare const lambdaRequestHandler: (req: FastifyRequest<LambdaHandlerRequest>, reply: FastifyReply) => Promise<void>;
export {};
//# sourceMappingURL=lambdaLoader.d.ts.map