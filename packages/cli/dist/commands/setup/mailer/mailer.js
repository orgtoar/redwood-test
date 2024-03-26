"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'mailer';
const description = exports.description = 'Setup the redwood mailer. This will install the required packages and add the required initial configuration to your redwood app.';
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  }).option('skip-examples', {
    default: false,
    description: 'Only include required files and exclude any examples',
    type: 'boolean'
  });
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup mailer',
    force: options.force,
    skipExamples: options.skipExamples
  });
  const {
    handler
  } = await import('./mailerHandler.js');
  return handler(options);
};
exports.handler = handler;