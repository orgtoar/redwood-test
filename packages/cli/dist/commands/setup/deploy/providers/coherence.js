"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'coherence';
const description = exports.description = 'Setup Coherence deploy';
function builder(yargs) {
  yargs.option('force', {
    description: 'Overwrite existing configuration',
    type: 'boolean',
    default: false
  });
}
async function handler(options) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup deploy coherence',
    force: options.force
  });
  const {
    handler
  } = await import('./coherenceHandler.js');
  return handler(options);
}