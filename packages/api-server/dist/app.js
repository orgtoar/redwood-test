"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = exports.createApp = void 0;

var _fastify = _interopRequireDefault(require("fastify"));

const DEFAULT_OPTIONS = {
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn'
  }
};

const createApp = options => {
  const app = (0, _fastify.default)(options || DEFAULT_OPTIONS);
  return app;
};

exports.createApp = createApp;
var _default = createApp;
exports.default = _default;