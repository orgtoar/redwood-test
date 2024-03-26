"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = exports.builder = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'sentry';
const description = exports.description = 'Setup Sentry error and performance tracking';
const builder = yargs => {
  return yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing Sentry config files',
    type: 'boolean'
  });
};
exports.builder = builder;
async function handler({
  force
}) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup monitoring sentry',
    force
  });
  const {
    handler
  } = await import('./sentryHandler.js');
  return handler({
    force
  });
}