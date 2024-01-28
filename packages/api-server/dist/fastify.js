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
var fastify_exports = {};
__export(fastify_exports, {
  DEFAULT_OPTIONS: () => DEFAULT_OPTIONS,
  createFastifyInstance: () => createFastifyInstance,
  default: () => fastify_default,
  loadUserConfig: () => loadUserConfig
});
module.exports = __toCommonJS(fastify_exports);
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_chalk = __toESM(require("chalk"));
var import_fastify = __toESM(require("fastify"));
var import_project_config = require("@redwoodjs/project-config");
const DEFAULT_OPTIONS = {
  requestTimeout: 15e3,
  logger: {
    level: process.env.LOG_LEVEL ?? process.env.NODE_ENV === "development" ? "debug" : "info"
  }
};
let serverConfigLoaded = false;
let serverConfigFile = {
  config: DEFAULT_OPTIONS,
  configureFastify: async (fastify, options) => {
    fastify.log.trace(
      options,
      `In \`configureFastify\` hook for side: ${options?.side}`
    );
    return fastify;
  }
};
function loadUserConfig() {
  if (serverConfigLoaded) {
    return serverConfigFile;
  }
  const serverConfigPath = import_path.default.join(
    (0, import_project_config.getPaths)().base,
    (0, import_project_config.getConfig)().api.serverConfig
  );
  if (!import_fs.default.existsSync(serverConfigPath)) {
    serverConfigLoaded = true;
    return serverConfigFile;
  }
  console.log(`Loading server config from ${serverConfigPath}`);
  console.warn(
    import_chalk.default.yellow(
      [
        "Using the 'server.config.js' file to configure the server is deprecated. Consider migrating to the new server file:",
        "",
        "  yarn rw setup server-file",
        ""
      ].join("\n")
    )
  );
  serverConfigFile = { ...require(serverConfigPath) };
  serverConfigLoaded = true;
  return serverConfigFile;
}
const createFastifyInstance = (options) => {
  const { config } = loadUserConfig();
  const fastify = (0, import_fastify.default)(options ?? config ?? DEFAULT_OPTIONS);
  return fastify;
};
var fastify_default = createFastifyInstance;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_OPTIONS,
  createFastifyInstance,
  loadUserConfig
});
