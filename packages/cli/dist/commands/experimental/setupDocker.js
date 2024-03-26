"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.EXPERIMENTAL_TOPIC_ID = void 0;
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _util = require("./util");
const EXPERIMENTAL_TOPIC_ID = exports.EXPERIMENTAL_TOPIC_ID = null;
const command = exports.command = 'setup-docker';
const description = exports.description = 'Setup the experimental Dockerfile';
function builder(yargs) {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  }).epilogue((0, _util.getEpilogue)(command, description, EXPERIMENTAL_TOPIC_ID, true));
}
async function handler(options) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'experimental setup-docker',
    force: options.force,
    verbose: options.verbose
  });
  const {
    handler
  } = await import('./setupDockerHandler.js');
  return handler(options);
}