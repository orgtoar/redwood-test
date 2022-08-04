#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromApiServer = (0, _module.createRequire)(require.resolve('@redwoodjs/api-server/package.json'));
const bins = requireFromApiServer('./package.json')['bin'];
requireFromApiServer(bins['rw-server']);