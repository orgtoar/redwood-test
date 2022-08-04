#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromRimraf = (0, _module.createRequire)(require.resolve('rimraf/package.json'));
const bin = requireFromRimraf('./package.json')['bin'];
requireFromRimraf(bin);