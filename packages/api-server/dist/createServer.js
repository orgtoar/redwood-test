"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CREATE_SERVER_OPTIONS = void 0;
exports.createServer = createServer;
exports.redwoodFastifyFunctions = redwoodFastifyFunctions;
exports.resolveOptions = resolveOptions;
var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/assign"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/map"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _util = require("util");
var _urlData = _interopRequireDefault(require("@fastify/url-data"));
var _ansiColors = _interopRequireDefault(require("ansi-colors"));
var _dotenvDefaults = require("dotenv-defaults");
var _fastGlob = _interopRequireDefault(require("fast-glob"));
var _fastify = _interopRequireDefault(require("fastify"));
var _fastifyRawBody = _interopRequireDefault(require("fastify-raw-body"));
var _store = require("@redwoodjs/context/dist/store");
var _projectConfig = require("@redwoodjs/project-config");
var _lambdaLoader = require("./plugins/lambdaLoader");
// Load .env files if they haven't already been loaded. This makes importing this file effectful:
//
// ```js
// # Loads dotenv...
// import { createServer } from '@redwoodjs/api-server'
// ```
//
// We do it here and not in the function below so that users can access env vars before calling `createServer`
if (process.env.RWJS_CWD && !process.env.REDWOOD_ENV_FILES_LOADED) {
  (0, _dotenvDefaults.config)({
    path: _path.default.join((0, _projectConfig.getPaths)().base, '.env'),
    defaults: _path.default.join((0, _projectConfig.getPaths)().base, '.env.defaults'),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = 'true';
}
/**
 * Creates a server for api functions:
 *
 * ```js
 * import { createServer } from '@redwoodjs/api-server'
 *
 * import { logger } from 'src/lib/logger'
 *
  async function main() {
 *   const server = await createServer({
 *     logger,
 *     apiRootPath: 'api'
 *   })
 *
 *   // Configure the returned fastify instance:
 *   server.register(myPlugin)
 *
 *   // When ready, start the server:
 *   await server.start()
 * }
 *
 * main()
 * ```
 */
async function createServer(options = {}) {
  const {
    apiRootPath,
    fastifyServerOptions,
    port
  } = resolveOptions(options);

  // Warn about `api/server.config.js`
  const serverConfigPath = _path.default.join((0, _projectConfig.getPaths)().base, (0, _projectConfig.getConfig)().api.serverConfig);
  if (_fs.default.existsSync(serverConfigPath)) {
    console.warn(_ansiColors.default.yellow(['', `Ignoring \`config\` and \`configureServer\` in api/server.config.js.`, `Migrate them to api/src/server.{ts,js}:`, '', `\`\`\`js title="api/src/server.{ts,js}"`, '// Pass your config to `createServer`', 'const server = createServer({', '  fastifyServerOptions: myFastifyConfig', '})', '', '// Then inline your `configureFastify` logic:', 'server.register(myFastifyPlugin)', '```', ''].join('\n')));
  }

  // Initialize the fastify instance
  const server = (0, _assign.default)((0, _fastify.default)(fastifyServerOptions), {
    // `start` will get replaced further down in this file
    start: async () => {
      throw new Error('Not implemented yet');
    }
  });
  server.addHook('onRequest', (_req, _reply, done) => {
    (0, _store.getAsyncStoreInstance)().run(new _map.default(), done);
  });
  await server.register(redwoodFastifyFunctions, {
    redwood: {
      apiRootPath
    }
  });

  // If we can find `api/dist/functions/graphql.js`, register the GraphQL plugin
  const [graphqlFunctionPath] = await (0, _fastGlob.default)('dist/functions/graphql.{ts,js}', {
    cwd: (0, _projectConfig.getPaths)().api.base,
    absolute: true
  });
  if (graphqlFunctionPath) {
    const {
      redwoodFastifyGraphQLServer
    } = require('./plugins/graphql');
    // This comes from a babel plugin that's applied to api/dist/functions/graphql.{ts,js} in user projects
    const {
      __rw_graphqlOptions
    } = require(graphqlFunctionPath);
    await server.register(redwoodFastifyGraphQLServer, {
      redwood: {
        apiRootPath,
        graphql: __rw_graphqlOptions
      }
    });
  }

  // For baremetal and pm2. See https://github.com/redwoodjs/redwood/pull/4744
  server.addHook('onReady', done => {
    process.send?.('ready');
    done();
  });
  server.addHook('onListen', done => {
    console.log(`Server listening at ${_ansiColors.default.magenta(`${server.listeningOrigin}${apiRootPath}`)}`);
    done();
  });

  /**
   * A wrapper around `fastify.listen` that handles `--port`, `REDWOOD_API_PORT` and [api].port in redwood.toml
   *
   * The order of precedence is:
   * - `--port`
   * - `REDWOOD_API_PORT`
   * - [api].port in redwood.toml
   */
  server.start = (options = {}) => {
    return server.listen({
      ...options,
      port,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::'
    });
  };
  return server;
}
function resolveOptions(options = {}, args) {
  options.logger ??= DEFAULT_CREATE_SERVER_OPTIONS.logger;
  let defaultPort;
  if (process.env.REDWOOD_API_PORT === undefined) {
    defaultPort = (0, _projectConfig.getConfig)().api.port;
  } else {
    defaultPort = (0, _parseInt2.default)(process.env.REDWOOD_API_PORT);
  }

  // Set defaults.
  const resolvedOptions = {
    apiRootPath: options.apiRootPath ?? DEFAULT_CREATE_SERVER_OPTIONS.apiRootPath,
    fastifyServerOptions: options.fastifyServerOptions ?? {
      requestTimeout: DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout,
      logger: options.logger ?? DEFAULT_CREATE_SERVER_OPTIONS.logger
    },
    port: defaultPort
  };

  // Merge fastifyServerOptions.
  resolvedOptions.fastifyServerOptions.requestTimeout ??= DEFAULT_CREATE_SERVER_OPTIONS.fastifyServerOptions.requestTimeout;
  resolvedOptions.fastifyServerOptions.logger = options.logger;
  const {
    values
  } = (0, _util.parseArgs)({
    options: {
      apiRootPath: {
        type: 'string'
      },
      port: {
        type: 'string',
        short: 'p'
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
    strict: process.env.NODE_ENV === 'test' ? false : true,
    ...(args && {
      args
    })
  });
  if (values.apiRootPath && typeof values.apiRootPath !== 'string') {
    throw new Error('`apiRootPath` must be a string');
  }
  if (values.apiRootPath) {
    resolvedOptions.apiRootPath = values.apiRootPath;
  }

  // Format `apiRootPath`
  if (resolvedOptions.apiRootPath.charAt(0) !== '/') {
    resolvedOptions.apiRootPath = `/${resolvedOptions.apiRootPath}`;
  }
  if (resolvedOptions.apiRootPath.charAt(resolvedOptions.apiRootPath.length - 1) !== '/') {
    resolvedOptions.apiRootPath = `${resolvedOptions.apiRootPath}/`;
  }
  if (values.port) {
    resolvedOptions.port = +values.port;
    if (isNaN(resolvedOptions.port)) {
      throw new Error('`port` must be an integer');
    }
  }
  return resolvedOptions;
}
const DEFAULT_CREATE_SERVER_OPTIONS = exports.DEFAULT_CREATE_SERVER_OPTIONS = {
  apiRootPath: '/',
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn'
  },
  fastifyServerOptions: {
    requestTimeout: 15_000
  }
};
async function redwoodFastifyFunctions(fastify, opts, done) {
  fastify.register(_urlData.default);
  await fastify.register(_fastifyRawBody.default);
  fastify.addContentTypeParser(['application/x-www-form-urlencoded', 'multipart/form-data'], {
    parseAs: 'string'
  }, fastify.defaultTextParser);
  fastify.all(`${opts.redwood.apiRootPath}:routeName`, _lambdaLoader.lambdaRequestHandler);
  fastify.all(`${opts.redwood.apiRootPath}:routeName/*`, _lambdaLoader.lambdaRequestHandler);
  await (0, _lambdaLoader.loadFunctionsFromDist)({
    fastGlobOptions: {
      ignore: ['**/dist/functions/graphql.js']
    }
  });
  done();
}