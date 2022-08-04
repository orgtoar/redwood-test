"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _apiServer = require("@redwoodjs/api-server");

var _config = require("@redwoodjs/internal/dist/config");

var _lib = require("../../lib");

const command = 'render <side>';
exports.command = command;
const description = 'Build, Migrate, and Serve command for Render deploy';
exports.description = description;

const builder = yargs => {
  yargs.positional('side', {
    choices: ['api', 'web'],
    description: 'select side to build',
    type: 'string'
  }).option('prisma', {
    description: 'Apply database migrations',
    type: 'boolean',
    default: 'true'
  }).option('data-migrate', {
    description: 'Migrate the data in your database',
    type: 'boolean',
    default: 'true',
    alias: 'dm'
  }).epilogue(`For more commands, options, and examples, see ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#deploy')}`);
}; // Telemetry mem usage exceeds Render free plan limit for API service
// Because telemetryMiddleware is added to Yargs as middleware,
// we need to set env outside handler to correctly disable Telemetry


exports.builder = builder;

if (process.argv.slice(2).includes('api')) {
  process.env.REDWOOD_DISABLE_TELEMETRY = 1;
}

const handler = async ({
  side,
  prisma,
  dm: dataMigrate
}) => {
  const rwjsPaths = (0, _lib.getPaths)();
  const execaConfig = {
    shell: true,
    stdio: 'inherit',
    cwd: rwjsPaths.base,
    extendEnv: true,
    cleanup: true
  };

  async function runApiCommands() {
    var _getConfig$api;

    prisma && _execa.default.sync(_path.default.join(rwjsPaths.base, 'node_modules/.bin/prisma'), ['migrate', 'deploy', '--schema', `"${rwjsPaths.api.dbSchema}"`], execaConfig);
    dataMigrate && _execa.default.sync('yarn rw dataMigrate up', execaConfig);
    await (0, _apiServer.apiServerHandler)({
      port: ((_getConfig$api = (0, _config.getConfig)().api) === null || _getConfig$api === void 0 ? void 0 : _getConfig$api.port) || 8911,
      apiRootPath: '/'
    });
  }

  async function runWebCommands() {
    _execa.default.sync('yarn install', execaConfig);

    _execa.default.sync('yarn rw build web', execaConfig);
  }

  if (side === 'api') {
    runApiCommands();
  } else if (side === 'web') {
    console.log('\nRunning yarn install and building web...');
    runWebCommands();
  } else {
    console.log('Error with arguments provided'); // you broke something, which should be caught by Yargs
  }
};

exports.handler = handler;