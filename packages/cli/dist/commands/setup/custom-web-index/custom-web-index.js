"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'custom-web-index';
const description = exports.description = 'Set up a custom index.js file, so you can customise how Redwood web is mounted in your browser (webpack only)';
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing index.js file',
    type: 'boolean'
  });
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup custom-web-index',
    force: options.force
  });
  const {
    handler
  } = await import('./custom-web-index-handler.js');
  return handler(options);
};
exports.handler = handler;