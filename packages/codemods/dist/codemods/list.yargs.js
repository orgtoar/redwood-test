"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _yargsParser = require("yargs-parser");

// @ts-expect-error is actually exported, just not in types
const command = 'list <rwVersion>';
exports.command = command;
const description = 'List available codemods for a specific version';
exports.description = description;
const aliases = ['ls'];
exports.aliases = aliases;

const builder = yargs => {
  yargs.positional('rwVersion', {
    type: 'string',
    required: true,
    choices: _fs.default.readdirSync(__dirname).filter(file => !_fs.default.statSync(_path.default.join(__dirname, file)).isFile()) // Only list the folders

  });
};

exports.builder = builder;

const handler = ({
  rwVersion
}) => {
  console.log('Listing codemods for', rwVersion);
  console.log();

  const modsForVersion = _fs.default.readdirSync(_path.default.join(__dirname, rwVersion));

  modsForVersion.forEach(codemod => {
    // Use decamelize to match the usual yargs names,
    // instead of having to load the .yargs files
    console.log(`- npx @redwoodjs/codemods ${(0, _yargsParser.decamelize)(codemod)}`);
  });
};

exports.handler = handler;