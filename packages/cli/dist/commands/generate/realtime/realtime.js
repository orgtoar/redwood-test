"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'realtime <name>';
const description = exports.description = 'Generate a subscription or live query used with RedwoodJS Realtime';
function builder(yargs) {
  yargs.positional('name', {
    type: 'string',
    description: 'Name of the realtime event to setup. This should be a type or model name like: Widget, Sprocket, etc.',
    demandOption: true
  }).option('type', {
    alias: 't',
    type: 'string',
    choices: ['liveQuery', 'subscription'],
    description: 'Type of realtime event to setup'
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
    command: 'generate realtime',
    type: options.type,
    force: options.force,
    verbose: options.verbose
  });
  const {
    handler
  } = await import('./realtimeHandler.js');
  return handler(options);
}