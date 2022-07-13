#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromCrossEnv = (0, _module.createRequire)(require.resolve('cross-env/package.json'));
const bins = requireFromCrossEnv('./package.json')['bin'];
requireFromCrossEnv(`./${bins['cross-env']}`);