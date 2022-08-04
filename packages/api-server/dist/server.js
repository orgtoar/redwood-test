"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startServer = void 0;

const startServer = ({
  port = 8911,
  socket,
  fastify
}) => {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::';
  const serverPort = socket ? parseInt(socket) : port;
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