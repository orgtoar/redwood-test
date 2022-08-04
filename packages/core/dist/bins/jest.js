#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromJest = (0, _module.createRequire)(require.resolve('jest/package.json'));
const bin = requireFromJest('./package.json')['bin'];
requireFromJest(bin);