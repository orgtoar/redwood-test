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

const command = 'exec [name]';
exports.command = command;
const description = 'Run scripts generated with yarn generate script';
exports.description = description;

const builder = yargs => {
  yargs.positional('name', {
    description: 'The file name (extension is optional) of the script to run',
    type: 'string'
  }).option('prisma', {
    type: 'boolean',
    default: true,
    description: 'Generate the Prisma client'
  }).option('list', {
    alias: 'l',
    type: 'boolean',
    default: false,
    description: 'List available scripts'
  }).strict(false).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#up')}`);
};

exports.builder = builder;

const handler = async options => {
  const {
    handler
  } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('./execHandler')));
  return handler(options);
};

exports.handler = handler;