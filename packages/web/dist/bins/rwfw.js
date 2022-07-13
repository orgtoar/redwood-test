#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromCli = (0, _module.createRequire)(require.resolve('@redwoodjs/cli/package.json'));
const bins = requireFromCli('./package.json')['bin']; // Ensure we run all commands from the base of the RW project
// even if you invoke from ./web or ./api

const rwProjectRoot = requireFromCli('./dist/lib/index.js').getPaths().base;
process.chdir(rwProjectRoot);
requireFromCli(bins['rwfw']);