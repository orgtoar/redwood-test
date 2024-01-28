#!/usr/bin/env node
"use strict";

var _context;
var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");
var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
var _path = _interopRequireDefault(require("path"));
var _dotenvDefaults = require("dotenv-defaults");
var _helpers = require("yargs/helpers");
var _yargs = _interopRequireDefault(require("yargs/yargs"));
var _projectConfig = require("@redwoodjs/project-config");
var webServerCLIConfig = _interopRequireWildcard(require("@redwoodjs/web-server"));
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
if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  (0, _dotenvDefaults.config)({
    path: _path.default.join((0, _projectConfig.getPaths)().base, '.env'),
    defaults: _path.default.join((0, _projectConfig.getPaths)().base, '.env.defaults'),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = 'true';
}
if (require.main === module) {
  (0, _yargs.default)((0, _helpers.hideBin)(process.argv)).scriptName('rw-server').usage('usage: $0 <side>').strict().command('$0', 'Run both api and web servers',
  // @ts-expect-error just passing yargs though
  yargs => {
    yargs.options(_cliHandlers.commonOptions);
  }, _cliHandlers.bothServerHandler).command('api', 'Start server for serving only the api',
  // @ts-expect-error just passing yargs though
  yargs => {
    yargs.options(_cliHandlers.apiCliOptions);
  }, _cliHandlers.apiServerHandler).command('web', webServerCLIConfig.description,
  // @ts-expect-error just passing yargs though
  webServerCLIConfig.builder, webServerCLIConfig.handler).parse();
}