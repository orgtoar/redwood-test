#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _yargs = _interopRequireDefault(require("yargs"));

// eslint-disable-next-line no-unused-expressions
_yargs.default.scriptName('codemods').example([['$0 add-directives', 'Run the add-directives codemod']]).commandDir('./codemods', {
  recurse: true,
  extensions: ['yargs.js', 'yargs.ts']
}).demandCommand().strict().argv;