"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

var _fs = _interopRequireDefault(require("fs"));

var _process = require("process");

var _concurrently = _interopRequireDefault(require("concurrently"));

var _config = require("@redwoodjs/internal/dist/config");

var _dev = require("@redwoodjs/internal/dist/dev");

var _paths = require("@redwoodjs/internal/dist/paths");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

const defaultApiDebugPort = 18911;

const handler = async ({
  side = ['api', 'web'],
  forward = '',
  generate = true,
  watchNodeModules = process.env.RWJS_WATCH_NODE_MODULES === '1',
  apiDebugPort
}) => {
  const rwjsPaths = (0, _lib.getPaths)();

  if (side.includes('api')) {
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
      await (0, _dev.shutdownPort)((0, _config.getConfig)().api.port);
    } catch (e) {
      (0, _telemetry.errorTelemetry)(process.argv, `Error shutting down "api": ${e.message}`);
      console.error(`Error whilst shutting down "api" port: ${_colors.default.error(e.message)}`);
    }
  }

  if (side.includes('web')) {
    try {
      await (0, _dev.shutdownPort)((0, _config.getConfig)().web.port);
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
    } else if (_process.argv.includes('--apiDebugPort')) {
      return `--debug-port ${defaultApiDebugPort}`;
    }

    const apiDebugPortInToml = (0, _config.getConfig)().api.debugPort;

    if (apiDebugPortInToml) {
      return `--debug-port ${apiDebugPortInToml}`;
    } // Dont pass in debug port flag, unless configured


    return '';
  };

  const redwoodConfigPath = (0, _paths.getConfigPath)();
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
  } = (0, _concurrently.default)(Object.keys(jobs).map(job => {
    if (side.includes(job) || job === 'gen') {
      return jobs[job];
    }
  }).filter(job => job && job.runWhen()), {
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