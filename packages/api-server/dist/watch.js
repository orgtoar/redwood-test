#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
var _repeat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/repeat"));
var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/ends-with"));
var _child_process = require("child_process");
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _ansiColors = _interopRequireDefault(require("ansi-colors"));
var _chokidar = _interopRequireDefault(require("chokidar"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _lodash = require("lodash");
var _helpers = require("yargs/helpers");
var _yargs = _interopRequireDefault(require("yargs/yargs"));
var _api = require("@redwoodjs/internal/dist/build/api");
var _validateSchema = require("@redwoodjs/internal/dist/validateSchema");
var _projectConfig = require("@redwoodjs/project-config");
var _context4;
const argv = (0, _yargs.default)((0, _helpers.hideBin)(process.argv)).option('debug-port', {
  alias: 'dp',
  description: 'Debugging port',
  type: 'number'
}).option('port', {
  alias: 'p',
  description: 'Port',
  type: 'number'
}).help().alias('help', 'h').parseSync();
const rwjsPaths = (0, _projectConfig.getPaths)();
if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  _dotenv.default.config({
    path: _path.default.join((0, _projectConfig.getPaths)().base, '.env'),
    // @ts-expect-error The types for dotenv-defaults are using an outdated version of dotenv
    defaults: _path.default.join((0, _projectConfig.getPaths)().base, '.env.defaults'),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = 'true';
}
let httpServerProcess;
const killApiServer = () => {
  httpServerProcess?.emit('exit');
  httpServerProcess?.kill();
};
const validate = async () => {
  try {
    await (0, _validateSchema.loadAndValidateSdls)();
    return true;
  } catch (e) {
    var _context;
    killApiServer();
    console.log(_ansiColors.default.redBright(`[GQL Server Error] - Schema validation failed`));
    console.error(_ansiColors.default.red(e?.message));
    console.log(_ansiColors.default.redBright((0, _repeat.default)(_context = '-').call(_context, 40)));
    debouncedBuild.cancel();
    debouncedRebuild.cancel();
    return false;
  }
};
const buildAndRestart = async ({
  rebuild = false,
  clean = false
} = {}) => {
  try {
    // Shutdown API server
    killApiServer();
    const buildTs = (0, _now.default)();
    console.log(_ansiColors.default.dim.italic('Building...'));
    if (clean) {
      await (0, _api.cleanApiBuild)();
    }
    if (rebuild) {
      await (0, _api.rebuildApi)();
    } else {
      await (0, _api.buildApi)();
    }
    console.log(_ansiColors.default.dim.italic('Took ' + ((0, _now.default)() - buildTs) + ' ms'));
    const forkOpts = {
      execArgv: process.execArgv
    };

    // OpenTelemetry SDK Setup
    if ((0, _projectConfig.getConfig)().experimental.opentelemetry.enabled) {
      // We expect the OpenTelemetry SDK setup file to be in a specific location
      const opentelemetrySDKScriptPath = _path.default.join((0, _projectConfig.getPaths)().api.dist, 'opentelemetry.js');
      const opentelemetrySDKScriptPathRelative = _path.default.relative((0, _projectConfig.getPaths)().base, opentelemetrySDKScriptPath);
      console.log(`Setting up OpenTelemetry using the setup file: ${opentelemetrySDKScriptPathRelative}`);
      if (_fs.default.existsSync(opentelemetrySDKScriptPath)) {
        var _context2;
        forkOpts.execArgv = (0, _concat.default)(_context2 = forkOpts.execArgv).call(_context2, [`--require=${opentelemetrySDKScriptPath}`]);
      } else {
        console.error(`OpenTelemetry setup file does not exist at ${opentelemetrySDKScriptPathRelative}`);
      }
    }
    const debugPort = argv['debug-port'];
    if (debugPort) {
      var _context3;
      forkOpts.execArgv = (0, _concat.default)(_context3 = forkOpts.execArgv).call(_context3, [`--inspect=${debugPort}`]);
    }
    const port = argv.port ?? (0, _projectConfig.getConfig)().api.port;

    // Start API server

    const serverFile = (0, _projectConfig.resolveFile)(`${rwjsPaths.api.dist}/server`);
    if (serverFile) {
      httpServerProcess = (0, _child_process.fork)(serverFile, ['--port', port.toString()], forkOpts);
    } else {
      httpServerProcess = (0, _child_process.fork)(_path.default.join(__dirname, 'index.js'), ['api', '--port', port.toString()], forkOpts);
    }
  } catch (e) {
    console.error(e);
  }
};

// We want to delay exception when multiple files are modified on the filesystem,
// this usually happens when running RedwoodJS generator commands.
// Local writes are very fast, but writes in e2e environments are not,
// so allow the default to be adjust with a env-var.
const debouncedRebuild = (0, _lodash.debounce)(() => buildAndRestart({
  rebuild: true
}), process.env.RWJS_DELAY_RESTART ? (0, _parseInt2.default)(process.env.RWJS_DELAY_RESTART, 10) : 500);
const debouncedBuild = (0, _lodash.debounce)(() => buildAndRestart({
  rebuild: false
}), process.env.RWJS_DELAY_RESTART ? (0, _parseInt2.default)(process.env.RWJS_DELAY_RESTART, 10) : 500);

// NOTE: the file comes through as a unix path, even on windows
// So we need to convert the rwjsPaths

const IGNORED_API_PATHS = (0, _map.default)(_context4 = ['api/dist',
// use this, because using rwjsPaths.api.dist seems to not ignore on first build
rwjsPaths.api.types, rwjsPaths.api.db]).call(_context4, path => (0, _projectConfig.ensurePosixPath)(path));
_chokidar.default.watch([rwjsPaths.api.src], {
  persistent: true,
  ignoreInitial: true,
  ignored: file => {
    var _context5;
    const x = (0, _includes.default)(file).call(file, 'node_modules') || (0, _some.default)(IGNORED_API_PATHS).call(IGNORED_API_PATHS, ignoredPath => (0, _includes.default)(file).call(file, ignoredPath)) || (0, _some.default)(_context5 = ['.DS_Store', '.db', '.sqlite', '-journal', '.test.js', '.test.ts', '.scenarios.ts', '.scenarios.js', '.d.ts', '.log']).call(_context5, ext => (0, _endsWith.default)(file).call(file, ext));
    return x;
  }
}).on('ready', async () => {
  // First time
  await buildAndRestart({
    clean: true,
    rebuild: false
  });
  await validate();
}).on('all', async (eventName, filePath) => {
  // On sufficiently large projects (500+ files, or >= 2000 ms build times) on older machines, esbuild writing to the api directory
  // makes chokidar emit an `addDir` event. This starts an infinite loop where the api starts building itself as soon as it's finished.
  // This could probably be fixed with some sort of build caching.
  if (eventName === 'addDir' && filePath === rwjsPaths.api.base) {
    return;
  }
  if (eventName) {
    if ((0, _includes.default)(filePath).call(filePath, '.sdl')) {
      // We validate here, so that developers will see the error
      // As they're running the dev server
      const isValid = await validate();

      // Exit early if not valid
      if (!isValid) {
        return;
      }
    }
  }
  console.log(_ansiColors.default.dim(`[${eventName}] ${filePath.replace(rwjsPaths.api.base, '')}`));
  if (eventName === 'add' || eventName === 'unlink') {
    debouncedBuild.cancel();
    debouncedRebuild.cancel();
    debouncedBuild();
  } else {
    // If files have just changed, then rebuild
    debouncedRebuild.cancel();
    debouncedRebuild();
  }
});