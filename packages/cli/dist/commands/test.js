"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _colors = _interopRequireDefault(require("../lib/colors"));
var _project = require("../lib/project");
const command = exports.command = 'test [filter..]';
const description = exports.description = 'Run Jest tests. Defaults to watch mode';
const builder = yargs => {
  yargs.strict(false) // so that we can forward arguments to jest
  .positional('filter', {
    default: (0, _project.sides)(),
    description: 'Which side(s) to test, and/or a regular expression to match against your test files to filter by',
    type: 'array'
  }).option('watch', {
    describe: 'Run tests related to changed files based on hg/git. Specify the name or path to a file to focus on a specific set of tests',
    type: 'boolean',
    default: true
  }).option('collect-coverage', {
    describe: 'Show test coverage summary and output info to coverage directory',
    type: 'boolean',
    default: false
  }).option('db-push', {
    describe: "Syncs the test database with your Prisma schema without requiring a migration. It creates a test database if it doesn't already exist.",
    type: 'boolean',
    default: true
  }).epilogue(`For all available flags, run jest cli directly ${_colors.default.green('yarn jest --help')}\n\nAlso see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#test')}\n`);
};
exports.builder = builder;
const handler = async options => {
  const {
    handler
  } = await import('./testHandler.js');
  return handler(options);
};
exports.handler = handler;