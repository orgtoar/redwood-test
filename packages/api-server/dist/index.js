#!/usr/bin/env node
"use strict";

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = require("yargs/helpers");

var _yargs = _interopRequireDefault(require("yargs/yargs"));

var _cliHandlers = require("./cliHandlers");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
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
  if (positionalArgs.includes('api') && !positionalArgs.includes('web')) {
    (0, _cliHandlers.apiServerHandler)((0, _yargs.default)((0, _helpers.hideBin)(process.argv)).options(_cliHandlers.apiCliOptions).parseSync());
  } else if (positionalArgs.includes('web') && !positionalArgs.includes('api')) {
    (0, _cliHandlers.webServerHandler)((0, _yargs.default)((0, _helpers.hideBin)(process.argv)).options(_cliHandlers.webCliOptions).parseSync());
  } else {
    (0, _cliHandlers.bothServerHandler)((0, _yargs.default)((0, _helpers.hideBin)(process.argv)).options(_cliHandlers.commonOptions).parseSync());
  }
}