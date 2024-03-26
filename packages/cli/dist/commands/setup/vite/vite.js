"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'vite';
const description = exports.description = 'Configure the web side to use Vite, instead of Webpack';
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
  yargs.option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more logs',
    type: 'boolean'
  });
  yargs.option('add-package', {
    default: true,
    description: 'Allows you to skip adding the @redwoodjs/vite package. Useful for testing',
    type: 'boolean'
  });
};
exports.builder = builder;
const handler = async options => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup vite',
    force: options.force,
    verbose: options.verbose,
    addPackage: options.addPackage
  });
  const {
    handler
  } = await import('./viteHandler.js');
  return handler(options);
};
exports.handler = handler;