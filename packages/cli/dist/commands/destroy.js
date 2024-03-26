"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = exports.aliases = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
const command = exports.command = 'destroy <type>';
const aliases = exports.aliases = ['d'];
const description = exports.description = 'Rollback changes made by the generate command';
const builder = yargs => yargs.commandDir('./destroy', {
  recurse: true
}).demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#destroy-alias-d')}`);
exports.builder = builder;