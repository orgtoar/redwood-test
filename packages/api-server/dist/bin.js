#!/usr/bin/env node
#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
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

// src/plugins/awsLambdaFastify.ts
var import_qs, lambdaEventForFastifyRequest, fastifyResponseForLambdaResult, fastifyResponseForLambdaError, requestHandler, parseBody, mergeMultiValueHeaders;
var init_awsLambdaFastify = __esm({
  "src/plugins/awsLambdaFastify.ts"() {
    "use strict";
    import_qs = __toESM(require("qs"));
    lambdaEventForFastifyRequest = (request) => {
      return {
        httpMethod: request.method,
        headers: request.headers,
        path: request.urlData("path"),
        queryStringParameters: import_qs.default.parse(request.url.split(/\?(.+)/)[1]),
        requestContext: {
          requestId: request.id,
          identity: {
            sourceIp: request.ip
          }
        },
        ...parseBody(request.rawBody || "")
        // adds `body` and `isBase64Encoded`
      };
    };
    fastifyResponseForLambdaResult = (reply, lambdaResult) => {
      const {
        statusCode = 200,
        headers,
        body = "",
        multiValueHeaders
      } = lambdaResult;
      const mergedHeaders = mergeMultiValueHeaders(headers, multiValueHeaders);
      Object.entries(mergedHeaders).forEach(
        ([name, values]) => values.forEach((value) => reply.header(name, value))
      );
      reply.status(statusCode);
      if (lambdaResult.isBase64Encoded) {
        return reply.send(Buffer.from(body, "base64"));
      } else {
        return reply.send(body);
      }
    };
    fastifyResponseForLambdaError = (req, reply, error) => {
      req.log.error(error);
      reply.status(500).send();
    };
    requestHandler = async (req, reply, handler2) => {
      const event = lambdaEventForFastifyRequest(req);
      const handlerCallback = (reply2) => (error, lambdaResult) => {
        if (error) {
          fastifyResponseForLambdaError(req, reply2, error);
          return;
        }
        fastifyResponseForLambdaResult(reply2, lambdaResult);
      };
      const handlerPromise = handler2(
        event,
        // @ts-expect-error - Add support for context: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0bb210867d16170c4a08d9ce5d132817651a0f80/types/aws-lambda/index.d.ts#L443-L467
        {},
        handlerCallback(reply)
      );
      if (handlerPromise && typeof handlerPromise.then === "function") {
        try {
          const lambdaResponse = await handlerPromise;
          return fastifyResponseForLambdaResult(reply, lambdaResponse);
        } catch (error) {
          return fastifyResponseForLambdaError(req, reply, error);
        }
      }
    };
    parseBody = (rawBody) => {
      if (typeof rawBody === "string") {
        return { body: rawBody, isBase64Encoded: false };
      }
      if (rawBody instanceof Buffer) {
        return { body: rawBody.toString("base64"), isBase64Encoded: true };
      }
      return { body: "", isBase64Encoded: false };
    };
    mergeMultiValueHeaders = (headers, multiValueHeaders) => {
      const mergedHeaders = Object.entries(
        headers || {}
      ).reduce((acc, [name, value]) => {
        acc[name.toLowerCase()] = [value];
        return acc;
      }, {});
      Object.entries(multiValueHeaders || {}).forEach(([headerName, values]) => {
        const name = headerName.toLowerCase();
        if (name.toLowerCase() === "set-cookie") {
          mergedHeaders["set-cookie"] = values;
        } else {
          mergedHeaders[name] = [values.join("; ")];
        }
      });
      return mergedHeaders;
    };
  }
});

// src/bin.ts
var import_path4 = __toESM(require("path"));
var import_dotenv_defaults2 = require("dotenv-defaults");
var import_helpers2 = require("yargs/helpers");
var import_yargs = __toESM(require("yargs/yargs"));
var import_project_config5 = require("@redwoodjs/project-config");
var webServerCLIConfig = __toESM(require("@redwoodjs/web-server"));

// src/cliHandlers.ts
var import_chalk4 = __toESM(require("chalk"));
var import_fastify_web = require("@redwoodjs/fastify-web");
var import_project_config4 = require("@redwoodjs/project-config");

