"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

const command = 'record <command>';
exports.command = command;
const description = 'Setup RedwoodRecord for your project. Caches a JSON version of your data model and adds api/src/models/index.js with some config.';
exports.description = description;

const builder = yargs => yargs.commandDir('./record', {
  recurse: false
}).demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('RedwoodRecord Docs', 'https://redwoodjs.com/docs/redwoodrecord')}\n`);

exports.builder = builder;