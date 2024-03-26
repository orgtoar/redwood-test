"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'realtime';
const description = exports.description = 'Setup RedwoodJS Realtime';
function builder(yargs) {
  yargs.option('includeExamples', {
    alias: ['e', 'examples'],
    default: true,
    description: 'Include examples of how to implement liveQueries and subscriptions',
    type: 'boolean'
  }).option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  }).option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more logs',
    type: 'boolean'
  });
}
async function handler(options) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup realtime',
    includeExamples: options.includeExamples,
    force: options.force,
    verbose: options.verbose
  });
  const {
    handler
  } = await import('./realtimeHandler.js');
  return handler(options);
}