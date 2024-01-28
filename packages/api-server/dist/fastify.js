"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.createFastifyInstance = exports.DEFAULT_OPTIONS = void 0;
exports.loadFastifyConfig = loadFastifyConfig;
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/map"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _fastify = _interopRequireDefault(require("fastify"));
var _store = require("@redwoodjs/context/dist/store");
var _projectConfig = require("@redwoodjs/project-config");
// Exported for testing.
const DEFAULT_OPTIONS = exports.DEFAULT_OPTIONS = {
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
};
let isServerConfigLoaded = false;
let serverConfigFile = {
  config: DEFAULT_OPTIONS,
  configureFastify: async (fastify, options) => {
    fastify.log.trace(options, `In configureFastify hook for side: ${options?.side}`);
    return fastify;
  }
};
function loadFastifyConfig() {
  // @TODO use require.resolve to find the config file
  // do we need to babel first?
  const serverConfigPath = _path.default.join((0, _projectConfig.getPaths)().base, (0, _projectConfig.getConfig)().api.serverConfig);

  // If a server.config.js is not found, use the default
  // options set in packages/api-server/src/app.ts
  if (!_fs.default.existsSync(serverConfigPath)) {
    return serverConfigFile;
  }
  if (!isServerConfigLoaded) {
    console.log(`Loading server config from ${serverConfigPath}`);
    serverConfigFile = {
      ...require(serverConfigPath)
    };
    isServerConfigLoaded = true;
  }
  return serverConfigFile;
}
const createFastifyInstance = options => {
  const {
    config
  } = loadFastifyConfig();
  const fastify = (0, _fastify.default)(options || config || DEFAULT_OPTIONS);

  // Ensure that each request has a unique global context
  fastify.addHook('onRequest', (_req, _reply, done) => {
    (0, _store.getAsyncStoreInstance)().run(new _map.default(), done);
  });
  return fastify;
};
exports.createFastifyInstance = createFastifyInstance;
var _default = exports.default = createFastifyInstance;