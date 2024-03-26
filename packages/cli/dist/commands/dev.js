"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _colors = _interopRequireDefault(require("../lib/colors"));
var _checkNodeVersion = require("../middleware/checkNodeVersion");
const command = exports.command = 'dev [side..]';
const description = exports.description = 'Start development servers for api, and web';
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
  }).middleware(() => {
    const check = (0, _checkNodeVersion.checkNodeVersion)();
    if (check.ok) {
      return;
    }
    console.warn(`${_colors.default.warning('Warning')}: ${check.message}\n`);
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#dev')}`);
};
exports.builder = builder;
const handler = async options => {
  const {
    handler
  } = await import('./devHandler.js');
  return handler(options);
};
exports.handler = handler;