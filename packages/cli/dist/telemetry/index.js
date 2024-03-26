"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.shutdownTelemetry = shutdownTelemetry;
exports.startTelemetry = startTelemetry;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _api = _interopRequireWildcard(require("@opentelemetry/api"));
var _sdkTraceNode = require("@opentelemetry/sdk-trace-node");
var _helpers = require("yargs/helpers");
var _background = require("../lib/background");
var _exporter = require("./exporter");
/**
 * @type NodeTracerProvider
 */
let traceProvider;

/**
 * @type SimpleSpanProcessor
 */
let traceProcessor;

/**
 * @type CustomFileExporter
 */
let traceExporter;

/**
 * @type boolean
 */
let isStarted = false;

/**
 * @type boolean
 */
let isShutdown = false;
async function startTelemetry() {
  if (isStarted) {
    return;
  }
  isStarted = true;
  try {
    _api.diag.setLogger(new _api.DiagConsoleLogger(), _api.DiagLogLevel.ERROR);

    // Tracing
    traceProvider = new _sdkTraceNode.NodeTracerProvider({
      sampler: {
        shouldSample: () => {
          return {
            decision: isShutdown ? _sdkTraceNode.SamplingDecision.NOT_RECORD : _sdkTraceNode.SamplingDecision.RECORD_AND_SAMPLED
          };
        },
        toString: () => {
          return 'AlwaysSampleWhenNotShutdown';
        }
      }
    });
    traceExporter = new _exporter.CustomFileExporter();
    traceProcessor = new _sdkTraceNode.SimpleSpanProcessor(traceExporter);
    traceProvider.addSpanProcessor(traceProcessor);
    traceProvider.register();

    // Without any listeners for these signals, nodejs will terminate the process and will not
    // trigger the exit event when doing so. This means our process.on('exit') handler will not run.
    // We add a listner which either calls process.exit or if some other handler has been added,
    // then we leave it to that handler to handle the signal.
    // See https://nodejs.org/dist/latest/docs/api/process.html#signal-events for more info on the
    // behaviour of nodejs for various signals.
    const cleanArgv = (0, _helpers.hideBin)(process.argv);
    if (!(0, _includes.default)(cleanArgv).call(cleanArgv, 'sb') && !(0, _includes.default)(cleanArgv).call(cleanArgv, 'storybook')) {
      for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
        process.on(signal, () => {
          if (process.listenerCount(signal) === 1) {
            console.log(`Received ${signal} signal, exiting...`);
            process.exit();
          }
        });
      }
    } else {
      process.on('shutdown-telemetry', () => {
        shutdownTelemetry();
      });
    }

    // Ensure to shutdown telemetry when the process exits so that we can be sure that all spans
    // are ended and all data is flushed to the exporter.
    process.on('exit', () => {
      shutdownTelemetry();
    });
  } catch (error) {
    console.error('Telemetry error');
    console.error(error);
  }
}
function shutdownTelemetry() {
  if (isShutdown || !isStarted) {
    return;
  }
  isShutdown = true;
  try {
    // End the active spans
    while (_api.default.trace.getActiveSpan()?.isRecording()) {
      _api.default.trace.getActiveSpan()?.end();
    }

    // Shutdown exporter to ensure all data is flushed
    traceExporter?.shutdown();

    // Send the telemetry in a background process, so we don't block the CLI
    (0, _background.spawnBackgroundProcess)('telemetry', 'yarn', ['node', _path.default.join(__dirname, 'send.js')]);
  } catch (error) {
    console.error('Telemetry error');
    console.error(error);
  }
}