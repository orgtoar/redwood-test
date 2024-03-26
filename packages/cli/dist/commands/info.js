"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _envinfo = _interopRequireDefault(require("envinfo"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
// inspired by gatsby/packages/gatsby-cli/src/create-cli.js and
// and gridsome/packages/cli/lib/commands/info.js

const command = exports.command = 'info';
const description = exports.description = 'Print your system environment information';
const builder = yargs => {
  yargs.epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#info')}`);
};
exports.builder = builder;
const handler = async () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'info'
  });
  const output = await _envinfo.default.run({
    System: ['OS', 'Shell'],
    Binaries: ['Node', 'Yarn'],
    Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
    // yarn workspaces not supported :-/
    npmPackages: '@redwoodjs/*',
    Databases: ['SQLite']
  });
  console.log(output);
};
exports.handler = handler;