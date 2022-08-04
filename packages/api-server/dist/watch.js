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

var _path = _interopRequireDefault(require("path"));

var _ansiColors = _interopRequireDefault(require("ansi-colors"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _lodash = require("lodash");

var _helpers = require("yargs/helpers");

var _yargs = _interopRequireDefault(require("yargs/yargs"));

var _api = require("@redwoodjs/internal/dist/build/api");

var _config = require("@redwoodjs/internal/dist/config");

var _paths = require("@redwoodjs/internal/dist/paths");

var _validateSchema = require("@redwoodjs/internal/dist/validateSchema");

var _context3;

const argv = (0, _yargs.default)((0, _helpers.hideBin)(process.argv)).option('debug-port', {
  alias: 'dp',
  description: 'Debugging port',
  type: 'number'
}).help().alias('help', 'h').parseSync();
const rwjsPaths = (0, _paths.getPaths)();

_dotenv.default.config({
  path: rwjsPaths.base
}); // TODO:
// 1. Move this file out of the HTTP server, and place it in the CLI?


let httpServerProcess;

const killApiServer = () => {
  var _httpServerProcess, _httpServerProcess2;

  (_httpServerProcess = httpServerProcess) === null || _httpServerProcess === void 0 ? void 0 : _httpServerProcess.emit('exit');
  (_httpServerProcess2 = httpServerProcess) === null || _httpServerProcess2 === void 0 ? void 0 : _httpServerProcess2.kill();
};

const validate = async () => {
  try {
    await (0, _validateSchema.loadAndValidateSdls)();
    return true;
  } catch (e) {
    var _context;

    killApiServer();
    console.log(_ansiColors.default.redBright(`[GQL Server Error] - Schema validation failed`));
    console.error(_ansiColors.default.red(e === null || e === void 0 ? void 0 : e.message));
    console.log(_ansiColors.default.redBright((0, _repeat.default)(_context = '-').call(_context, 40)));
    delayRestartServer.cancel();
    return false;
  }
};

const rebuildApiServer = () => {
  try {
    // Shutdown API server
    killApiServer();
    const buildTs = (0, _now.default)();
    process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Building... ')));
    (0, _api.buildApi)();
    console.log(_ansiColors.default.dim(_ansiColors.default.italic('Took ' + ((0, _now.default)() - buildTs) + ' ms')));
    const forkOpts = {
      execArgv: process.execArgv
    };
    const debugPort = argv['debug-port'];

    if (debugPort) {
      var _context2;

      forkOpts.execArgv = (0, _concat.default)(_context2 = forkOpts.execArgv).call(_context2, [`--inspect=${debugPort}`]);
    } // Start API server


    httpServerProcess = (0, _child_process.fork)(_path.default.join(__dirname, 'index.js'), ['api', '--port', (0, _config.getConfig)().api.port.toString()], forkOpts);
  } catch (e) {
    console.error(e);
  }
}; // We want to delay exception when multiple files are modified on the filesystem,
// this usually happens when running RedwoodJS generator commands.
// Local writes are very fast, but writes in e2e environments are not,
// so allow the default to be adjust with a env-var.


const delayRestartServer = (0, _lodash.debounce)(rebuildApiServer, process.env.RWJS_DELAY_RESTART ? (0, _parseInt2.default)(process.env.RWJS_DELAY_RESTART, 10) : 5); // NOTE: the file comes through as a unix path, even on windows
// So we need to convert the rwjsPaths

const IGNORED_API_PATHS = (0, _map.default)(_context3 = ['api/dist', // use this, because using rwjsPaths.api.dist seems to not ignore on first build
rwjsPaths.api.types, rwjsPaths.api.db]).call(_context3, path => (0, _paths.ensurePosixPath)(path));

_chokidar.default.watch(rwjsPaths.api.base, {
  persistent: true,
  ignoreInitial: true,
  ignored: file => {
    var _context4;

    const x = (0, _includes.default)(file).call(file, 'node_modules') || (0, _some.default)(IGNORED_API_PATHS).call(IGNORED_API_PATHS, ignoredPath => (0, _includes.default)(file).call(file, ignoredPath)) || (0, _some.default)(_context4 = ['.DS_Store', '.db', '.sqlite', '-journal', '.test.js', '.test.ts', '.scenarios.ts', '.scenarios.js', '.d.ts', '.log']).call(_context4, ext => (0, _endsWith.default)(file).call(file, ext));
    return x;
  }
}).on('ready', async () => {
  rebuildApiServer();
  await validate();
}).on('all', async (eventName, filePath) => {
  // We validate here, so that developers will see the error
  // As they're running the dev server
  if ((0, _includes.default)(filePath).call(filePath, '.sdl')) {
    const isValid = await validate(); // Exit early if not valid

    if (!isValid) {
      return;
    }
  }

  console.log(_ansiColors.default.dim(`[${eventName}] ${filePath.replace(rwjsPaths.api.base, '')}`));
  delayRestartServer.cancel();
  delayRestartServer();
});