"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _context, _context2;
// It's easy for the api side to exceed Render's free-plan limit.
// Because telemetryMiddleware is added to Yargs as middleware,
// we need to set the env var here outside the handler to correctly disable it.
if ((0, _includes.default)(_context = (0, _slice.default)(_context2 = process.argv).call(_context2, 2)).call(_context, 'api')) {
  process.env.REDWOOD_DISABLE_TELEMETRY = 1;
}
const command = exports.command = 'render <side>';
const description = exports.description = 'Build, migrate, and serve command for Render deploy';
const builder = yargs => {
  yargs.positional('side', {
    choices: ['api', 'web'],
    description: 'Side to deploy',
    type: 'string'
  }).option('prisma', {
    description: 'Apply database migrations',
    type: 'boolean',
    default: true
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
  prisma,
  dataMigrate
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'deploy render',
    side,
    prisma,
    dataMigrate
  });
  const rwjsPaths = (0, _projectConfig.getPaths)();
  const execaConfig = {
    cwd: rwjsPaths.base,
    shell: true,
    stdio: 'inherit'
  };
  async function runApiCommands() {
    if (prisma) {
      console.log('Running database migrations...');
      _execa.default.commandSync(`node_modules/.bin/prisma migrate deploy --schema "${rwjsPaths.api.dbSchema}"`, execaConfig);
    }
    if (dataMigrate) {
      console.log('Running data migrations...');
      const packageJson = _fsExtra.default.readJsonSync(_path.default.join(rwjsPaths.base, 'package.json'));
      const hasDataMigratePackage = !!packageJson.devDependencies['@redwoodjs/cli-data-migrate'];
      if (!hasDataMigratePackage) {
        console.error(["Skipping data migrations; your project doesn't have the `@redwoodjs/cli-data-migrate` package as a dev dependency.", "Without it installed, you're likely to run into memory issues during deploy.", "If you want to run data migrations, add the package to your project's root package.json and deploy again:", '', '```', 'yarn add -D @redwoodjs/cli-data-migrate', '```'].join('\n'));
      } else {
        _execa.default.commandSync('yarn rw dataMigrate up', execaConfig);
      }
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
    _execa.default.commandSync('yarn install', execaConfig);
    _execa.default.commandSync('yarn rw build web --verbose', execaConfig);
  }
  if (side === 'api') {
    runApiCommands();
  } else if (side === 'web') {
    runWebCommands();
  }
};
exports.handler = handler;