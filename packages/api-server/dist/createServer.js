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
var createServer_exports = {};
__export(createServer_exports, {
  DEFAULT_CREATE_SERVER_OPTIONS: () => DEFAULT_CREATE_SERVER_OPTIONS,
  createServer: () => createServer,
  resolveOptions: () => resolveOptions
});
module.exports = __toCommonJS(createServer_exports);
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_util = require("util");
var import_chalk = __toESM(require("chalk"));
var import_dotenv_defaults = require("dotenv-defaults");
var import_fast_glob = __toESM(require("fast-glob"));
var import_fastify = __toESM(require("fastify"));
var import_store = require("@redwoodjs/context/dist/store");
var import_project_config = require("@redwoodjs/project-config");
var import_api = require("./plugins/api");
if (process.env.RWJS_CWD && !process.env.REDWOOD_ENV_FILES_LOADED) {
  (0, import_dotenv_defaults.config)({
    path: import_path.default.join((0, import_project_config.getPaths)().base, ".env"),
    defaults: import_path.default.join((0, import_project_config.getPaths)().base, ".env.defaults"),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = "true";
}
async function createServer(options = {}) {
  const { apiRootPath, fastifyServerOptions, port } = resolveOptions(options);
  const serverConfigPath = import_path.default.join(
    (0, import_project_config.getPaths)().base,
    (0, import_project_config.getConfig)().api.serverConfig
  );
  if (import_fs.default.existsSync(serverConfigPath)) {
    console.warn(
      import_chalk.default.yellow(
        [
          "",
          `Ignoring \`config\` and \`configureServer\` in api/server.config.js.`,
          `Migrate them to api/src/server.{ts,js}:`,
          "",
          `\`\`\`js title="api/src/server.{ts,js}"`,
          "// Pass your config to `createServer`",
          "const server = createServer({",
          "  fastifyServerOptions: myFastifyConfig",
          "})",
          "",
          "// Then inline your `configureFastify` logic:",
          "server.register(myFastifyPlugin)",
          "```",
          ""
        ].join("\n")
      )
    );
  }
  const server = Object.assign((0, import_fastify.default)(fastifyServerOptions), {
    // `start` will get replaced further down in this file
    start: async () => {
      throw new Error("Not implemented yet");
    }
  });
  server.addHook("onRequest", (_req, _reply, done) => {
    (0, import_store.getAsyncStoreInstance)().run(/* @__PURE__ */ new Map(), done);
  });
  await server.register(import_api.redwoodFastifyAPI, {
    redwood: { apiRootPath }
  });
  const [graphqlFunctionPath] = await (0, import_fast_glob.default)("dist/functions/graphql.{ts,js}", {
    cwd: (0, import_project_config.getPaths)().api.base,
    absolute: true
  });
  if (graphqlFunctionPath) {
    const { redwoodFastifyGraphQLServer } = require("./plugins/graphql");
    const { __rw_graphqlOptions } = require(graphqlFunctionPath);
    await server.register(redwoodFastifyGraphQLServer, {
      redwood: {
        apiRootPath,
        graphql: __rw_graphqlOptions
      }
    });
  }
  server.addHook("onReady", (done) => {
    process.send?.("ready");
    done();
  });
  server.addHook("onListen", (done) => {
    console.log(
      `Server listening at ${import_chalk.default.magenta(
        `${server.listeningOrigin}${apiRootPath}`
      )}`
    );
    done();
  });
  server.start = (options2 = {}) => {
    return server.listen({
      ...options2,
      port,
      host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "::"
    });
  };
  return server;
}
function resolveOptions(options = {}, args) {
  options.logger ??= DEFAULT_CREATE_SERVER_OPTIONS.logger;
  let defaultPort;
  if (process.env.REDWOOD_API_PORT === void 0) {
    defaultPort = (0, import_project_config.getConfig)().api.port;
  } else {
    defaultPort = parseInt(process.env.REDWOOD_API_PORT);
  }
  const resolvedOptions = {
    apiRootPath: options.apiRootPath ?? DEFAULT_CREATE_SERVER_OPTIONS.apiRootPath,
    fastifyServerOptions: options.fastifyServerOptions ?? {
      requestTimeout: DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout,
      logger: options.logger ?? DEFAULT_CREATE_SERVER_OPTIONS.logger
    },
    port: defaultPort
  };
  resolvedOptions.fastifyServerOptions.requestTimeout ??= DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout;
  resolvedOptions.fastifyServerOptions.logger = options.logger;
  const { values } = (0, import_util.parseArgs)({
    options: {
      apiRootPath: {
        type: "string"
      },
      port: {
        type: "string",
        short: "p"
      }
    },
    // When running Jest, `process.argv` is...
    //
    // ```js
    // [
    //    'path/to/node'
    //    'path/to/jest.js'
    //    'file/under/test.js'
    // ]
    // ```
    //
    // `parseArgs` strips the first two, leaving the third, which is interpreted as a positional argument.
    // Which fails our options. We'd still like to be strict, but can't do it for tests.
    strict: process.env.NODE_ENV === "test" ? false : true,
    ...args && { args }
  });
  if (values.apiRootPath && typeof values.apiRootPath !== "string") {
    throw new Error("`apiRootPath` must be a string");
  }
  if (values.apiRootPath) {
    resolvedOptions.apiRootPath = values.apiRootPath;
  }
  if (resolvedOptions.apiRootPath.charAt(0) !== "/") {
    resolvedOptions.apiRootPath = `/${resolvedOptions.apiRootPath}`;
  }
  if (resolvedOptions.apiRootPath.charAt(
    resolvedOptions.apiRootPath.length - 1
  ) !== "/") {
    resolvedOptions.apiRootPath = `${resolvedOptions.apiRootPath}/`;
  }
  if (values.port) {
    resolvedOptions.port = +values.port;
    if (isNaN(resolvedOptions.port)) {
      throw new Error("`port` must be an integer");
    }
  }
  return resolvedOptions;
}
const DEFAULT_CREATE_SERVER_OPTIONS = {
  apiRootPath: "/",
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "warn"
  },
  fastifyServerOptions: {
    requestTimeout: 15e3
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_CREATE_SERVER_OPTIONS,
  createServer,
  resolveOptions
});
