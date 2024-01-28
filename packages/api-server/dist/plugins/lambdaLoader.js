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
var lambdaLoader_exports = {};
__export(lambdaLoader_exports, {
  LAMBDA_FUNCTIONS: () => LAMBDA_FUNCTIONS,
  lambdaRequestHandler: () => lambdaRequestHandler,
  loadFunctionsFromDist: () => loadFunctionsFromDist,
  setLambdaFunctions: () => setLambdaFunctions
});
module.exports = __toCommonJS(lambdaLoader_exports);
var import_path = __toESM(require("path"));
var import_chalk = __toESM(require("chalk"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_lodash = require("lodash");
var import_project_config = require("@redwoodjs/project-config");
var import_awsLambdaFastify = require("../requestHandlers/awsLambdaFastify");
const LAMBDA_FUNCTIONS = {};
const setLambdaFunctions = async (foundFunctions) => {
  const tsImport = Date.now();
  console.log(import_chalk.default.dim.italic("Importing Server Functions..."));
  const imports = foundFunctions.map((fnPath) => {
    return new Promise((resolve) => {
      const ts = Date.now();
      const routeName = import_path.default.basename(fnPath).replace(".js", "");
      const { handler } = require(fnPath);
      LAMBDA_FUNCTIONS[routeName] = handler;
      if (!handler) {
        console.warn(
          routeName,
          "at",
          fnPath,
          "does not have a function called handler defined."
        );
      }
      console.log(
        import_chalk.default.magenta("/" + routeName),
        import_chalk.default.dim.italic(Date.now() - ts + " ms")
      );
      return resolve(true);
    });
  });
  Promise.all(imports).then((_results) => {
    console.log(
      import_chalk.default.dim.italic(
        "...Done importing in " + (Date.now() - tsImport) + " ms"
      )
    );
  });
};
const loadFunctionsFromDist = async (options = {}) => {
  const serverFunctions = findApiDistFunctions(
    (0, import_project_config.getPaths)().api.base,
    options?.fastGlobOptions
  );
  const i = serverFunctions.findIndex((x) => x.indexOf("graphql") !== -1);
  if (i >= 0) {
    const graphQLFn = serverFunctions.splice(i, 1)[0];
    serverFunctions.unshift(graphQLFn);
  }
  await setLambdaFunctions(serverFunctions);
};
function findApiDistFunctions(cwd = (0, import_project_config.getPaths)().api.base, options = {}) {
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
  setLambdaFunctions
});
