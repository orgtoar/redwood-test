"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'fragments';
const description = exports.description = 'Set up Fragments for GraphQL';
function builder(yargs) {
  return yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
}
async function handler({
  force
}) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup graphql fragments',
    force
  });
  const {
    handler
  } = await import('./fragmentsHandler.js');
  return handler({
    force
  });
}