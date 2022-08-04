"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _detectProjectRwVersion = _interopRequireDefault(require("../middleware/detectProjectRwVersion"));

const command = 'setup <command>';
exports.command = command;
const description = 'Initialize project config and install packages';
exports.description = description;

const builder = yargs => yargs.commandDir('./setup', {
  recurse: true,

  /*
  @NOTE This regex will ignore all double nested commands
  e.g. /setup/hi.js & setup/hi/hi.js are picked up,
  but setup/hi/hello/bazinga.js will be ignored
  The [\/\\] bit is for supporting both windows and unix style paths
  */
  exclude: /setup[\/\\]+.*[\/\\]+.*[\/\\]/
}).demandCommand().middleware(_detectProjectRwVersion.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup')}`);

exports.builder = builder;