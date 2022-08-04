import type { Handler } from 'aws-lambda';
import { FastifyReply, FastifyRequest, RequestGenericInterface } from 'fastify';
export declare type Lambdas = Record<string, Handler>;
export declare const LAMBDA_FUNCTIONS: Lambdas;
export declare const setLambdaFunctions: (foundFunctions: string[]) => Promise<void>;
export declare const loadFunctionsFromDist: () => Promise<void>;
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