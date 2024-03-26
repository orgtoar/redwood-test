"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'i18n';
const description = exports.description = 'Set up i18n';
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup i18n',
    force: options.force
  });
  const {
    handler
  } = await import('./i18nHandler.js');
  return handler(options);
};
exports.handler = handler;