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
var withFunctions_exports = {};
__export(withFunctions_exports, {
  default: () => withFunctions_default
});
module.exports = __toCommonJS(withFunctions_exports);
var import_url_data = __toESM(require("@fastify/url-data"));
var import_fastify_raw_body = __toESM(require("fastify-raw-body"));
var import_fastify = require("../fastify");
var import_lambdaLoader = require("./lambdaLoader");
const withFunctions = async (fastify, options) => {
  const { apiRootPath } = options;
  if (!fastify.hasPlugin("@fastify/url-data")) {
    await fastify.register(import_url_data.default);
  }
  await fastify.register(import_fastify_raw_body.default);
  fastify.addContentTypeParser(
    ["application/x-www-form-urlencoded", "multipart/form-data"],
    { parseAs: "string" },
    fastify.defaultTextParser
  );
  const { configureFastify } = (0, import_fastify.loadFastifyConfig)();
  if (configureFastify) {
    await configureFastify(fastify, { side: "api", ...options });
  }
  fastify.all(`${apiRootPath}:routeName`, import_lambdaLoader.lambdaRequestHandler);
  fastify.all(`${apiRootPath}:routeName/*`, import_lambdaLoader.lambdaRequestHandler);
  await (0, import_lambdaLoader.loadFunctionsFromDist)();
  return fastify;
};
var withFunctions_default = withFunctions;
