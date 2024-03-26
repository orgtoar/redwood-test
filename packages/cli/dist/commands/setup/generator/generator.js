"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'generator <name>';
const description = exports.description = 'Copies generator templates locally for customization';
const EXCLUDE_GENERATORS = ['dataMigration', 'dbAuth', 'generator', 'script', 'secret'];

// This could be built using createYargsForComponentGeneration;
// however, functions wouldn't have a `stories` option. createYargs...
// should be reversed to provide `yargsDefaults` as the default configuration
// and accept a configuration such as its CURRENT default to append onto a command.
const builder = yargs => {
  var _context, _context2;
  const availableGenerators = (0, _map.default)(_context = (0, _filter.default)(_context2 = _fsExtra.default.readdirSync(_path.default.join(__dirname, '../../generate'), {
    withFileTypes: true
  })).call(_context2, dir => dir.isDirectory() && !dir.name.match(/__/))).call(_context, dir => dir.name);
  yargs.positional('name', {
    description: 'Name of the generator to copy templates from',
    choices: (0, _filter.default)(availableGenerators).call(availableGenerators, dir => !(0, _includes.default)(EXCLUDE_GENERATORS).call(EXCLUDE_GENERATORS, dir))
  }).option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing files',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-generator')}`);
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup generator',
    name: options.name,
    force: options.force
  });
  const {
    handler
  } = await import('./generatorHandler.js');
  return handler(options);
};
exports.handler = handler;