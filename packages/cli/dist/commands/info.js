"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _envinfo = _interopRequireDefault(require("envinfo"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

// inspired by gatsby/packages/gatsby-cli/src/create-cli.js and
// and gridsome/packages/cli/lib/commands/info.js
const command = 'info';
exports.command = command;
const description = 'Print your system environment information';
exports.description = description;

const builder = yargs => {
  yargs.epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#info')}`);
};

exports.builder = builder;

const handler = async () => {
  try {
    const output = await _envinfo.default.run({
      System: ['OS', 'Shell'],
      Binaries: ['Node', 'Yarn'],
      Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
      // yarn workspaces not supported :-/
      npmPackages: '@redwoodjs/*',
      Databases: ['SQLite']
    });
    console.log(output);
  } catch (e) {
    console.log('Error: Cannot access environment info');
    console.log(e);
    process.exit(1);
  }
};

exports.handler = handler;