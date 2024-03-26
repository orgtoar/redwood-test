"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = exports.aliases = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _detectProjectRwVersion = _interopRequireDefault(require("../middleware/detectProjectRwVersion"));
const command = exports.command = 'experimental <command>';
const aliases = exports.aliases = ['exp'];
const description = exports.description = 'Run or setup experimental features';
const builder = yargs => yargs.commandDir('./experimental', {
  recurse: true,
  // @NOTE This regex will ignore all commands nested more than two
  // levels deep.
  // e.g. /setup/hi.js & setup/hi/hi.js are picked up, but
  // setup/hi/hello/bazinga.js will be ignored
  // The [/\\] bit is for supporting both windows and unix style paths
  // Also take care to not trip up on paths that have "setup" earlier
  // in the path by eagerly matching in the start of the regexp
  exclude: /.*[/\\]experimental[/\\].*[/\\].*[/\\]/
}).demandCommand().middleware(_detectProjectRwVersion.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#experimental')}`);
exports.builder = builder;