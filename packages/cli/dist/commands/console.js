"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.aliases = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

const command = 'console';
exports.command = command;
const aliases = ['c'];
exports.aliases = aliases;
const description = 'Launch an interactive Redwood shell (experimental)';
exports.description = description;

const handler = async options => {
  const {
    handler
  } = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('./consoleHandler')));
  return handler(options);
};

exports.handler = handler;