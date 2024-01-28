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
var api_exports = {};
__export(api_exports, {
  LAMBDA_FUNCTIONS: () => LAMBDA_FUNCTIONS,
  lambdaRequestHandler: () => lambdaRequestHandler,
  loadFunctionsFromDist: () => loadFunctionsFromDist,
  redwoodFastifyAPI: () => redwoodFastifyAPI,
  setLambdaFunctions: () => setLambdaFunctions
});
module.exports = __toCommonJS(api_exports);
var import_path = __toESM(require("path"));
var import_url_data = __toESM(require("@fastify/url-data"));
var import_chalk = __toESM(require("chalk"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_fastify_raw_body = __toESM(require("fastify-raw-body"));
var import_lodash = require("lodash");
var import_helpers = require("@redwoodjs/fastify-web/helpers");
var import_project_config = require("@redwoodjs/project-config");
var import_fastify = require("../fastify");
var import_awsLambdaFastify = require("./awsLambdaFastify");
async function redwoodFastifyAPI(fastify, opts, done) {
  const redwoodOptions = opts.redwood ?? {};
  redwoodOptions.apiRootPath ??= "/";
  redwoodOptions.apiRootPath = (0, import_helpers.coerceRootPath)(redwoodOptions.apiRootPath);
  redwoodOptions.loadUserConfig ??= false;
  fastify.register(import_url_data.default);
  await fastify.register(import_fastify_raw_body.default);
  fastify.addContentTypeParser(
    ["application/x-www-form-urlencoded", "multipart/form-data"],
    { parseAs: "string" },
    fastify.defaultTextParser
  );
  if (redwoodOptions.loadUserConfig) {
    const { configureFastify } = (0, import_fastify.loadUserConfig)();
    if (configureFastify) {
      await configureFastify(fastify, {
        side: "api",
        apiRootPath: redwoodOptions.apiRootPath
      });
    }
  }
  fastify.all(`${redwoodOptions.apiRootPath}:routeName`, lambdaRequestHandler);
  fastify.all(`${redwoodOptions.apiRootPath}:routeName/*`, lambdaRequestHandler);
  await loadFunctionsFromDist({
    fastGlobOptions: {
      ignore: ["**/dist/functions/graphql.js"]
    }
  });
  done();
}
const LAMBDA_FUNCTIONS = {};
const setLambdaFunctions = async (apiDistFunctions) => {
  const tsImport = Date.now();
  console.log(import_chalk.default.dim.italic("Importing api functions..."));
  const imports = apiDistFunctions.map(async (fnPath) => {
    const ts = Date.now();
    const routeName = import_path.default.basename(fnPath).replace(".js", "");
    const { handler } = await import(fnPath);
    if (!handler) {
      console.warn(
        `${routeName} at ${fnPath} doesn't export a function called \`handler\``
      );
      return;
    }
    LAMBDA_FUNCTIONS[routeName] = handler;
    console.log(import_chalk.default.magenta(`/{routeName}`));
    console.log(import_chalk.default.dim.italic(Date.now() - ts + " ms"));
  });
  await Promise.all(imports);
  console.log(
    import_chalk.default.dim.italic("Done importing in " + (Date.now() - tsImport) + " ms")
  );
};
const loadFunctionsFromDist = async (options = {}) => {
  const apiDistFunctions = getApiDistFunctions(
    (0, import_project_config.getPaths)().api.base,
    options?.fastGlobOptions
  );
  await setLambdaFunctions(apiDistFunctions);
};
function getApiDistFunctions(cwd = (0, import_project_config.getPaths)().api.base, options = {}) {
  return import_fast_glob.default.sync("dist/functions/**/*.{ts,js}", {
    cwd,
    deep: 2,
    // We don't support deeply nested api functions, to maximise compatibility with deployment providers
    absolute: true,
    ...options
  });
}
const lambdaRequestHandler = async (req, reply) => {
  const { routeName } = req.params;
  if (!LAMBDA_FUNCTIONS[routeName]) {
    const errorMessage = `Function "${routeName}" was not found.`;
    req.log.error(errorMessage);
    reply.status(404);
    if (process.env.NODE_ENV === "development") {
      const devError = {
        error: errorMessage,
        availableFunctions: Object.keys(LAMBDA_FUNCTIONS)
      };
      reply.send(devError);
    } else {
      reply.send((0, import_lodash.escape)(errorMessage));
    }
    return;
  }
  return (0, import_awsLambdaFastify.requestHandler)(req, reply, LAMBDA_FUNCTIONS[routeName]);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LAMBDA_FUNCTIONS,
  lambdaRequestHandler,
  loadFunctionsFromDist,
  redwoodFastifyAPI,
  setLambdaFunctions
});
