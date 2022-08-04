"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

const command = 'deploy <target>';
exports.command = command;
const description = 'Setup deployment to various targets';
exports.description = description;

const builder = yargs => yargs.commandDir('./providers', {
  recurse: true
}).demandCommand().option('force', {
  alias: 'f',
  default: false,
  description: 'Overwrite existing configuration',
  type: 'boolean'
}).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-deploy-config')}`);

exports.builder = builder;