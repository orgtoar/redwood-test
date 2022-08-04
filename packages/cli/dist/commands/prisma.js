"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

const command = 'prisma [commands..]';
exports.command = command;
const description = 'Run Prisma CLI with experimental features';
/**
 * This is a lightweight wrapper around Prisma's CLI with some Redwood CLI modifications.
 */

exports.description = description;

const builder = yargs => {
  // Disable yargs parsing of commands and options because it's forwarded
  // to Prisma CLI.
  yargs.strictOptions(false).strictCommands(false).strict(false).parserConfiguration({
    'camel-case-expansion': false
  }).help(false).version(false);
};

exports.builder = builder;

const handler = async options => {
  const {
    handler
  } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('./prismaHandler.js')));
  return handler(options);
};

exports.handler = handler;