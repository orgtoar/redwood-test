#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromMSW = (0, _module.createRequire)(require.resolve('msw/package.json'));
const bins = requireFromMSW('./package.json')['bin']; // Most `package.json`s list their bins as relative paths, but not MSW.

requireFromMSW("./".concat(bins['msw']));