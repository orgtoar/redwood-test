"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
const command = exports.command = 'prisma [commands..]';
const description = exports.description = 'Run Prisma CLI with experimental features';

/**
 * This is a lightweight wrapper around Prisma's CLI with some Redwood CLI modifications.
 */
const builder = yargs => {
  // Disable yargs parsing of commands and options because it's forwarded
  // to Prisma CLI.
  yargs.strictOptions(false).strictCommands(false).strict(false).parserConfiguration({
    'camel-case-expansion': false
  }).help(false).version(false);
};
exports.builder = builder;
const handler = async options => {
  const {
    handler
  } = await import('./prismaHandler.js');
  return handler(options);
};
exports.handler = handler;