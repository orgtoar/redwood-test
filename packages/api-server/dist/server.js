"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.startServer = void 0;

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

const startServer = ({
  port = 8911,
  socket,
  fastify
}) => {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::';
  const serverPort = socket ? (0, _parseInt2.default)(socket) : port;
  fastify.listen({
    port: serverPort,
    host
  });
  fastify.ready(() => {
    fastify.log.debug({
      custom: { ...fastify.initialConfig
      }
    }, 'Fastify server configuration');
    fastify.log.debug(`Registered plugins \n${fastify.printPlugins()}`);
  });
  return fastify;
};

exports.startServer = startServer;