#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromInternal = (0, _module.createRequire)(require.resolve('@redwoodjs/internal/package.json'));
const bins = requireFromInternal('./package.json')['bin'];
requireFromInternal(bins['rw-gen-watch']);