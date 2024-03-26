"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var apiServerCLIConfig = _interopRequireWildcard(require("@redwoodjs/api-server/dist/apiCLIConfig"));
var bothServerCLIConfig = _interopRequireWildcard(require("@redwoodjs/api-server/dist/bothCLIConfig"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var webServerCLIConfig = _interopRequireWildcard(require("@redwoodjs/web-server"));
var _lib = require("../lib");
var _colors = _interopRequireDefault(require("../lib/colors"));
var _project = require("../lib/project.js");
var _serveWebHandler = require("./serveWebHandler");
const command = exports.command = 'serve [side]';
const description = exports.description = 'Start a server for serving both the api and web sides';
const builder = async yargs => {
  const rscEnabled = (0, _lib.getConfig)().experimental?.rsc?.enabled;
  const streamingEnabled = (0, _lib.getConfig)().experimental?.streamingSsr?.enabled;
  yargs.command({
    command: '$0',
    description: bothServerCLIConfig.description,
    builder: bothServerCLIConfig.builder,
    handler: async argv => {
      (0, _cliHelpers.recordTelemetryAttributes)({
        command: 'serve',
        port: argv.port,
        host: argv.host,
        socket: argv.socket
      });

      // Run the server file, if it exists, with web side also
      if ((0, _project.serverFileExists)()) {
        const {
          bothServerFileHandler
        } = await import('./serveBothHandler.js');
        await bothServerFileHandler(argv);
      } else if (rscEnabled || streamingEnabled) {
        const {
          bothSsrRscServerHandler
        } = await import('./serveBothHandler.js');
        await bothSsrRscServerHandler(argv);
      } else {
        await bothServerCLIConfig.handler(argv);
      }
    }
  }).command({
    command: 'api',
    description: apiServerCLIConfig.description,
    builder: apiServerCLIConfig.builder,
    handler: async argv => {
      (0, _cliHelpers.recordTelemetryAttributes)({
        command: 'serve',
        port: argv.port,
        host: argv.host,
        socket: argv.socket,
        apiRootPath: argv.apiRootPath
      });

      // Run the server file, if it exists, api side only
      if ((0, _project.serverFileExists)()) {
        const {
          apiServerFileHandler
        } = await import('./serveApiHandler.js');
        await apiServerFileHandler(argv);
      } else {
        await apiServerCLIConfig.handler(argv);
      }
    }
  }).command({
    command: 'web',
    description: webServerCLIConfig.description,
    builder: webServerCLIConfig.builder,
    handler: async argv => {
      (0, _cliHelpers.recordTelemetryAttributes)({
        command: 'serve',
        port: argv.port,
        host: argv.host,
        socket: argv.socket,
        apiHost: argv.apiHost
      });
      if (streamingEnabled) {
        await (0, _serveWebHandler.webSsrServerHandler)();
      } else {
        await webServerCLIConfig.handler(argv);
      }
    }
  }).middleware(argv => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'serve'
    });

    // Make sure the relevant side has been built, before serving
    const positionalArgs = argv._;
    if ((0, _includes.default)(positionalArgs).call(positionalArgs, 'web') && !_fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().web.dist), 'index.html')) {
      console.error(_colors.default.error('\n Please run `yarn rw build web` before trying to serve web. \n'));
      process.exit(1);
    }
    const apiSideExists = _fsExtra.default.existsSync((0, _lib.getPaths)().api.base);
    if ((0, _includes.default)(positionalArgs).call(positionalArgs, 'api')) {
      if (!apiSideExists) {
        console.error(_colors.default.error('\n Unable to serve the api side as no `api` folder exists. \n'));
        process.exit(1);
      }
      if (!_fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().api.dist))) {
        console.error(_colors.default.error('\n Please run `yarn rw build api` before trying to serve api. \n'));
        process.exit(1);
      }
    }

    // serve both
    if (positionalArgs.length === 1) {
      if (!apiSideExists && !rscEnabled) {
        console.error(_colors.default.error('\n Unable to serve the both sides as no `api` folder exists. Please use `yarn rw serve web` instead. \n'));
        process.exit(1);
      }

      // We need the web side (and api side, if it exists) to have been built
      if (_fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().api.base)) && !_fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().api.dist)) || !_fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().web.dist), 'index.html')) {
        console.error(_colors.default.error('\n Please run `yarn rw build` before trying to serve your redwood app. \n'));
        process.exit(1);
      }
    }

    // Set NODE_ENV to production, if not set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#serve')}`);
};
exports.builder = builder;