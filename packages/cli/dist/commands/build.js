"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _project = require("../lib/project");

var _checkForBabelConfig = _interopRequireDefault(require("../middleware/checkForBabelConfig"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const command = 'build [side..]';
exports.command = command;
const description = 'Build for production';
exports.description = description;

const builder = yargs => {
  const choices = (0, _project.sides)();
  yargs.positional('side', {
    choices,
    default: choices,
    description: 'Which side(s) to build',
    type: 'array'
  }).option('stats', {
    default: false,
    description: `Use ${(0, _terminalLink.default)('Webpack Bundle Analyzer', 'https://github.com/webpack-contrib/webpack-bundle-analyzer')}`,
    type: 'boolean'
  }).option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more',
    type: 'boolean'
  }).option('prerender', {
    default: true,
    description: 'Prerender after building web',
    type: 'boolean'
  }).option('prisma', {
    type: 'boolean',
    alias: 'db',
    default: true,
    description: 'Generate the Prisma client'
  }).option('performance', {
    alias: 'perf',
    type: 'boolean',
    default: false,
    description: 'Measure build performance'
  }).middleware(_checkForBabelConfig.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#build')}`);
};

exports.builder = builder;

const handler = async options => {
  const {
    handler
  } = await Promise.resolve().then(() => _interopRequireWildcard(require('./buildHandler')));
  return handler(options);
};

exports.handler = handler;