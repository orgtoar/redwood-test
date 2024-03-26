"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
const command = exports.command = 'deploy <target>';
const description = exports.description = 'Deploy your Redwood project';
const builder = yargs => yargs.commandDir('./deploy', {
  recurse: false
}).demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#deploy')}\n`);
exports.builder = builder;