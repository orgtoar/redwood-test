"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'package <npm-package>';
const description = exports.description = 'Run a bin from an NPM package with version compatibility checks';
const builder = yargs => {
  yargs.positional('npm-package', {
    description: 'The NPM package to run. This can be a package name or a package name with a version or tag.',
    type: 'string'
  }).option('force', {
    default: false,
    description: 'Proceed with a potentially incompatible version of the package',
    type: 'boolean',
    alias: 'f'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#lint')}`);
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup package'
  });
  const {
    handler
  } = await import('./packageHandler.js');
  return handler(options);
};
exports.handler = handler;