"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.requestHandler = exports.lambdaEventForFastifyRequest = void 0;
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _qs = _interopRequireDefault(require("qs"));
var _utils = require("./utils");
const lambdaEventForFastifyRequest = request => {
  return {
    httpMethod: request.method,
    headers: request.headers,
    path: request.urlData('path'),
    queryStringParameters: _qs.default.parse(request.url.split(/\?(.+)/)[1]),
    requestContext: {
      requestId: request.id,
      identity: {
        sourceIp: request.ip
      }
    },
    ...(0, _utils.parseBody)(request.rawBody || '') // adds `body` and `isBase64Encoded`
  };
};
exports.lambdaEventForFastifyRequest = lambdaEventForFastifyRequest;
const fastifyResponseForLambdaResult = (reply, lambdaResult) => {
  var _context;
  const {
    statusCode = 200,
    headers,
    body = '',
    multiValueHeaders
  } = lambdaResult;
  const mergedHeaders = (0, _utils.mergeMultiValueHeaders)(headers, multiValueHeaders);
  (0, _forEach.default)(_context = (0, _entries.default)(mergedHeaders)).call(_context, ([name, values]) => (0, _forEach.default)(values).call(values, value => reply.header(name, value)));
  reply.status(statusCode);
  if (lambdaResult.isBase64Encoded) {
    // Correctly handle base 64 encoded binary data. See
    // https://aws.amazon.com/blogs/compute/handling-binary-data-using-amazon-api-gateway-http-apis
    return reply.send(Buffer.from(body, 'base64'));
  } else {
    return reply.send(body);
  }
};
const fastifyResponseForLambdaError = (req, reply, error) => {
  req.log.error(error);
  reply.status(500).send();
};
const requestHandler = async (req, reply, handler) => {
  // We take the fastify request object and convert it into a lambda function event.
  const event = lambdaEventForFastifyRequest(req);
  const handlerCallback = reply => (error, lambdaResult) => {
    if (error) {
      fastifyResponseForLambdaError(req, reply, error);
      return;
    }
    fastifyResponseForLambdaResult(reply, lambdaResult);
  };

  // Execute the lambda function.
  // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
  const handlerPromise = handler(event,
  // @ts-expect-error - Add support for context: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0bb210867d16170c4a08d9ce5d132817651a0f80/types/aws-lambda/index.d.ts#L443-L467
  {}, handlerCallback(reply));

  // In this case the handlerCallback should not be called.
  if (handlerPromise && typeof handlerPromise.then === 'function') {
    try {
      const lambdaResponse = await handlerPromise;
      return fastifyResponseForLambdaResult(reply, lambdaResponse);
    } catch (error) {
      return fastifyResponseForLambdaError(req, reply, error);
    }
  }
};
exports.requestHandler = requestHandler;