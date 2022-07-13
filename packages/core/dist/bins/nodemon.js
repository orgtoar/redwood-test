#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromNodemon = (0, _module.createRequire)(require.resolve('nodemon/package.json'));
const bins = requireFromNodemon('./package.json')['bin'];
requireFromNodemon(bins['nodemon']);