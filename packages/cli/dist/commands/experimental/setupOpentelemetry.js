"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.EXPERIMENTAL_TOPIC_ID = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _util = require("./util");
const command = exports.command = 'setup-opentelemetry';
const description = exports.description = 'Setup OpenTelemetry within the API side';
const EXPERIMENTAL_TOPIC_ID = exports.EXPERIMENTAL_TOPIC_ID = 4772;
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  }).option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more logs',
    type: 'boolean'
  }).epilogue((0, _util.getEpilogue)(command, description, EXPERIMENTAL_TOPIC_ID, true));
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'experimental setup-opentelemetry',
    force: options.force,
    verbose: options.verbose
  });
  const {
    handler
  } = await import('./setupOpentelemetryHandler.js');
  return handler(options);
};
exports.handler = handler;