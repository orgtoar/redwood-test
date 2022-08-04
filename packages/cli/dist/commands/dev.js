"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _checkForBabelConfig = _interopRequireDefault(require("../middleware/checkForBabelConfig"));

const command = 'dev [side..]';
exports.command = command;
const description = 'Start development servers for api, and web';
exports.description = description;

const builder = yargs => {
  yargs.positional('side', {
    choices: ['api', 'web'],
    default: ['api', 'web'],
    description: 'Which dev server(s) to start',
    type: 'array'
  }).option('forward', {
    alias: 'fwd',
    description: 'String of one or more Webpack DevServer config options, for example: `--fwd="--port=1234 --no-open"`',
    type: 'string'
  }).option('generate', {
    type: 'boolean',
    default: true,
    description: 'Generate artifacts'
  }).option('watchNodeModules', {
    type: 'boolean',
    description: 'Reload on changes to node_modules'
  }).option('apiDebugPort', {
    type: 'number',
    description: 'Port on which to expose API server debugger. If you supply the flag with no value it defaults to 18911.'
  }).middleware(_checkForBabelConfig.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#dev')}`);
};

exports.builder = builder;

const handler = async options => {
  const {
    handler
  } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('./devHandler')));
  return handler(options);
};

exports.handler = handler;