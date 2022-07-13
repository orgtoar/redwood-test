"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.timedTelemetry = exports.telemetryMiddleware = exports.errorTelemetry = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _child_process = require("child_process");

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

var _internal = require("@redwoodjs/internal");

const APP_ROOT = (0, _internal.getPaths)().base;

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
  spawnProcess('--argv', (0, _stringify.default)(argv), '--duration', duration.toString(), '--type', (0, _stringify.default)(options.type));
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

  spawnProcess('--argv', (0, _stringify.default)(argv), '--error', (0, _stringify.default)(error));
}; // used as yargs middleware when any command is invoked


exports.errorTelemetry = errorTelemetry;

const telemetryMiddleware = async () => {
  // FIXME: on Windows, cmd opens and closes a few times.
  // See https://github.com/redwoodjs/redwood/issues/5728.
  if (isWindows || process.env.REDWOOD_DISABLE_TELEMETRY) {
    return;
  }

  spawnProcess('--argv', (0, _stringify.default)(process.argv));
};

exports.telemetryMiddleware = telemetryMiddleware;