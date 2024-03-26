"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = exports.aliases = void 0;
var _execa = _interopRequireDefault(require("execa"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'generate <type>';
const aliases = exports.aliases = ['g'];
const description = exports.description = 'Generate boilerplate code and type definitions';
const builder = yargs => yargs.command('types', 'Generate supplementary code', {}, () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'generate types'
  });
  try {
    _execa.default.sync('yarn rw-gen', {
      shell: true,
      stdio: 'inherit'
    });
  } catch (error) {
    // rw-gen is responsible for logging its own errors but we need to
    // make sure we exit with a non-zero exit code
    process.exitCode = error.exitCode ?? 1;
  }
}).commandDir('./generate', {
  recurse: true,
  // @NOTE This regex will ignore all commands nested more than two
  // levels deep.
  // e.g. /generate/hi.js & setup/hi/hi.js are picked up, but
  // generate/hi/hello/bazinga.js will be ignored
  // The [/\\] bit is for supporting both windows and unix style paths
  // Also take care to not trip up on paths that have "setup" earlier
  // in the path by eagerly matching in the start of the regexp
  exclude: /.*[/\\]generate[/\\].*[/\\].*[/\\]/
}).demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-alias-g')}`);
exports.builder = builder;