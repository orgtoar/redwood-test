"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../lib");
const command = exports.command = 'lint [path..]';
const description = exports.description = 'Lint your files';
const builder = yargs => {
  yargs.positional('path', {
    description: 'Specify file(s) or directory(ies) to lint relative to project root',
    type: 'array'
  }).option('fix', {
    default: false,
    description: 'Try to fix errors',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#lint')}`);
};
exports.builder = builder;
const handler = async ({
  path,
  fix
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'lint',
    fix
  });
  try {
    var _context;
    const pathString = path?.join(' ');
    const result = await (0, _execa.default)('yarn eslint', (0, _filter.default)(_context = [fix && '--fix', !pathString && _fsExtra.default.existsSync((0, _lib.getPaths)().web.src) && 'web/src', !pathString && _fsExtra.default.existsSync((0, _lib.getPaths)().web.config) && 'web/config', !pathString && _fsExtra.default.existsSync((0, _lib.getPaths)().scripts) && 'scripts', !pathString && _fsExtra.default.existsSync((0, _lib.getPaths)().api.src) && 'api/src', pathString]).call(_context, Boolean), {
      cwd: (0, _lib.getPaths)().base,
      shell: true,
      stdio: 'inherit'
    });
    process.exitCode = result.exitCode;
  } catch (error) {
    process.exitCode = error.exitCode ?? 1;
  }
};
exports.handler = handler;