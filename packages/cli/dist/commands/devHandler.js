"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevNodeOptions = getDevNodeOptions;
exports.handler = void 0;
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _matchAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/match-all"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _process = require("process");
var _concurrently = _interopRequireDefault(require("concurrently"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _dev = require("@redwoodjs/internal/dist/dev");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../lib");
var _colors = _interopRequireDefault(require("../lib/colors"));
var _exit = require("../lib/exit");
var _generatePrismaClient = require("../lib/generatePrismaClient");
var _ports = require("../lib/ports");
var _project = require("../lib/project");
const defaultApiDebugPort = 18911;
const handler = async ({
  side = ['api', 'web'],
  forward = '',
  generate = true,
  watchNodeModules = process.env.RWJS_WATCH_NODE_MODULES === '1',
  apiDebugPort
}) => {
  var _context2, _context3;
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'dev',
    side: (0, _stringify.default)(side),
    generate,
    watchNodeModules
  });
  const rwjsPaths = (0, _lib.getPaths)();
  const serverFile = (0, _project.serverFileExists)();

  // Starting values of ports from config (redwood.toml)
  let apiPreferredPort = (0, _parseInt2.default)((0, _projectConfig.getConfig)().api.port);
  let webPreferredPort = (0, _parseInt2.default)((0, _projectConfig.getConfig)().web.port);

  // Assume we can have the ports we want
  let apiAvailablePort = apiPreferredPort;
  let apiPortChangeNeeded = false;
  let webAvailablePort = webPreferredPort;
  let webPortChangeNeeded = false;

  // Check api port, unless there's a serverFile. If there is a serverFile, we
  // don't know what port will end up being used in the end. It's up to the
  // author of the server file to decide and handle that
  if ((0, _includes.default)(side).call(side, 'api') && !serverFile) {
    apiAvailablePort = await (0, _ports.getFreePort)(apiPreferredPort);
    if (apiAvailablePort === -1) {
      (0, _exit.exitWithError)(undefined, {
        message: `Could not determine a free port for the api server`
      });
    }
    apiPortChangeNeeded = apiAvailablePort !== apiPreferredPort;
  }

  // Check web port
  if ((0, _includes.default)(side).call(side, 'web')) {
    // Extract any ports the user forwarded to the webpack server and prefer that instead
    const forwardedPortMatches = [...(0, _matchAll.default)(forward).call(forward, /\-\-port(\=|\s)(?<port>[^\s]*)/g)];
    if (forwardedPortMatches.length) {
      webPreferredPort = (0, _parseInt2.default)(forwardedPortMatches.pop().groups.port);
    }
    webAvailablePort = await (0, _ports.getFreePort)(webPreferredPort, [apiPreferredPort, apiAvailablePort]);
    if (webAvailablePort === -1) {
      (0, _exit.exitWithError)(undefined, {
        message: `Could not determine a free port for the web server`
      });
    }
    webPortChangeNeeded = webAvailablePort !== webPreferredPort;
  }

  // Check for port conflict and exit with message if found
  if (apiPortChangeNeeded || webPortChangeNeeded) {
    var _context;
    const message = (0, _filter.default)(_context = ['The currently configured ports for the development server are', 'unavailable. Suggested changes to your ports, which can be changed in', 'redwood.toml, are:\n', apiPortChangeNeeded && ` - API to use port ${apiAvailablePort} instead`, apiPortChangeNeeded && 'of your currently configured', apiPortChangeNeeded && `${apiPreferredPort}\n`, webPortChangeNeeded && ` - Web to use port ${webAvailablePort} instead`, webPortChangeNeeded && 'of your currently configured', webPortChangeNeeded && `${webPreferredPort}\n`, '\nCannot run the development server until your configured ports are', 'changed or become available.']).call(_context, Boolean).join(' ');
    (0, _exit.exitWithError)(undefined, {
      message
    });
  }
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

    // Again, if a server file is configured, we don't know what port it'll end
    // up using
    if (!serverFile) {
      try {
        await (0, _dev.shutdownPort)(apiAvailablePort);
      } catch (e) {
        (0, _telemetry.errorTelemetry)(process.argv, `Error shutting down "api": ${e.message}`);
        console.error(`Error whilst shutting down "api" port: ${_colors.default.error(e.message)}`);
      }
    }
  }
  if ((0, _includes.default)(side).call(side, 'web')) {
    try {
      await (0, _dev.shutdownPort)(webAvailablePort);
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
    const apiDebugPortInToml = (0, _projectConfig.getConfig)().api.debugPort;
    if (apiDebugPortInToml) {
      return `--debug-port ${apiDebugPortInToml}`;
    }

    // Don't pass in debug port flag, unless configured
    return '';
  };
  const redwoodConfigPath = (0, _projectConfig.getConfigPath)();
  const streamingSsrEnabled = (0, _projectConfig.getConfig)().experimental.streamingSsr?.enabled;

  // @TODO (Streaming) Lot of temporary feature flags for started dev server.
  // Written this way to make it easier to read

  // 1. default: Vite (SPA)
  //
  // Disable the new warning in Vite v5 about the CJS build being deprecated
  // so that users don't have to see it every time the dev server starts up.
  process.env.VITE_CJS_IGNORE_WARNING = 'true';
  let webCommand = `yarn cross-env NODE_ENV=development rw-vite-dev ${forward}`;

  // 2. Vite with SSR
  if (streamingSsrEnabled) {
    webCommand = `yarn cross-env NODE_ENV=development rw-dev-fe ${forward}`;
  }

  // 3. Webpack (SPA): we will remove this override after v7
  if ((0, _projectConfig.getConfig)().web.bundler === 'webpack') {
    if (streamingSsrEnabled) {
      throw new Error('Webpack does not support SSR. Please switch your bundler to Vite in redwood.toml first');
    } else {
      webCommand = `yarn cross-env NODE_ENV=development RWJS_WATCH_NODE_MODULES=${watchNodeModules ? '1' : ''} webpack serve --config "${webpackDevConfig}" ${forward}`;
    }
  }

  /** @type {Record<string, import('concurrently').CommandObj>} */
  const jobs = {
    api: {
      name: 'api',
      command: [`yarn cross-env NODE_ENV=development NODE_OPTIONS="${getDevNodeOptions()}"`, '  yarn nodemon', '    --quiet', `    --watch "${redwoodConfigPath}"`, '    --exec "yarn rw-api-server-watch', `      --port ${apiAvailablePort}`, `      ${getApiDebugFlag()}`, '      | rw-log-formatter"'].join(' '),
      prefixColor: 'cyan',
      runWhen: () => _fsExtra.default.existsSync(rwjsPaths.api.src)
    },
    web: {
      name: 'web',
      command: webCommand,
      prefixColor: 'blue',
      cwd: rwjsPaths.web.base,
      runWhen: () => _fsExtra.default.existsSync(rwjsPaths.web.src)
    },
    gen: {
      name: 'gen',
      command: 'yarn rw-gen-watch',
      prefixColor: 'green',
      runWhen: () => generate
    }
  };

  // TODO: Convert jobs to an array and supply cwd command.
  const {
    result
  } = (0, _concurrently.default)((0, _filter.default)(_context2 = (0, _map.default)(_context3 = (0, _keys.default)(jobs)).call(_context3, job => {
    if ((0, _includes.default)(side).call(side, job) || job === 'gen') {
      return jobs[job];
    }
  })).call(_context2, job => job && job.runWhen()), {
    prefix: '{name} |',
    timestampFormat: 'HH:mm:ss',
    handleInput: true
  });
  result.catch(e => {
    if (typeof e?.message !== 'undefined') {
      (0, _telemetry.errorTelemetry)(process.argv, `Error concurrently starting sides: ${e.message}`);
      (0, _exit.exitWithError)(e);
    }
  });
};

/**
 * Gets the value of the `NODE_OPTIONS` env var from `process.env`, appending `--enable-source-maps` if it's not already there.
 * See https://nodejs.org/api/cli.html#node_optionsoptions.
 *
 * @returns {string}
 */
exports.handler = handler;
function getDevNodeOptions() {
  const {
    NODE_OPTIONS
  } = process.env;
  const enableSourceMapsOption = '--enable-source-maps';
  if (!NODE_OPTIONS) {
    return enableSourceMapsOption;
  }
  if ((0, _includes.default)(NODE_OPTIONS).call(NODE_OPTIONS, enableSourceMapsOption)) {
    return NODE_OPTIONS;
  }
  return `${NODE_OPTIONS} ${enableSourceMapsOption}`;
}