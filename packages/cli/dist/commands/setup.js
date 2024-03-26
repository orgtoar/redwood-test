"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _detectProjectRwVersion = _interopRequireDefault(require("../middleware/detectProjectRwVersion"));
const command = exports.command = 'setup <command>';
const description = exports.description = 'Initialize project config and install packages';
const builder = yargs => yargs.commandDir('./setup', {
  recurse: true,
  // @NOTE This regex will ignore all commands nested more than two
  // levels deep.
  // e.g. /setup/hi.js & setup/hi/hi.js are picked up, but
  // setup/hi/hello/bazinga.js will be ignored
  // The [/\\] bit is for supporting both windows and unix style paths
  // Also take care to not trip up on paths that have "setup" earlier
  // in the path by eagerly matching in the start of the regexp
  exclude: /.*[/\\]setup[/\\].*[/\\].*[/\\]/
}).demandCommand().middleware(_detectProjectRwVersion.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup')}`);
exports.builder = builder;