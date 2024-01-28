"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var server_exports = {};
__export(server_exports, {
  startServer: () => startServer
});
module.exports = __toCommonJS(server_exports);
const startServer = async ({
  port = 8911,
  socket,
  fastify
}) => {
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "::";
  const serverPort = socket ? parseInt(socket) : port;
  await fastify.listen({
    port: serverPort,
    host,
    listenTextResolver: (address) => {
      if (process.env.NODE_ENV !== "production") {
        address = address.replace(/http:\/\/\[::\]/, "http://localhost");
      }
      return `Server listening at ${address}`;
    }
  });
  fastify.ready(() => {
    fastify.log.trace(
      { custom: { ...fastify.initialConfig } },
      "Fastify server configuration"
    );
    fastify.log.trace(`Registered plugins 
${fastify.printPlugins()}`);
  });
  return fastify;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startServer
});
