"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.commonOptions = exports.bothServerHandler = exports.apiServerHandler = exports.apiCliOptions = void 0;
_Object$defineProperty(exports, "createServer", {
  enumerable: true,
  get: function () {
    return _createServer.createServer;
  }
});
var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));
var _ansiColors = _interopRequireDefault(require("ansi-colors"));
var _fastifyWeb = require("@redwoodjs/fastify-web");
var _projectConfig = require("@redwoodjs/project-config");
var _fastify = _interopRequireDefault(require("./fastify"));
var _withFunctions = _interopRequireDefault(require("./plugins/withFunctions"));
var _server = require("./server");
var _createServer = require("./createServer");
/*
 * This file has defines CLI handlers used by the redwood cli, for `rw serve`
 * Also used in index.ts for the api server
 */

const sendProcessReady = () => {
  return process.send && process.send('ready');
};
const commonOptions = exports.commonOptions = {
  port: {
    default: (0, _projectConfig.getConfig)().web?.port || 8910,
    type: 'number',
    alias: 'p'
  },
  socket: {
    type: 'string'
  }
};
const apiCliOptions = exports.apiCliOptions = {
  port: {
    default: (0, _projectConfig.getConfig)().api?.port || 8911,
    type: 'number',
    alias: 'p'
  },
  socket: {
    type: 'string'
  },
  apiRootPath: {
    alias: ['api-root-path', 'rootPath', 'root-path'],
    default: '/',
    type: 'string',
    desc: 'Root path where your api functions are served',
    coerce: _fastifyWeb.coerceRootPath
  },
  loadEnvFiles: {
    description: 'Deprecated; env files are always loaded. This flag is a no-op',
    type: 'boolean',
    hidden: true
  }
};
const apiServerHandler = async options => {
  const {
    port,
    socket,
    apiRootPath
  } = options;
  const tsApiServer = (0, _now.default)();
  console.log(_ansiColors.default.dim.italic('Starting API Server...'));
  let fastify = (0, _fastify.default)();

  // Import Server Functions.
  fastify = await (0, _withFunctions.default)(fastify, options);
  fastify = await (0, _server.startServer)({
    port,
    socket,
    fastify
  });
  fastify.ready(() => {
    console.log(_ansiColors.default.dim.italic('Took ' + ((0, _now.default)() - tsApiServer) + ' ms'));

    // In the past, in development, we've prioritized showing a friendlier
    // host than the listen-on-all-ipv6-addresses '[::]'. Here we replace it
    // with 'localhost' only if 1) we're not in production and 2) it's there.
    // In production it's important to be transparent.
    //
    // We have this logic for `apiServerHandler` because this is the only
    // handler called by the watch bin (which is called by `yarn rw dev`).
    let address = fastify.listeningOrigin;
    if (process.env.NODE_ENV !== 'production') {
      address = address.replace(/http:\/\/\[::\]/, 'http://localhost');
    }
    const apiServer = _ansiColors.default.magenta(`${address}${apiRootPath}`);
    const graphqlEndpoint = _ansiColors.default.magenta(`${apiServer}graphql`);
    console.log(`API server listening at ${apiServer}`);
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`);
    sendProcessReady();
  });
  process.on('exit', () => {
    fastify?.close();
  });
};
exports.apiServerHandler = apiServerHandler;
const bothServerHandler = async options => {
  const {
    port,
    socket
  } = options;
  const tsServer = (0, _now.default)();
  console.log(_ansiColors.default.dim.italic('Starting API and Web Servers...'));
  const apiRootPath = (0, _fastifyWeb.coerceRootPath)((0, _projectConfig.getConfig)().web.apiUrl);
  let fastify = (0, _fastify.default)();
  await fastify.register(_fastifyWeb.redwoodFastifyWeb);
  fastify = await (0, _withFunctions.default)(fastify, {
    ...options,
    apiRootPath
  });
  fastify = await (0, _server.startServer)({
    port,
    socket,
    fastify
  });
  fastify.ready(() => {
    console.log(_ansiColors.default.dim.italic('Took ' + ((0, _now.default)() - tsServer) + ' ms'));
    const webServer = _ansiColors.default.green(fastify.listeningOrigin);
    const apiServer = _ansiColors.default.magenta(`${fastify.listeningOrigin}${apiRootPath}`);
    const graphqlEndpoint = _ansiColors.default.magenta(`${apiServer}graphql`);
    console.log(`Web server listening at ${webServer}`);
    console.log(`API server listening at ${apiServer}`);
    console.log(`GraphQL endpoint at ${graphqlEndpoint}`);
    sendProcessReady();
  });
};

// Temporarily here till we refactor server code
exports.bothServerHandler = bothServerHandler;