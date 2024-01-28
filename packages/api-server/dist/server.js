"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.startServer = void 0;
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
const startServer = async ({
  port = 8911,
  socket,
  fastify
}) => {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::';
  const serverPort = socket ? (0, _parseInt2.default)(socket) : port;
  await fastify.listen({
    port: serverPort,
    host,
    listenTextResolver: address => {
      // In the past, in development, we've prioritized showing a friendlier
      // host than the listen-on-all-ipv6-addresses '[::]'. Here we replace it
      // with 'localhost' only if 1) we're not in production and 2) it's there.
      // In production it's important to be transparent.
      if (process.env.NODE_ENV !== 'production') {
        address = address.replace(/http:\/\/\[::\]/, 'http://localhost');
      }
      return `Server listening at ${address}`;
    }
  });
  fastify.ready(() => {
    fastify.log.trace({
      custom: {
        ...fastify.initialConfig
      }
    }, 'Fastify server configuration');
    fastify.log.trace(`Registered plugins \n${fastify.printPlugins()}`);
  });
  return fastify;
};
exports.startServer = startServer;