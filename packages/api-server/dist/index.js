#!/usr/bin/env node
"use strict";

var _context;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _helpers = require("yargs/helpers");

var _yargs = _interopRequireDefault(require("yargs/yargs"));

var _cliHandlers = require("./cliHandlers");

var _types = require("./types");

_forEachInstanceProperty(_context = _Object$keys(_types)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _types[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});

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