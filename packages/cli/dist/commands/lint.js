"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

const command = 'lint [path..]';
exports.command = command;
const description = 'Lint your files';
exports.description = description;

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
  try {
    const pathString = path === null || path === void 0 ? void 0 : path.join(' ');
    const result = await (0, _execa.default)('yarn eslint', [fix && '--fix', !pathString && _fs.default.existsSync((0, _lib.getPaths)().web.src) && 'web/src', !pathString && _fs.default.existsSync((0, _lib.getPaths)().api.src) && 'api/src', pathString].filter(Boolean), {
      cwd: (0, _lib.getPaths)().base,
      shell: true,
      stdio: 'inherit'
    });
    process.exit(result.exitCode);
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;