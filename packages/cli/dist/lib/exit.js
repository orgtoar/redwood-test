"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.exitWithError = exitWithError;
var _repeat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/repeat"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _chalk = _interopRequireDefault(require("chalk"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _uuid = require("uuid");
var _cliHelpers = require("@redwoodjs/cli-helpers");
const DEFAULT_ERROR_EPILOGUE = ['Need help?', ` - Not sure about something or need advice? Reach out on our ${(0, _terminalLink.default)('Forum', 'https://community.redwoodjs.com/')}`, ` - Think you've found a bug? Open an issue on our ${(0, _terminalLink.default)('GitHub', 'https://github.com/redwoodjs/redwood')}`].join('\n');
function exitWithError(error, {
  exitCode,
  message,
  epilogue,
  includeEpilogue,
  includeReferenceCode
} = {}) {
  var _context, _context2;
  // Set the default values
  exitCode ??= error?.exitCode ?? 1;
  epilogue ??= DEFAULT_ERROR_EPILOGUE;
  includeEpilogue ??= true;
  includeReferenceCode ??= true;

  // Determine the correct error message
  message ??= error.stack ?? (error.toString() || 'Unknown error');

  // Generate a unique reference code for the error which can be used to look up
  // the error in telemetry if needed and if the user chooses to share it
  const errorReferenceCode = (0, _uuid.v4)();
  const line = _chalk.default.red((0, _repeat.default)(_context = '-').call(_context, process.stderr.columns));

  // Generate and print a nice message to the user
  const content = !includeEpilogue ? message : (0, _filter.default)(_context2 = ['', line, message, `\n${line}`, epilogue, includeReferenceCode && ` - Here's your unique error reference to quote: '${errorReferenceCode}'`, line]).call(_context2, Boolean).join('\n');
  console.error(content);

  // Record the error in telemetry
  (0, _cliHelpers.recordTelemetryError)(error ?? new Error(message));
  (0, _cliHelpers.recordTelemetryAttributes)({
    errorReferenceCode
  });
  process.exit(exitCode);
}