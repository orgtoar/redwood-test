"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cell = require("../../generate/cell/cell");
var _helpers = require("../helpers");
const {
  command,
  description,
  builder,
  handler,
  tasks
} = (0, _helpers.createYargsForComponentDestroy)({
  componentName: 'cell',
  filesFn: _cell.files
});
exports.tasks = tasks;
exports.handler = handler;
exports.builder = builder;
exports.description = description;
exports.command = command;