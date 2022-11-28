import { Headers } from '@whatwg-node/fetch'
import type { APIGatewayProxyEvent } from 'aws-lambda'

import { normalizeRequest } from '@redwoodjs/api'

export const createMockedEvent = (
  httpMethod = 'POST',
  body: any = undefined,
  isBase64Encoded = false
): APIGatewayProxyEvent => {
  return {
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod,
    isBase64Encoded,
    path: '/MOCK_PATH',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: 'MOCKED_ACCOUNT',
      apiId: 'MOCKED_API_ID',
      authorizer: { name: 'MOCKED_AUTHORIZER' },
      protocol: 'HTTP',
      identity: {
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
        sourceIp: '123.123.123.123',
        user: null,
        userAgent: null,
        userArn: null,
      },
      httpMethod: 'POST',
      path: '/MOCK_PATH',
      stage: 'MOCK_STAGE',
      requestId: 'MOCKED_REQUEST_ID',
      requestTimeEpoch: 1,
      resourceId: 'MOCKED_RESOURCE_ID',
      resourcePath: 'MOCKED_RESOURCE_PATH',
    },
    resource: 'MOCKED_RESOURCE',
  }
}

test('Normalizes an aws event with base64', () => {
  const corsEventB64 = createMockedEvent(
    'POST',
    Buffer.from(JSON.stringify({ bazinga: 'hello_world' }), 'utf8').toString(
      'base64'
    ),
    true
  )

  const normalizedRequest = normalizeRequest(corsEventB64)
  const expectedRequest = {
    headers: new Headers(corsEventB64.headers),
    method: 'POST',
    query: null,
    body: {
      bazinga: 'hello_world',
    },
  }

  expect(normalizedRequest.method).toEqual(expectedRequest.method)
  expect(normalizedRequest.query).toEqual(expectedRequest.query)
  expect(normalizedRequest.body).toEqual(expectedRequest.body)
  expectedRequest.headers.forEach((value, key) => {
    expect(normalizedRequest.headers.get(key)).toEqual(value)
  })
})

test('Handles CORS requests with and without b64 encoded', () => {
  const corsEventB64 = createMockedEvent('OPTIONS', undefined, true)

  const normalizedRequest = normalizeRequest(corsEventB64)
  const expectedRequest = {
    headers: new Headers(corsEventB64.headers),
    method: 'OPTIONS',
    query: null,
    body: undefined,
  }
  expect(normalizedRequest.method).toEqual(expectedRequest.method)
  expect(normalizedRequest.query).toEqual(expectedRequest.query)
  expect(normalizedRequest.body).toEqual(expectedRequest.body)
  expectedRequest.headers.forEach((value, key) => {
    expect(normalizedRequest.headers.get(key)).toEqual(value)
  })
})
