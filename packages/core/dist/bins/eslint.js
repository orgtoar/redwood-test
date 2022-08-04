#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromESLint = (0, _module.createRequire)(require.resolve('eslint/package.json'));
const bins = requireFromESLint('./package.json')['bin'];
requireFromESLint(bins['eslint']);