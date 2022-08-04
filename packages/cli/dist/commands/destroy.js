"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

const command = 'destroy <type>';
exports.command = command;
const aliases = ['d'];
exports.aliases = aliases;
const description = 'Rollback changes made by the generate command';
exports.description = description;

const builder = yargs => yargs.commandDir('./destroy', {
  recurse: true
}).demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#destroy-alias-d')}`);

exports.builder = builder;