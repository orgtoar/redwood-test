"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.SERVERLESS_API_YML = exports.PROJECT_NAME = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _lib = require("../../../../../lib");

var _context;

const PROJECT_NAME = _path.default.basename((0, _lib.getPaths)().base);

exports.PROJECT_NAME = PROJECT_NAME;
const SERVERLESS_API_YML = `# See the full yml reference at https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/
service: ${PROJECT_NAME}-api

# Uncomment \`org\` and \`app\` and enter manually if you want to integrate your
# deployment with the Serverless dashboard, or run \`yarn serverless\` in ./api to be
# prompted to connect to an app and these will be filled in for you.
# See https://www.serverless.com/framework/docs/dashboard/ for more details.
# org: your-org
# app: your-app

useDotenv: true

provider:
  name: aws
  runtime: nodejs14.x
  region: us-east-1 # AWS region where the service will be deployed, defaults to N. Virginia
  httpApi:          # HTTP API is used by default. To learn about the available options in API Gateway, see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html
    cors:
      allowedOrigins:
        - '*' # This is the default value. You can remove this line if you want to restrict the CORS to a specific origin.
      # allowCredentials: true # allowCredentials should only be used when allowedOrigins doesn't include '*'
      allowedHeaders:
        - authorization
        - auth-provider
        - content-type
        - X-Amz-Date
        - X-Api-Key
        - X-Amz-Security-Token
        - X-Amz-User-Agent
    payload: '1.0'
    useProviderTags: true # https://www.serverless.com/framework/docs/deprecations/#AWS_HTTP_API_USE_PROVIDER_TAGS
  stackTags:
    source: serverless
    name: Redwood Lambda API with HTTP API Gateway
  tags:
    name: Redwood Lambda API with HTTP API Gateway
  lambdaHashingVersion: 20201221 # https://www.serverless.com/framework/docs/deprecations/#LAMBDA_HASHING_VERSION_V2
  environment:
    # Add environment variables here, either in the form
    # VARIABLE_NAME: \${env:VARIABLE_NAME} for vars in your local environment, or
    # VARIABLE_NAME: \${param:VARIABLE_NAME} for vars from the Serverless dashboard

package:
  individually: true
  patterns:
    - "!node_modules/.prisma/client/libquery_engine-*"
    - "node_modules/.prisma/client/libquery_engine-rhel-*"
    - "!node_modules/prisma/libquery_engine-*"
    - "!node_modules/@prisma/engines/**"

${_fs.default.existsSync(_path.default.resolve((0, _lib.getPaths)().api.functions)) ? `functions:
  ${(0, _map.default)(_context = _fs.default.readdirSync(_path.default.resolve((0, _lib.getPaths)().api.functions))).call(_context, file => {
  const basename = _path.default.parse(file).name;

  return `${basename}:
    description: ${basename} function deployed on AWS Lambda
    package:
      artifact: dist/zipball/${basename}.zip
    memorySize: 1024 # in megabytes
    timeout: 25      # seconds (max: 900 [15 minutes])
    tags:            # tags for this specific lambda function
      endpoint: /${basename}
    handler: ${basename}.handler
    events:
      - httpApi:     # if a function should be limited to only GET or POST you can remove one or the other here
          path: /${basename}
          method: GET
      - httpApi:
          path: /${basename}
          method: POST
`;
}).join('  ')}` : ''}
`;
exports.SERVERLESS_API_YML = SERVERLESS_API_YML;