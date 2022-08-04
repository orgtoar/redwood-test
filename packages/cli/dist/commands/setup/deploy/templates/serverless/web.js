"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SERVERLESS_WEB_YML = exports.PROJECT_NAME = void 0;

var _path = _interopRequireDefault(require("path"));

var _lib = require("../../../../../lib");

const PROJECT_NAME = _path.default.basename((0, _lib.getPaths)().base);

exports.PROJECT_NAME = PROJECT_NAME;
const SERVERLESS_WEB_YML = `# See the full yml reference at https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/
service: ${PROJECT_NAME}-web

# Uncomment \`org\` and \`app\` and enter manually if you want to integrate your
# deployment with the Serverless dashboard, or run \`yarn serverless\` in ./web to be
# prompted to connect to an app and these will be filled in for you.
# See https://www.serverless.com/framework/docs/dashboard/ for more details.
# org: your-org
# app: your-app

useDotenv: true

plugins:
  - serverless-lift

constructs:
  web:
    type: static-website
    path: dist

provider:
  name: aws
  runtime: nodejs14.x
  region: us-east-1 # AWS region where the service will be deployed, defaults to N. Virgina
`;
exports.SERVERLESS_WEB_YML = SERVERLESS_WEB_YML;