// src/fastify.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_chalk = __toESM(require("chalk"));
var import_fastify = __toESM(require("fastify"));
var import_project_config = require("@redwoodjs/project-config");
var DEFAULT_OPTIONS = {
  requestTimeout: 15e3,
  logger: {
    level: process.env.LOG_LEVEL ?? process.env.NODE_ENV === "development" ? "debug" : "info"
  }
};
var serverConfigLoaded = false;
var serverConfigFile = {
  config: DEFAULT_OPTIONS,
  configureFastify: async (fastify2, options) => {
    fastify2.log.trace(
      options,
      `In \`configureFastify\` hook for side: ${options?.side}`
    );
    return fastify2;
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
var createFastifyInstance = (options) => {
  const { config: config3 } = loadUserConfig();
  const fastify2 = (0, import_fastify.default)(options ?? config3 ?? DEFAULT_OPTIONS);
  return fastify2;
};
var fastify_default = createFastifyInstance;

// src/plugins/api.ts
var import_path2 = __toESM(require("path"));
var import_url_data = __toESM(require("@fastify/url-data"));
var import_chalk2 = __toESM(require("chalk"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_fastify_raw_body = __toESM(require("fastify-raw-body"));
var import_lodash = require("lodash");
var import_helpers = require("@redwoodjs/fastify-web/helpers");
var import_project_config2 = require("@redwoodjs/project-config");
init_awsLambdaFastify();
async function redwoodFastifyAPI(fastify2, opts, done) {
  const redwoodOptions = opts.redwood ?? {};
  redwoodOptions.apiRootPath ??= "/";
  redwoodOptions.apiRootPath = (0, import_helpers.coerceRootPath)(redwoodOptions.apiRootPath);
  redwoodOptions.loadUserConfig ??= false;
  fastify2.register(import_url_data.default);
  await fastify2.register(import_fastify_raw_body.default);
  fastify2.addContentTypeParser(
    ["application/x-www-form-urlencoded", "multipart/form-data"],
    { parseAs: "string" },
    fastify2.defaultTextParser
  );
  if (redwoodOptions.loadUserConfig) {
    const { configureFastify } = loadUserConfig();
    if (configureFastify) {
      await configureFastify(fastify2, {
        side: "api",
        apiRootPath: redwoodOptions.apiRootPath
      });
    }
  }
  fastify2.all(`${redwoodOptions.apiRootPath}:routeName`, lambdaRequestHandler);
  fastify2.all(`${redwoodOptions.apiRootPath}:routeName/*`, lambdaRequestHandler);
  await loadFunctionsFromDist({
    fastGlobOptions: {
      ignore: ["**/dist/functions/graphql.js"]
    }
  });
  done();
}
var LAMBDA_FUNCTIONS = {};
var setLambdaFunctions = async (apiDistFunctions) => {
  const tsImport = Date.now();
  console.log(import_chalk2.default.dim.italic("Importing api functions..."));
  const imports = apiDistFunctions.map(async (fnPath) => {
    const ts = Date.now();
    const routeName = import_path2.default.basename(fnPath).replace(".js", "");
    const { handler: handler2 } = await import(fnPath);
    if (!handler2) {
      console.warn(
        `${routeName} at ${fnPath} doesn't export a function called \`handler\``
      );
      return;
    }
    LAMBDA_FUNCTIONS[routeName] = handler2;
    console.log(import_chalk2.default.magenta(`/{routeName}`));
    console.log(import_chalk2.default.dim.italic(Date.now() - ts + " ms"));
  });
  await Promise.all(imports);
  console.log(
    import_chalk2.default.dim.italic("Done importing in " + (Date.now() - tsImport) + " ms")
  );
};
var loadFunctionsFromDist = async (options = {}) => {
  const apiDistFunctions = getApiDistFunctions(
    (0, import_project_config2.getPaths)().api.base,
    options?.fastGlobOptions
  );
  await setLambdaFunctions(apiDistFunctions);
};
function getApiDistFunctions(cwd = (0, import_project_config2.getPaths)().api.base, options = {}) {
  return import_fast_glob.default.sync("dist/functions/**/*.{ts,js}", {
    cwd,
    deep: 2,
    // We don't support deeply nested api functions, to maximise compatibility with deployment providers
    absolute: true,
    ...options
  });
}
var lambdaRequestHandler = async (req, reply) => {
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
  return requestHandler(req, reply, LAMBDA_FUNCTIONS[routeName]);
};

// src/createServer.ts
var import_path3 = __toESM(require("path"));
var import_chalk3 = __toESM(require("chalk"));
var import_dotenv_defaults = require("dotenv-defaults");
var import_fast_glob2 = __toESM(require("fast-glob"));
var import_fastify3 = __toESM(require("fastify"));
var import_store = require("@redwoodjs/context/dist/store");
var import_project_config3 = require("@redwoodjs/project-config");
if (process.env.RWJS_CWD && !process.env.REDWOOD_ENV_FILES_LOADED) {
  (0, import_dotenv_defaults.config)({
    path: import_path3.default.join((0, import_project_config3.getPaths)().base, ".env"),
    defaults: import_path3.default.join((0, import_project_config3.getPaths)().base, ".env.defaults"),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = "true";
}
var DEFAULT_CREATE_SERVER_OPTIONS = {
  apiRootPath: "/",
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "warn"
  },
  fastifyServerOptions: {
    requestTimeout: 15e3
  }
};

// src/cliHandlers.ts
function sendProcessReady() {
  process.send && process.send("ready");
}
var commonOptions = {
  port: {
    description: "The port to listen on",
    type: "number",
    alias: "p",
    default: (0, import_project_config4.getConfig)().web?.port
  }
};
var apiCliOptions = {
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
var apiServerHandler = async (options) => {
  const tsApiServer = Date.now();
  console.log(import_chalk4.default.dim.italic("Starting API server..."));
  const apiRootPath = (0, import_fastify_web.coerceRootPath)(options.apiRootPath);
  const fastify2 = fastify_default();
  await fastify2.register(redwoodFastifyAPI, { redwood: options });
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "::";
  await fastify2.listen({
    port: options.port,
    host,
    listenTextResolver: (address) => {
      if (process.env.NODE_ENV !== "production") {
        address = address.replace(/http:\/\/\[::\]/, "http://localhost");
      }
      return `Server listening at ${address}`;
    }
  });
  fastify2.ready(() => {
    console.log(import_chalk4.default.dim.italic("Took " + (Date.now() - tsApiServer) + " ms"));
    let address = fastify2.listeningOrigin;
    if (process.env.NODE_ENV !== "production") {
      address = address.replace(/http:\/\/\[::\]/, "http://localhost");
    }
    const apiServer = import_chalk4.default.magenta(`${address}${apiRootPath}`);
    const graphqlEndpoint = import_chalk4.default.magenta(`${apiServer}graphql`);
    console.log(`API server listening at ${apiServer}`);
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`);
    sendProcessReady();
  });
};
var bothServerHandler = async (options) => {
  const tsServer = Date.now();
  console.log(import_chalk4.default.dim.italic("Starting API and Web servers..."));
  const apiRootPath = (0, import_fastify_web.coerceRootPath)((0, import_project_config4.getConfig)().web.apiUrl);
  const fastify2 = fastify_default();
  await fastify2.register(import_fastify_web.redwoodFastifyWeb);
  await fastify2.register(redwoodFastifyAPI, { redwood: { apiRootPath } });
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "::";
  await fastify2.listen({
    port: options.port,
    host,
    listenTextResolver: (address) => {
      if (process.env.NODE_ENV !== "production") {
        address = address.replace(/http:\/\/\[::\]/, "http://localhost");
      }
      return `Server listening at ${address}`;
    }
  });
  fastify2.ready(() => {
    console.log(import_chalk4.default.dim.italic("Took " + (Date.now() - tsServer) + " ms"));
    const webServer = import_chalk4.default.green(fastify2.listeningOrigin);
    const apiServer = import_chalk4.default.magenta(`${fastify2.listeningOrigin}${apiRootPath}`);
    const graphqlEndpoint = import_chalk4.default.magenta(`${apiServer}graphql`);
    console.log(`Web server listening at ${webServer}`);
    console.log(`API server listening at ${apiServer}`);
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`);
    sendProcessReady();
  });
};

// src/bin.ts
if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  (0, import_dotenv_defaults2.config)({
    path: import_path4.default.join((0, import_project_config5.getPaths)().base, ".env"),
    defaults: import_path4.default.join((0, import_project_config5.getPaths)().base, ".env.defaults"),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = "true";
}
(0, import_yargs.default)((0, import_helpers2.hideBin)(process.argv)).scriptName("rw-server").example("Serve both the api and web", "$0").example("Serve only the api", "$0 api").example("Serve only the web", "$0 web").strict().command(
  "$0",
  "Start a server for serving both the api and the web",
  // @ts-expect-error The yargs types seem wrong; it's ok for builder to be a function
  (yargs2) => {
    yargs2.options(commonOptions);
  },
  bothServerHandler
).command(
  "api",
  "Start a server for serving only the api side",
  // @ts-expect-error The yargs types seem wrong; it's ok for builder to be a function
  (yargs2) => {
    yargs2.options(apiCliOptions);
  },
  apiServerHandler
).command(
  "web",
  webServerCLIConfig.description,
  webServerCLIConfig.builder,
  webServerCLIConfig.handler
).parse();
