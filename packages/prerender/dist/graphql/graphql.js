"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeQuery = executeQuery;
exports.getGqlHandler = getGqlHandler;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _path = _interopRequireDefault(require("path"));

var _graphql = require("graphql");

var _paths = require("@redwoodjs/internal/dist/paths");

var _web = require("@redwoodjs/web");

async function executeQuery(gqlHandler, query, variables) {
  const operationName = (0, _web.getOperationName)(query);
  const operation = {
    operationName,
    query: (0, _graphql.print)(query),
    variables
  };
  const handlerResult = await gqlHandler(operation);
  return handlerResult.body;
}

async function getGqlHandler() {
  const gqlPath = _path.default.join((0, _paths.getPaths)().api.functions, 'graphql');

  const {
    handler
  } = await Promise.resolve(`${gqlPath}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  return async operation => {
    return await handler(buildApiEvent(operation), buildContext());
  };
}

function buildApiEvent(body) {
  return {
    body: JSON.stringify(body),
    headers: {
      origin: 'http://localhost:8910',
      accept: '*/*',
      host: 'localhost:8910'
    },
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/graphql',
    pathParameters: null,
    queryStringParameters: {},
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '',
    requestContext: {
      requestId: 'req-3',
      identity: {
        sourceIp: '::1',
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        user: null,
        userAgent: null,
        userArn: null
      },
      authorizer: {},
      protocol: 'http',
      httpMethod: 'POST',
      path: '/graphql',
      stage: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
      accountId: '',
      apiId: ''
    }
  };
}

function buildContext() {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    memoryLimitInMB: '',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: () => 100,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };
}