"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.webServerHandler = exports.webCliOptions = exports.commonOptions = exports.bothServerHandler = exports.apiServerHandler = exports.apiCliOptions = void 0;

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ansiColors = _interopRequireDefault(require("ansi-colors"));

var _internal = require("@redwoodjs/internal");

var _app = _interopRequireDefault(require("./app"));

var _withApiProxy = _interopRequireDefault(require("./plugins/withApiProxy"));

var _withFunctions = _interopRequireDefault(require("./plugins/withFunctions"));

var _withWebServer = _interopRequireDefault(require("./plugins/withWebServer"));

var _server = require("./server");

/*
 * This file has defines CLI handlers used by the redwood cli, for `rw serve`
 * Also used in index.ts for the api server
 */
const sendProcessReady = () => {
  return process.send && process.send('ready');
};

const commonOptions = {
  port: {
    default: (0, _internal.getConfig)().web?.port || 8910,
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
    default: (0, _internal.getConfig)().api?.port || 8911,
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
    default: (0, _internal.getConfig)().web?.port || 8910,
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

const apiServerHandler = async ({
  port,
  socket,
  apiRootPath
}) => {
  const tsApiServer = (0, _now.default)();
  process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Starting API Server...\n')));
  let app = (0, _app.default)(loadServerConfig()); // Import Server Functions.

  app = await (0, _withFunctions.default)(app, apiRootPath);
  const http = (0, _server.startServer)({
    port,
    socket,
    app
  }).ready(() => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('Took ' + ((0, _now.default)() - tsApiServer) + ' ms')));
    const on = socket ? socket : _ansiColors.default.magenta(`http://localhost:${port}${apiRootPath}`);
    console.log(`API listening on ${on}`);

    const graphqlEnd = _ansiColors.default.magenta(`${apiRootPath}graphql`);

    console.log(`GraphQL endpoint at ${graphqlEnd}`);
    sendProcessReady();
  });
  process.on('exit', () => {
    http?.close();
  });
};

exports.apiServerHandler = apiServerHandler;

const bothServerHandler = async ({
  port,
  socket
}) => {
  const tsServer = (0, _now.default)();
  process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Starting API and Web Servers...\n')));
  const apiRootPath = coerceRootPath((0, _internal.getConfig)().web.apiUrl);
  let app = (0, _app.default)(loadServerConfig()); // Attach plugins

  app = await (0, _withFunctions.default)(app, apiRootPath);
  app = (0, _withWebServer.default)(app);
  (0, _server.startServer)({
    port,
    socket,
    app
  }).ready(() => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('Took ' + ((0, _now.default)() - tsServer) + ' ms')));
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

const webServerHandler = ({
  port,
  socket,
  apiHost
}) => {
  const tsServer = (0, _now.default)();
  process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Starting Web Server...\n')));
  const apiUrl = (0, _internal.getConfig)().web.apiUrl; // Construct the graphql url from apiUrl by default
  // But if apiGraphQLUrl is specified, use that instead

  const graphqlEndpoint = coerceRootPath((0, _internal.getConfig)().web.apiGraphQLUrl ?? `${apiUrl}/graphql`);
  const fastifyInstance = (0, _app.default)(loadServerConfig()); // serve static files from "web/dist"

  let app = (0, _withWebServer.default)(fastifyInstance); // If apiHost is supplied, it means the functions are running elsewhere
  // So we should just proxy requests

  if (apiHost) {
    // Attach plugin for proxying
    app = (0, _withApiProxy.default)(app, {
      apiHost,
      apiUrl
    });
  }

  (0, _server.startServer)({
    port: port,
    socket,
    app
  }).ready(() => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('Took ' + ((0, _now.default)() - tsServer) + ' ms')));

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

function loadServerConfig() {
  const serverConfigPath = _path.default.join((0, _internal.getPaths)().base, (0, _internal.getConfig)().api.serverConfig); // If a server.config.js is not found, use the default
  // options set in packages/api-server/src/app.ts


  if (!_fs.default.existsSync(serverConfigPath)) {
    return;
  }

  console.log(`Loading server config from ${serverConfigPath} \n`);
  return require(serverConfigPath);
}