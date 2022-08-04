"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const command = 'prisma [commands..]';
exports.command = command;
const description = 'Run Prisma CLI with experimental features';
/**
 * This is a lightweight wrapper around Prisma's CLI with some Redwood CLI modifications.
 */

exports.description = description;

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
  } = await Promise.resolve().then(() => _interopRequireWildcard(require('./prismaHandler.js')));
  return handler(options);
};

exports.handler = handler;