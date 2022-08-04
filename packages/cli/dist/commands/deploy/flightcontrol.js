"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.alias = void 0;

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _apiServer = require("@redwoodjs/api-server");

var _config = require("@redwoodjs/internal/dist/config");

var _lib = require("../../lib");

const command = 'flightcontrol <side>';
exports.command = command;
const alias = 'fc';
exports.alias = alias;
const description = 'Build, Migrate, and Serve commands for Flightcontrol deploy';
exports.description = description;

const builder = yargs => {
  yargs.positional('side', {
    choices: ['api', 'web'],
    description: 'select side to build',
    type: 'string'
  }).option('prisma', {
    description: 'Apply database migrations',
    type: 'boolean',
    default: true
  }).option('serve', {
    description: 'Run server for api in production',
    type: 'boolean',
    default: false
  }).option('data-migrate', {
    description: 'Migrate the data in your database',
    type: 'boolean',
    default: true,
    alias: 'dm'
  }).epilogue(`For more commands, options, and examples, see ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#deploy')}`);
};

exports.builder = builder;

const handler = async ({
  side,
  serve,
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
    if (serve) {
      var _getConfig$api;

      console.log('\nStarting api...');
      await (0, _apiServer.apiServerHandler)({
        port: ((_getConfig$api = (0, _config.getConfig)().api) === null || _getConfig$api === void 0 ? void 0 : _getConfig$api.port) || 8911,
        apiRootPath: '/'
      });
    } else {
      console.log('\nBuilding api...');

      _execa.default.sync('yarn rw build api', execaConfig);

      prisma && _execa.default.sync(_path.default.join(rwjsPaths.base, 'node_modules/.bin/prisma'), ['migrate', 'deploy', '--schema', `"${rwjsPaths.api.dbSchema}"`], execaConfig);
      dataMigrate && _execa.default.sync('yarn rw dataMigrate up', execaConfig);
    }
  }

  async function runWebCommands() {
    _execa.default.sync('yarn rw build web', execaConfig);
  }

  if (side === 'api') {
    runApiCommands();
  } else if (side === 'web') {
    console.log('\nBuilding web...');
    runWebCommands();
  } else {
    console.log('Error with arguments provided'); // you broke something, which should be caught by Yargs
  }
};

exports.handler = handler;