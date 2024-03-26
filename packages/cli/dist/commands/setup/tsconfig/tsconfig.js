"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'tsconfig';
const description = exports.description = 'Set up tsconfig for web and api sides';
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing tsconfig.json files',
    type: 'boolean'
  });
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup tsconfig',
    force: options.force
  });
  const {
    handler
  } = await import('./tsconfigHandler.js');
  return handler(options);
};
exports.handler = handler;