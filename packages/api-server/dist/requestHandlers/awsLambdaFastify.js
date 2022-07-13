"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.requestHandler = exports.parseBody = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _qs = _interopRequireDefault(require("qs"));

const parseBody = rawBody => {
  if (typeof rawBody === 'string') {
    return {
      body: rawBody,
      isBase64Encoded: false
    };
  }

  if (rawBody instanceof Buffer) {
    return {
      body: rawBody.toString('base64'),
      isBase64Encoded: true
    };
  }

  return {
    body: '',
    isBase64Encoded: false
  };
};

exports.parseBody = parseBody;

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
    ...parseBody(request.rawBody || '') // adds `body` and `isBase64Encoded`

  };
};

const fastifyResponseForLambdaResult = (reply, lambdaResult) => {
  const {
    statusCode = 200,
    headers,
    body = '',
    multiValueHeaders
  } = lambdaResult;

  if (headers) {
    var _context;

    (0, _forEach.default)(_context = (0, _keys.default)(headers)).call(_context, headerName => {
      const headerValue = headers[headerName];
      reply.header(headerName, headerValue);
    });
  }

  if (multiValueHeaders) {
    var _context2;

    (0, _forEach.default)(_context2 = (0, _keys.default)(multiValueHeaders)).call(_context2, headerName => {
      const headerValue = multiValueHeaders[headerName];
      reply.header(headerName, headerValue);
    });
  }

  reply.status(statusCode);

  if (lambdaResult.isBase64Encoded) {
    // Correctly handle base 64 encoded binary data. See
    // https://aws.amazon.com/blogs/compute/handling-binary-data-using-amazon-api-gateway-http-apis
    reply.send(Buffer.from(body, 'base64'));
  } else {
    reply.send(body);
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
  }; // Execute the lambda function.
  // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html


  const handlerPromise = handler(event, // @ts-expect-error - Add support for context: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0bb210867d16170c4a08d9ce5d132817651a0f80/types/aws-lambda/index.d.ts#L443-L467
  {}, handlerCallback(reply)); // In this case the handlerCallback should not be called.

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