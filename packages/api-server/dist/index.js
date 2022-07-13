#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _helpers = require("yargs/helpers");

var _yargs = _interopRequireDefault(require("yargs/yargs"));

var _cliHandlers = require("./cliHandlers");

const positionalArgs = (0, _yargs.default)((0, _helpers.hideBin)(process.argv)).parseSync()._; // "bin": {
//   "rw-api-server-watch": "./dist/watch.js",
//   "rw-log-formatter": "./dist/logFormatter/bin.js",
//   "rw-server": "./dist/index.js"
// },


if (require.main === module) {
  if ((0, _includes.default)(positionalArgs).call(positionalArgs, 'api') && !(0, _includes.default)(positionalArgs).call(positionalArgs, 'web')) {
    (0, _cliHandlers.apiServerHandler)((0, _yargs.default)((0, _helpers.hideBin)(process.argv)).options(_cliHandlers.apiCliOptions).parseSync());
  } else if ((0, _includes.default)(positionalArgs).call(positionalArgs, 'web') && !(0, _includes.default)(positionalArgs).call(positionalArgs, 'api')) {
    (0, _cliHandlers.webServerHandler)((0, _yargs.default)((0, _helpers.hideBin)(process.argv)).options(_cliHandlers.webCliOptions).parseSync());
  } else {
    (0, _cliHandlers.bothServerHandler)((0, _yargs.default)((0, _helpers.hideBin)(process.argv)).options(_cliHandlers.commonOptions).parseSync());
  }
}