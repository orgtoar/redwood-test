"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _project = require("../lib/project");

var _checkForBabelConfig = _interopRequireDefault(require("../middleware/checkForBabelConfig"));

const command = 'build [side..]';
exports.command = command;
const description = 'Build for production';
exports.description = description;

const builder = yargs => {
  const choices = (0, _project.sides)();
  yargs.positional('side', {
    choices,
    default: choices,
    description: 'Which side(s) to build',
    type: 'array'
  }).option('stats', {
    default: false,
    description: `Use ${(0, _terminalLink.default)('Webpack Bundle Analyzer', 'https://github.com/webpack-contrib/webpack-bundle-analyzer')}`,
    type: 'boolean'
  }).option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more',
    type: 'boolean'
  }).option('prerender', {
    default: true,
    description: 'Prerender after building web',
    type: 'boolean'
  }).option('prisma', {
    type: 'boolean',
    alias: 'db',
    default: true,
    description: 'Generate the Prisma client'
  }).option('performance', {
    alias: 'perf',
    type: 'boolean',
    default: false,
    description: 'Measure build performance'
  }).middleware(_checkForBabelConfig.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#build')}`);
};

exports.builder = builder;

const handler = async options => {
  const {
    handler
  } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('./buildHandler')));
  return handler(options);
};

exports.handler = handler;