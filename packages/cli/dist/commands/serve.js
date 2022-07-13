"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.description = exports.command = exports.builder = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _apiServer = require("@redwoodjs/api-server");

var _internal = require("@redwoodjs/internal");

var _colors = _interopRequireDefault(require("../lib/colors"));

const command = 'serve [side]';
exports.command = command;
const description = 'Run server for api or web in production';
exports.description = description;

const builder = yargs => {
  yargs.usage('usage: $0 <side>').command({
    command: '$0',
    descriptions: 'Run both api and web servers',
    handler: _apiServer.bothServerHandler,
    builder: yargs => yargs.options(_apiServer.commonOptions)
  }).command({
    command: 'api',
    description: 'start server for serving only the api',
    handler: _apiServer.apiServerHandler,
    builder: yargs => yargs.options(_apiServer.apiCliOptions)
  }).command({
    command: 'web',
    description: 'start server for serving only the web side',
    handler: _apiServer.webServerHandler,
    builder: yargs => yargs.options(_apiServer.webCliOptions)
  }).middleware(argv => {
    // Make sure the relevant side has been built, before serving
    const positionalArgs = argv._;

    if ((0, _includes.default)(positionalArgs).call(positionalArgs, 'web') && !_fs.default.existsSync(_path.default.join((0, _internal.getPaths)().web.dist), 'index.html')) {
      console.error(_colors.default.error('\n Please run `yarn rw build web` before trying to serve web. \n'));
      process.exit(1);
    }

    if ((0, _includes.default)(positionalArgs).call(positionalArgs, 'api') && !_fs.default.existsSync(_path.default.join((0, _internal.getPaths)().api.dist))) {
      console.error(_colors.default.error('\n Please run `yarn rw build api` before trying to serve api. \n'));
      process.exit(1);
    }

    if ( // serve both
    positionalArgs.length === 1 && (!_fs.default.existsSync(_path.default.join((0, _internal.getPaths)().api.dist)) || !_fs.default.existsSync(_path.default.join((0, _internal.getPaths)().web.dist), 'index.html'))) {
      console.error(_colors.default.error('\n Please run `yarn rw build` before trying to serve your redwood app. \n'));
      process.exit(1);
    } // Set NODE_ENV to production, if not set


    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#serve')}`);
};

exports.builder = builder;