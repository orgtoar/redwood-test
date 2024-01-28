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
var graphql_exports = {};
__export(graphql_exports, {
  redwoodFastifyGraphQLServer: () => redwoodFastifyGraphQLServer
});
module.exports = __toCommonJS(graphql_exports);
var import_url_data = __toESM(require("@fastify/url-data"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_fastify_raw_body = __toESM(require("fastify-raw-body"));
var import_graphql_server = require("@redwoodjs/graphql-server");
var import_project_config = require("@redwoodjs/project-config");
var import_awsLambdaFastify = require("./awsLambdaFastify");
async function redwoodFastifyGraphQLServer(fastify, options, done) {
  await fastify.register(import_url_data.default);
  await fastify.register(import_fastify_raw_body.default);
  try {
    const method = ["GET", "POST", "OPTIONS"];
    if (!options.redwood.graphql) {
      const [graphqlFunctionPath] = await (0, import_fast_glob.default)("dist/functions/graphql.{ts,js}", {
        cwd: (0, import_project_config.getPaths)().api.base,
        absolute: true
      });
      const { __rw_graphqlOptions } = await import(graphqlFunctionPath);
      options.redwood.graphql = __rw_graphqlOptions;
    }
    const graphqlOptions = options.redwood.graphql;
    if (graphqlOptions?.realtime) {
      const { useRedwoodRealtime } = await import("@redwoodjs/realtime");
      const originalExtraPlugins = graphqlOptions.extraPlugins || [];
      originalExtraPlugins.push(useRedwoodRealtime(graphqlOptions.realtime));
      graphqlOptions.extraPlugins = originalExtraPlugins;
      if (graphqlOptions.realtime.subscriptions) {
        method.push("PUT");
      }
    }
    const { yoga } = (0, import_graphql_server.createGraphQLYoga)(graphqlOptions);
    const graphQLYogaHandler = async (req, reply) => {
      const response = await yoga.handleNodeRequest(req, {
        req,
        reply,
        event: (0, import_awsLambdaFastify.lambdaEventForFastifyRequest)(req),
        requestContext: {}
      });
      for (const [name, value] of response.headers) {
        reply.header(name, value);
      }
      reply.status(response.status);
      reply.send(response.body);
      return reply;
    };
    const routePaths = ["", "/health", "/readiness", "/stream"];
    for (const routePath of routePaths) {
      fastify.route({
        url: `${options.redwood.apiRootPath}${formatGraphQLEndpoint(
          yoga.graphqlEndpoint
        )}${routePath}`,
        method,
        handler: async (req, reply) => await graphQLYogaHandler(req, reply)
      });
    }
    fastify.addHook("onReady", (done2) => {
      console.info(`GraphQL Yoga Server endpoint at ${yoga.graphqlEndpoint}`);
      console.info(
        `GraphQL Yoga Server Health Check endpoint at ${yoga.graphqlEndpoint}/health`
      );
      console.info(
        `GraphQL Yoga Server Readiness endpoint at ${yoga.graphqlEndpoint}/readiness`
      );
      done2();
    });
    done();
  } catch (e) {
    console.log(e);
  }
}
function formatGraphQLEndpoint(endpoint) {
  return endpoint.replace(/^\//, "").replace(/\/$/, "");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  redwoodFastifyGraphQLServer
});
