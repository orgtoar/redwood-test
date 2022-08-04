"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.yargsDefaults = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _project = require("../lib/project");

const command = 'generate <type>';
exports.command = command;
const aliases = ['g'];
exports.aliases = aliases;
const description = 'Generate boilerplate code and type definitions';
exports.description = description;

const builder = yargs => yargs.command('types', 'Generate supplementary code', {}, () => {
  _execa.default.sync('yarn rw-gen', {
    shell: true,
    stdio: 'inherit'
  });
}).commandDir('./generate', {
  recurse: true,

  /*
  @NOTE This regex will ignore all double nested commands
  e.g. /generate/hi.js & generate/hi/hi.js are picked up,
  but generate/hi/utils/whatever.js will be ignored
  The [\/\\] bit is for supporting both windows and unix style paths
  */
  exclude: /generate[\/\\]+.*[\/\\]+.*[\/\\]/
}).demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-alias-g')}`);
/** @type {Record<string, import('yargs').Options>} */


exports.builder = builder;
const yargsDefaults = {
  force: {
    alias: 'f',
    default: false,
    description: 'Overwrite existing files',
    type: 'boolean'
  },
  typescript: {
    alias: 'ts',
    default: (0, _project.isTypeScriptProject)(),
    description: 'Generate TypeScript files',
    type: 'boolean'
  }
};
exports.yargsDefaults = yargsDefaults;