import type { APIGatewayProxyEvent, Handler } from 'aws-lambda';
import type { FastifyRequest, FastifyReply } from 'fastify';
export declare const lambdaEventForFastifyRequest: (request: FastifyRequest) => APIGatewayProxyEvent;
export declare const requestHandler: (req: FastifyRequest, reply: FastifyReply, handler: Handler) => Promise<void>;
//# sourceMappingURL=awsLambdaFastify.d.ts.map