#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
module.exports = __toCommonJS(src_exports);
var import_path = __toESM(require("path"));
var import_dotenv_defaults = require("dotenv-defaults");
var import_helpers = require("yargs/helpers");
var import_yargs = __toESM(require("yargs/yargs"));
var import_project_config = require("@redwoodjs/project-config");
var webServerCLIConfig = __toESM(require("@redwoodjs/web-server"));
var import_cliHandlers = require("./cliHandlers");
__reExport(src_exports, require("./types"), module.exports);
if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  (0, import_dotenv_defaults.config)({
    path: import_path.default.join((0, import_project_config.getPaths)().base, ".env"),
    defaults: import_path.default.join((0, import_project_config.getPaths)().base, ".env.defaults"),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = "true";
}
if (require.main === module) {
  (0, import_yargs.default)((0, import_helpers.hideBin)(process.argv)).scriptName("rw-server").usage("usage: $0 <side>").strict().command(
    "$0",
    "Run both api and web servers",
    // @ts-expect-error just passing yargs though
    (yargs2) => {
      yargs2.options(import_cliHandlers.commonOptions);
    },
    import_cliHandlers.bothServerHandler
  ).command(
    "api",
    "Start server for serving only the api",
    // @ts-expect-error just passing yargs though
    (yargs2) => {
      yargs2.options(import_cliHandlers.apiCliOptions);
    },
    import_cliHandlers.apiServerHandler
  ).command(
    "web",
    webServerCLIConfig.description,
    // @ts-expect-error just passing yargs though
    webServerCLIConfig.builder,
    webServerCLIConfig.handler
  ).parse();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./types")
});
