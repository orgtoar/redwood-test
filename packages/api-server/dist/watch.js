#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.some.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.some.js");

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
    killApiServer();
    console.log(_ansiColors.default.redBright(`[GQL Server Error] - Schema validation failed`));
    console.error(_ansiColors.default.red(e === null || e === void 0 ? void 0 : e.message));
    console.log(_ansiColors.default.redBright('-'.repeat(40)));
    delayRestartServer.cancel();
    return false;
  }
};

const rebuildApiServer = () => {
  try {
    // Shutdown API server
    killApiServer();
    const buildTs = Date.now();
    process.stdout.write(_ansiColors.default.dim(_ansiColors.default.italic('Building... ')));
    (0, _api.buildApi)();
    console.log(_ansiColors.default.dim(_ansiColors.default.italic('Took ' + (Date.now() - buildTs) + ' ms')));
    const forkOpts = {
      execArgv: process.execArgv
    };
    const debugPort = argv['debug-port'];

    if (debugPort) {
      forkOpts.execArgv = forkOpts.execArgv.concat([`--inspect=${debugPort}`]);
    } // Start API server


    httpServerProcess = (0, _child_process.fork)(_path.default.join(__dirname, 'index.js'), ['api', '--port', (0, _config.getConfig)().api.port.toString()], forkOpts);
  } catch (e) {
    console.error(e);
  }
}; // We want to delay exception when multiple files are modified on the filesystem,
// this usually happens when running RedwoodJS generator commands.
// Local writes are very fast, but writes in e2e environments are not,
// so allow the default to be adjust with a env-var.


const delayRestartServer = (0, _lodash.debounce)(rebuildApiServer, process.env.RWJS_DELAY_RESTART ? parseInt(process.env.RWJS_DELAY_RESTART, 10) : 5); // NOTE: the file comes through as a unix path, even on windows
// So we need to convert the rwjsPaths

const IGNORED_API_PATHS = ['api/dist', // use this, because using rwjsPaths.api.dist seems to not ignore on first build
rwjsPaths.api.types, rwjsPaths.api.db].map(path => (0, _paths.ensurePosixPath)(path));

_chokidar.default.watch(rwjsPaths.api.base, {
  persistent: true,
  ignoreInitial: true,
  ignored: file => {
    const x = file.includes('node_modules') || IGNORED_API_PATHS.some(ignoredPath => file.includes(ignoredPath)) || ['.DS_Store', '.db', '.sqlite', '-journal', '.test.js', '.test.ts', '.scenarios.ts', '.scenarios.js', '.d.ts', '.log'].some(ext => file.endsWith(ext));
    return x;
  }
}).on('ready', async () => {
  rebuildApiServer();
  await validate();
}).on('all', async (eventName, filePath) => {
  // We validate here, so that developers will see the error
  // As they're running the dev server
  if (filePath.includes('.sdl')) {
    const isValid = await validate(); // Exit early if not valid

    if (!isValid) {
      return;
    }
  }

  console.log(_ansiColors.default.dim(`[${eventName}] ${filePath.replace(rwjsPaths.api.base, '')}`));
  delayRestartServer.cancel();
  delayRestartServer();
});