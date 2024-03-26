"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'cache <client>';
const description = exports.description = 'Sets up an init file for service caching';
const builder = yargs => {
  yargs.positional('client', {
    choices: ['memcached', 'redis'],
    description: 'Cache client',
    type: 'string',
    required: true
  }).option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing cache.js file',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-cache')}`);
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup cache',
    client: options.client,
    force: options.force
  });
  const {
    handler
  } = await import('./cacheHandler.js');
  return handler(options);
};
exports.handler = handler;