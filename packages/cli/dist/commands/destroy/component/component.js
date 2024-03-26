"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.description = exports.command = exports.builder = void 0;
var _component = require("../../generate/component/component");
var _helpers = require("../helpers");
const description = exports.description = 'Destroy a component';
const {
  command,
  builder,
  handler,
  tasks
} = (0, _helpers.createYargsForComponentDestroy)({
  componentName: 'component',
  filesFn: _component.files
});
exports.tasks = tasks;
exports.handler = handler;
exports.builder = builder;
exports.command = command;