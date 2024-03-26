"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.alias = void 0;
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
const command = exports.command = 'flightcontrol <side>';
const alias = exports.alias = 'fc';
const description = exports.description = 'Build, Migrate, and Serve commands for Flightcontrol deploy';
const builder = yargs => {
  yargs.positional('side', {
    choices: ['api', 'web'],
    description: 'Side to deploy',
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
    description: 'Apply data migrations',
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
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'deploy flightcontrol',
    side,
    prisma,
    dataMigrate,
    serve
  });
  const rwjsPaths = (0, _projectConfig.getPaths)();
  const execaConfig = {
    cwd: rwjsPaths.base,
    shell: true,
    stdio: 'inherit'
  };
  async function runApiCommands() {
    if (!serve) {
      console.log('Building api...');
      _execa.default.commandSync('yarn rw build api --verbose', execaConfig);
      if (prisma) {
        console.log('Running database migrations...');
        _execa.default.commandSync(`node_modules/.bin/prisma migrate deploy --schema "${rwjsPaths.api.dbSchema}"`, execaConfig);
      }
      if (dataMigrate) {
        console.log('Running data migrations...');
        _execa.default.commandSync('yarn rw dataMigrate up', execaConfig);
      }
      return;
    }
    const serverFilePath = _path.default.join(rwjsPaths.api.dist, 'server.js');
    const hasServerFile = _fsExtra.default.pathExistsSync(serverFilePath);
    if (hasServerFile) {
      (0, _execa.default)(`yarn node ${serverFilePath}`, execaConfig);
    } else {
      const {
        handler
      } = await import('@redwoodjs/api-server/dist/apiCLIConfigHandler.js');
      handler();
    }
  }
  async function runWebCommands() {
    console.log('Building web...');
    _execa.default.commandSync('yarn rw build web --verbose', execaConfig);
  }
  if (side === 'api') {
    runApiCommands();
  } else if (side === 'web') {
    runWebCommands();
  }
};
exports.handler = handler;