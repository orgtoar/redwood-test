"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _fs = _interopRequireDefault(require("fs"));

var _process = require("process");

var _concurrently = _interopRequireDefault(require("concurrently"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _internal = require("@redwoodjs/internal");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

var _checkForBabelConfig = _interopRequireDefault(require("../middleware/checkForBabelConfig"));

const defaultApiDebugPort = 18911;
const command = 'dev [side..]';
exports.command = command;
const description = 'Start development servers for api, and web';
exports.description = description;

const builder = yargs => {
  yargs.positional('side', {
    choices: ['api', 'web'],
    default: ['api', 'web'],
    description: 'Which dev server(s) to start',
    type: 'array'
  }).option('forward', {
    alias: 'fwd',
    description: 'String of one or more Webpack DevServer config options, for example: `--fwd="--port=1234 --no-open"`',
    type: 'string'
  }).option('generate', {
    type: 'boolean',
    default: true,
    description: 'Generate artifacts'
  }).option('watchNodeModules', {
    type: 'boolean',
    description: 'Reload on changes to node_modules'
  }).option('apiDebugPort', {
    type: 'number',
    description: 'Port on which to expose API server debugger. If you supply the flag with no value it defaults to 18911.'
  }).middleware(_checkForBabelConfig.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#dev')}`);
};

exports.builder = builder;

const handler = async ({
  side = ['api', 'web'],
  forward = '',
  generate = true,
  watchNodeModules = process.env.RWJS_WATCH_NODE_MODULES === '1',
  apiDebugPort
}) => {
  var _context, _context2;

  const rwjsPaths = (0, _lib.getPaths)();

  if ((0, _includes.default)(side).call(side, 'api')) {
    try {
      await (0, _generatePrismaClient.generatePrismaClient)({
        verbose: false,
        force: false,
        schema: rwjsPaths.api.dbSchema
      });
    } catch (e) {
      (0, _telemetry.errorTelemetry)(process.argv, `Error generating prisma client: ${e.message}`);
      console.error(_colors.default.error(e.message));
    }

    try {
      await (0, _internal.shutdownPort)((0, _internal.getConfig)().api.port);
    } catch (e) {
      (0, _telemetry.errorTelemetry)(process.argv, `Error shutting down "api": ${e.message}`);
      console.error(`Error whilst shutting down "api" port: ${_colors.default.error(e.message)}`);
    }
  }

  if ((0, _includes.default)(side).call(side, 'web')) {
    try {
      await (0, _internal.shutdownPort)((0, _internal.getConfig)().web.port);
    } catch (e) {
      (0, _telemetry.errorTelemetry)(process.argv, `Error shutting down "web": ${e.message}`);
      console.error(`Error whilst shutting down "web" port: ${_colors.default.error(e.message)}`);
    }
  }

  const webpackDevConfig = require.resolve('@redwoodjs/core/config/webpack.development.js');

  const getApiDebugFlag = () => {
    // Passed in flag takes precedence
    if (apiDebugPort) {
      return `--debug-port ${apiDebugPort}`;
    } else if ((0, _includes.default)(_process.argv).call(_process.argv, '--apiDebugPort')) {
      return `--debug-port ${defaultApiDebugPort}`;
    }

    const apiDebugPortInToml = (0, _internal.getConfig)().api.debugPort;

    if (apiDebugPortInToml) {
      return `--debug-port ${apiDebugPortInToml}`;
    } // Dont pass in debug port flag, unless configured


    return '';
  };

  const redwoodConfigPath = (0, _internal.getConfigPath)();
  /** @type {Record<string, import('concurrently').CommandObj>} */

  const jobs = {
    api: {
      name: 'api',
      command: `yarn cross-env NODE_ENV=development NODE_OPTIONS=--enable-source-maps yarn nodemon --quiet --watch "${redwoodConfigPath}" --exec "yarn rw-api-server-watch ${getApiDebugFlag()} | rw-log-formatter"`,
      prefixColor: 'cyan',
      runWhen: () => _fs.default.existsSync(rwjsPaths.api.src)
    },
    web: {
      name: 'web',
      command: `cd "${rwjsPaths.web.base}" && yarn cross-env NODE_ENV=development RWJS_WATCH_NODE_MODULES=${watchNodeModules ? '1' : ''} webpack serve --config "${webpackDevConfig}" ${forward}`,
      prefixColor: 'blue',
      runWhen: () => _fs.default.existsSync(rwjsPaths.web.src)
    },
    gen: {
      name: 'gen',
      command: 'yarn rw-gen-watch',
      prefixColor: 'green',
      runWhen: () => generate
    }
  }; // TODO: Convert jobs to an array and supply cwd command.

  const {
    result
  } = (0, _concurrently.default)((0, _filter.default)(_context = (0, _map.default)(_context2 = (0, _keys.default)(jobs)).call(_context2, job => {
    if ((0, _includes.default)(side).call(side, job) || job === 'gen') {
      return jobs[job];
    }
  })).call(_context, job => job && job.runWhen()), {
    prefix: '{name} |',
    timestampFormat: 'HH:mm:ss'
  });
  result.catch(e => {
    if (typeof (e === null || e === void 0 ? void 0 : e.message) !== 'undefined') {
      (0, _telemetry.errorTelemetry)(process.argv, `Error concurrently starting sides: ${e.message}`);
      console.error(_colors.default.error(e.message));
      process.exit(1);
    }
  });
};

exports.handler = handler;