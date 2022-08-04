"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

const command = 'ui <library>';
exports.command = command;
const description = 'Set up a UI design or style library';
exports.description = description;

const builder = yargs => yargs.commandDir('./libraries').demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-ui')}`);

exports.builder = builder;