"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var cliHandlers_exports = {};
__export(cliHandlers_exports, {
  apiCliOptions: () => apiCliOptions,
  apiServerHandler: () => apiServerHandler,
  bothServerHandler: () => bothServerHandler,
  commonOptions: () => commonOptions,
  createServer: () => import_createServer.createServer
});
module.exports = __toCommonJS(cliHandlers_exports);
var import_chalk = __toESM(require("chalk"));
var import_fastify_web = require("@redwoodjs/fastify-web");
var import_project_config = require("@redwoodjs/project-config");
var import_fastify = __toESM(require("./fastify"));
var import_api = require("./plugins/api");
var import_createServer = require("./createServer");
function sendProcessReady() {
  process.send && process.send("ready");
}
const commonOptions = {
  port: {
    description: "The port to listen on",
    type: "number",
    alias: "p",
    default: (0, import_project_config.getConfig)().web?.port
  }
};
const apiCliOptions = {
  port: commonOptions.port,
  apiRootPath: {
    description: "Prefix for all api routes",
    type: "string",
    alias: ["api-root-path", "rootPath", "root-path"],
    default: "/"
  },
  // No-ops (env files are always loaded), but here so that we don't break existing projects
  loadEnvFiles: {
    hidden: true
  }
};
const apiServerHandler = async (options) => {
  const tsApiServer = Date.now();
  console.log(import_chalk.default.dim.italic("Starting API server..."));
  const apiRootPath = (0, import_fastify_web.coerceRootPath)(options.apiRootPath);
  const fastify = (0, import_fastify.default)();
  await fastify.register(import_api.redwoodFastifyAPI, { redwood: options });
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "::";
  await fastify.listen({
    port: options.port,
    host,
    listenTextResolver: (address) => {
      if (process.env.NODE_ENV !== "production") {
        address = address.replace(/http:\/\/\[::\]/, "http://localhost");
      }
      return `Server listening at ${address}`;
    }
  });
  fastify.ready(() => {
    console.log(import_chalk.default.dim.italic("Took " + (Date.now() - tsApiServer) + " ms"));
    let address = fastify.listeningOrigin;
    if (process.env.NODE_ENV !== "production") {
      address = address.replace(/http:\/\/\[::\]/, "http://localhost");
    }
    const apiServer = import_chalk.default.magenta(`${address}${apiRootPath}`);
    const graphqlEndpoint = import_chalk.default.magenta(`${apiServer}graphql`);
    console.log(`API server listening at ${apiServer}`);
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`);
    sendProcessReady();
  });
};
const bothServerHandler = async (options) => {
  const tsServer = Date.now();
  console.log(import_chalk.default.dim.italic("Starting API and Web servers..."));
  const apiRootPath = (0, import_fastify_web.coerceRootPath)((0, import_project_config.getConfig)().web.apiUrl);
  const fastify = (0, import_fastify.default)();
  await fastify.register(import_fastify_web.redwoodFastifyWeb);
  await fastify.register(import_api.redwoodFastifyAPI, { redwood: { apiRootPath } });
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "::";
  await fastify.listen({
    port: options.port,
    host,
    listenTextResolver: (address) => {
      if (process.env.NODE_ENV !== "production") {
        address = address.replace(/http:\/\/\[::\]/, "http://localhost");
      }
      return `Server listening at ${address}`;
    }
  });
  fastify.ready(() => {
    console.log(import_chalk.default.dim.italic("Took " + (Date.now() - tsServer) + " ms"));
    const webServer = import_chalk.default.green(fastify.listeningOrigin);
    const apiServer = import_chalk.default.magenta(`${fastify.listeningOrigin}${apiRootPath}`);
    const graphqlEndpoint = import_chalk.default.magenta(`${apiServer}graphql`);
    console.log(`Web server listening at ${webServer}`);
    console.log(`API server listening at ${apiServer}`);
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`);
    sendProcessReady();
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  apiCliOptions,
  apiServerHandler,
  bothServerHandler,
  commonOptions,
  createServer
});
