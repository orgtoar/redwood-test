"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mockSignedWebhook = exports.mockHttpEvent = exports.mockContext = void 0;

var _webhooks = require("@redwoodjs/api/webhooks");

/**
 * @description Use this to mock out the http request event that is received by your function in unit tests
 *
 * @example Mocking sending headers
 * mockHttpEvent({header: {'X-Custom-Header': 'bazinga'}})
 *
 * @example Adding a JSON payload
 * mockHttpEvent({payload: JSON.stringify(mockedRequestBody)})
 *
 * @returns APIGatewayProxyEvent
 */
const mockHttpEvent = ({
  payload = null,
  signature,
  signatureHeader,
  queryStringParameters = null,
  httpMethod = 'GET',
  headers = {},
  path = '',
  isBase64Encoded = false,
  ...others
}) => {
  if (signature && signatureHeader) {
    headers[signatureHeader.toLocaleLowerCase()] = signature;
  }

  const payloadAsString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const body = isBase64Encoded ? Buffer.from(payloadAsString || '').toString('base64') : payloadAsString;
  return {
    body,
    headers,
    multiValueHeaders: {},
    isBase64Encoded,
    path,
    pathParameters: null,
    stageVariables: null,
    httpMethod,
    queryStringParameters,
    // @ts-expect-error not required for mocks
    requestContext: null,
    // @ts-expect-error not required for mocks
    resource: null,
    multiValueQueryStringParameters: null,
    ...others
  };
};
/**
 * @description Use this function to mock the http event's context
 * @see: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
 **/


exports.mockHttpEvent = mockHttpEvent;

const mockContext = () => {
  const context = {};
  return context;
};

exports.mockContext = mockContext;

/**
 * @description Use this function to mock a signed webhook
 * @see https://redwoodjs.com/docs/webhooks#webhooks
 **/
const mockSignedWebhook = ({
  payload = null,
  signatureType,
  signatureHeader,
  secret,
  ...others
}) => {
  const payloadAsString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = (0, _webhooks.signPayload)(signatureType, {
    payload: payloadAsString,
    secret
  });
  return mockHttpEvent({
    payload,
    signature,
    signatureHeader,
    ...others
  });
};

exports.mockSignedWebhook = mockSignedWebhook;