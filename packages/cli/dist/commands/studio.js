"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _cliHelpers = require("@redwoodjs/cli-helpers");
const command = exports.command = 'studio';
const description = exports.description = 'Run the Redwood development studio';
function builder(yargs) {
  yargs.option('open', {
    default: true,
    description: 'Open the studio in your browser'
  });
}
async function handler(options) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'studio',
    open: options.open
  });
  const {
    handler
  } = await import('./studioHandler.js');
  return handler(options);
}