"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _project = require("../lib/project");
const command = exports.command = 'type-check [sides..]';
const aliases = exports.aliases = ['tsc', 'tc'];
const description = exports.description = 'Run a TypeScript compiler check on your project';
const builder = yargs => {
  yargs.strict(false) // so that we can forward arguments to tsc
  .positional('sides', {
    default: (0, _project.sides)(),
    description: 'Which side(s) to run a typecheck on',
    type: 'array'
  }).option('prisma', {
    type: 'boolean',
    default: true,
    description: 'Generate the Prisma client'
  }).option('generate', {
    type: 'boolean',
    default: true,
    description: 'Regenerate types within the project'
  }).option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#type-check')}`);
};
exports.builder = builder;
const handler = async options => {
  const {
    handler
  } = await import('./type-checkHandler.js');
  return handler(options);
};
exports.handler = handler;