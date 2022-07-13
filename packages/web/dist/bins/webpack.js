#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromWebpack = (0, _module.createRequire)(require.resolve('webpack/package.json'));
const bins = requireFromWebpack('./package.json')['bin'];
requireFromWebpack("./".concat(bins['webpack']));