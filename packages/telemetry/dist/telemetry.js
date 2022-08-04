"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timedTelemetry = exports.telemetryMiddleware = exports.errorTelemetry = void 0;

var _child_process = require("child_process");

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

var _paths = require("@redwoodjs/internal/dist/paths");

const APP_ROOT = (0, _paths.getPaths)().base;

const spawnProcess = (...args) => {
  (0, _child_process.spawn)(process.execPath, [_path.default.join(__dirname, 'scripts', 'invoke.js'), ...args, '--root', APP_ROOT], {
    detached: process.env.REDWOOD_VERBOSE_TELEMETRY ? false : true,
    stdio: process.env.REDWOOD_VERBOSE_TELEMETRY ? 'inherit' : 'ignore',
    windowsHide: true
  }).unref();
}; // wrap a function in this call to get a telemetry hit including how long it took


const timedTelemetry = async (argv, options, func) => {
  if (process.env.REDWOOD_DISABLE_TELEMETRY) {
    return func.call(void 0);
  }

  const start = new Date();
  const result = await func.call(void 0);
  const duration = new Date().getTime() - start.getTime();
  spawnProcess('--argv', JSON.stringify(argv), '--duration', duration.toString(), '--type', JSON.stringify(options.type));
  return result;
}; // Returns 'Windows_NT' on Windows.
// See https://nodejs.org/docs/latest-v12.x/api/os.html#os_os_type.


exports.timedTelemetry = timedTelemetry;
const isWindows = _os.default.type() === 'Windows_NT';

const errorTelemetry = async (argv, error) => {
  // FIXME: on Windows, cmd opens and closes a few times.
  // See https://github.com/redwoodjs/redwood/issues/5728.
  if (isWindows || process.env.REDWOOD_DISABLE_TELEMETRY) {
    return;
  }

  spawnProcess('--argv', JSON.stringify(argv), '--error', JSON.stringify(error));
}; // used as yargs middleware when any command is invoked


exports.errorTelemetry = errorTelemetry;

const telemetryMiddleware = async () => {
  // FIXME: on Windows, cmd opens and closes a few times.
  // See https://github.com/redwoodjs/redwood/issues/5728.
  if (isWindows || process.env.REDWOOD_DISABLE_TELEMETRY) {
    return;
  }

  spawnProcess('--argv', JSON.stringify(process.argv));
};

exports.telemetryMiddleware = telemetryMiddleware;