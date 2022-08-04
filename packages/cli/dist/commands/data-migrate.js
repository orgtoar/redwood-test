"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

const command = 'data-migrate <command>';
exports.command = command;
const aliases = ['dm', 'dataMigrate'];
exports.aliases = aliases;
const description = 'Migrate the data in your database';
exports.description = description;

const builder = yargs => yargs.commandDir('./dataMigrate').demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#datamigrate')}`);

exports.builder = builder;