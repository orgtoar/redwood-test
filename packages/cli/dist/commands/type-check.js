"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _project = require("../lib/project");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const command = 'type-check [sides..]';
exports.command = command;
const aliases = ['tsc', 'tc'];
exports.aliases = aliases;
const description = 'Run a TypeScript compiler check on your project';
exports.description = description;

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
  } = await Promise.resolve().then(() => _interopRequireWildcard(require('./type-checkHandler.js')));
  return handler(options);
};

exports.handler = handler;