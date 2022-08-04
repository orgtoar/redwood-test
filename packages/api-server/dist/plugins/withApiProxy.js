"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _httpProxy = _interopRequireDefault(require("@fastify/http-proxy"));

const withApiProxy = async (fastify, {
  apiUrl,
  apiHost
}) => {
  const proxyOpts = {
    upstream: apiHost,
    prefix: apiUrl,
    disableCache: true
  };
  fastify.register(_httpProxy.default, proxyOpts);
  return fastify;
};

var _default = withApiProxy;
exports.default = _default;