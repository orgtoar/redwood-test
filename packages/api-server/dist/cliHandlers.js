"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webServerHandler = exports.webCliOptions = exports.commonOptions = exports.bothServerHandler = exports.apiServerHandler = exports.apiCliOptions = void 0;

var _ansiColors = _interopRequireDefault(require("ansi-colors"));

var _config = require("@redwoodjs/internal/dist/config");

var _fastify = _interopRequireDefault(require("./fastify"));

var _withApiProxy = _interopRequireDefault(require("./plugins/withApiProxy"));

var _withFunctions = _interopRequireDefault(require("./plugins/withFunctions"));

var _withWebServer = _interopRequireDefault(require("./plugins/withWebServer"));

var _server = require("./server");

var _getConfig$web, _getConfig$api, _getConfig$web2;

/*
 * This file has defines CLI handlers used by the redwood cli, for `rw serve`
 * Also used in index.ts for the api server
 */
const sendProcessReady = () => {
  return process.send && process.send('ready');
};

const commonOptions = {
  port: {
    default: ((_getConfig$web = (0, _config.getConfig)().web) === null || _getConfig$web === void 0 ? void 0 : _getConfig$web.port) || 8910,
    type: 'number',
    alias: 'p'
  },
  socket: {
    type: 'string'
  }
};
exports.commonOptions = commonOptions;
const apiCliOptions = {
  port: {
    default: ((_getConfig$api = (0, _config.getConfig)().api) === null || _getConfig$api === void 0 ? void 0 : _getConfig$api.port) || 8911,
    type: 'number',
    alias: 'p'
  },
  socket: {
    type: 'string'
  },
  apiRootPath: {
    alias: ['rootPath', 'root-path'],
    default: '/',
    type: 'string',
    desc: 'Root path where your api functions are served',
    coerce: coerceRootPath
  }
};
exports.apiCliOptions = apiCliOptions;
const webCliOptions = {
  port: {
    default: ((_getConfig$web2 = (0, _config.getConfig)().web) === null || _getConfig$web2 === void 0 ? void 0 : _getConfig$web2.port) || 8910,
    type: 'number',
    alias: 'p'
  },
  socket: {
    type: 'string'
  },
  apiHost: {
    alias: 'api-host',
    type: 'string',
    desc: 'Forward requests from the apiUrl, defined in redwood.toml to this host'
  }
};
exports.webCliOptions = webCliOptions;

const apiServerHandler = async options => {
  const {
    port,
    socket,
    apiRootPath
  } = options;
  const tsApiServer = Date.now();
  process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Starting API Server...\n')));
  let fastify = (0, _fastify.default)(); // Import Server Functions.

  fastify = await (0, _withFunctions.default)(fastify, options);
  const http = (0, _server.startServer)({
    port,
    socket,
    fastify
  }).ready(() => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('Took ' + (Date.now() - tsApiServer) + ' ms')));
    const on = socket ? socket : _ansiColors.default.magenta(`http://localhost:${port}${apiRootPath}`);
    console.log(`API listening on ${on}`);

    const graphqlEnd = _ansiColors.default.magenta(`${apiRootPath}graphql`);

    console.log(`GraphQL endpoint at ${graphqlEnd}`);
    sendProcessReady();
  });
  process.on('exit', () => {
    http === null || http === void 0 ? void 0 : http.close();
  });
};

exports.apiServerHandler = apiServerHandler;

const bothServerHandler = async options => {
  const {
    port,
    socket
  } = options;
  const tsServer = Date.now();
  process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Starting API and Web Servers...\n')));
  const apiRootPath = coerceRootPath((0, _config.getConfig)().web.apiUrl);
  let fastify = (0, _fastify.default)(); // Attach plugins

  fastify = await (0, _withWebServer.default)(fastify, options);
  fastify = await (0, _withFunctions.default)(fastify, { ...options,
    apiRootPath
  });
  (0, _server.startServer)({
    port,
    socket,
    fastify
  }).ready(() => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('Took ' + (Date.now() - tsServer) + ' ms')));
    const on = socket ? socket : _ansiColors.default.magenta(`http://localhost:${port}${apiRootPath}`);

    const webServer = _ansiColors.default.green(`http://localhost:${port}`);

    const apiServer = _ansiColors.default.magenta(`http://localhost:${port}`);

    console.log(`Web server started on ${webServer}`);
    console.log(`API serving from ${apiServer}`);
    console.log(`API listening on ${on}`);

    const graphqlEnd = _ansiColors.default.magenta(`${apiRootPath}graphql`);

    console.log(`GraphQL endpoint at ${graphqlEnd}`);
    sendProcessReady();
  });
};

exports.bothServerHandler = bothServerHandler;

const webServerHandler = async options => {
  var _getConfig$web$apiGra;

  const {
    port,
    socket,
    apiHost
  } = options;
  const tsServer = Date.now();
  process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Starting Web Server...\n')));
  const apiUrl = (0, _config.getConfig)().web.apiUrl; // Construct the graphql url from apiUrl by default
  // But if apiGraphQLUrl is specified, use that instead

  const graphqlEndpoint = coerceRootPath((_getConfig$web$apiGra = (0, _config.getConfig)().web.apiGraphQLUrl) !== null && _getConfig$web$apiGra !== void 0 ? _getConfig$web$apiGra : `${apiUrl}/graphql`);
  let fastify = (0, _fastify.default)(); // serve static files from "web/dist"

  fastify = await (0, _withWebServer.default)(fastify, options); // If apiHost is supplied, it means the functions are running elsewhere
  // So we should just proxy requests

  if (apiHost) {
    // Attach plugin for proxying
    fastify = await (0, _withApiProxy.default)(fastify, {
      apiHost,
      apiUrl
    });
  }

  (0, _server.startServer)({
    port: port,
    socket,
    fastify
  }).ready(() => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('Took ' + (Date.now() - tsServer) + ' ms')));

    if (socket) {
      console.log(`Listening on ` + _ansiColors.default.magenta(`${socket}`));
    }

    const webServer = _ansiColors.default.green(`http://localhost:${port}`);

    console.log(`Web server started on ${webServer}`);
    console.log(`GraphQL endpoint is set to ` + _ansiColors.default.magenta(`${graphqlEndpoint}`));
    sendProcessReady();
  });
};

exports.webServerHandler = webServerHandler;

function coerceRootPath(path) {
  // Make sure that we create a root path that starts and ends with a slash (/)
  const prefix = path.charAt(0) !== '/' ? '/' : '';
  const suffix = path.charAt(path.length - 1) !== '/' ? '/' : '';
  return `${prefix}${path}${suffix}`;
}