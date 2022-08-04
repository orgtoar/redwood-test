#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _index = _interopRequireDefault(require("configstore/index"));

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _process$env$RWJS_CWD;

const config = new _index.default('@redwoodjs/cli');
const RWFW_PATH = process.env.RWFW_PATH || process.env.RW_PATH || config.get('RWFW_PATH');

if (!RWFW_PATH) {
  console.error('Error: You must specify the path to Redwood Framework');
  console.error('Usage: `RWFW_PATH=~/gh/redwoodjs/redwood yarn rwfw <command>');
  process.exit(1);
}

if (!_fs.default.existsSync(RWFW_PATH)) {
  console.error(`Error: The specified path to Redwood Framework (${RWFW_PATH}) does not exist.`);
  console.error('Usage: `RWFW_PATH=~/gh/redwoodjs/redwood yarn rwfw <command>');
  process.exit(1);
}

const absRwFwPath = _path.default.resolve(process.cwd(), RWFW_PATH);

config.set('RWFW_PATH', absRwFwPath); // Execute the commands in the Redwood Framework Tools package.

const projectPath = _path.default.dirname((0, _paths.getConfigPath)((_process$env$RWJS_CWD = process.env.RWJS_CWD) !== null && _process$env$RWJS_CWD !== void 0 ? _process$env$RWJS_CWD : process.cwd()));

console.log('Redwood Framework Tools Path:', (0, _terminalLink.default)(absRwFwPath, absRwFwPath));
let command = process.argv.slice(2);
const helpCommands = ['help', '--help'];

if (!command.length || command.some(cmd => helpCommands.includes(cmd))) {
  command = ['run'];
}

try {
  _execa.default.sync('yarn', [...command], {
    stdio: 'inherit',
    shell: true,
    cwd: absRwFwPath,
    env: {
      RWJS_CWD: projectPath
    }
  });
} catch (e) {
  console.log(); //
}