"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _colors = _interopRequireDefault(require("../lib/colors"));

var _project = require("../lib/project");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const command = 'test [filter..]';
exports.command = command;
const description = 'Run Jest tests. Defaults to watch mode';
exports.description = description;

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
  } = await Promise.resolve().then(() => _interopRequireWildcard(require('./testHandler')));
  return handler(options);
};

exports.handler = handler;