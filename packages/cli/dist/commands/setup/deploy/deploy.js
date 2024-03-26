"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
const command = exports.command = 'deploy <target>';
const description = exports.description = 'Setup deployment to various targets';
const builder = yargs => yargs.commandDir('./providers', {
  recurse: true
}).demandCommand().option('force', {
  alias: 'f',
  default: false,
  description: 'Overwrite existing configuration',
  type: 'boolean'
}).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-deploy-config')}`);
exports.builder = builder;