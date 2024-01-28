#! /usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
var _split = _interopRequireDefault(require("split2"));
var _index = require("./index");
const input = process.stdin;
const output = process.stdout;
input.pipe((0, _split.default)((0, _index.LogFormatter)())).pipe(output);