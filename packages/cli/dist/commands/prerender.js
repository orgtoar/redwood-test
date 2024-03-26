"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;
const command = exports.command = 'prerender';
const aliases = exports.aliases = ['render'];
const description = exports.description = 'Prerender pages of your Redwood app at build time';
const builder = yargs => {
  yargs.showHelpOnFail(false);
  yargs.option('path', {
    alias: ['p', 'route'],
    description: 'Router path to prerender. Especially useful for debugging',
    type: 'string'
  });
  yargs.option('dry-run', {
    alias: ['d', 'dryrun'],
    default: false,
    description: 'Run prerender and output to console',
    type: 'boolean'
  });
  yargs.option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more',
    type: 'boolean'
  });
};
exports.builder = builder;
const handler = async options => {
  const {
    handler
  } = await import('./prerenderHandler.js');
  return handler(options);
};
exports.handler = handler;