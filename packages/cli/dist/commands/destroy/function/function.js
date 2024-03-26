"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.description = exports.command = exports.builder = void 0;
var _function = require("../../generate/function/function");
var _helpers = require("../helpers");
const description = exports.description = 'Destroy a Function';
const builder = yargs => {
  yargs.positional('name', {
    description: 'Name of the Function',
    type: 'string'
  });
};
exports.builder = builder;
const {
  command,
  handler,
  tasks
} = (0, _helpers.createYargsForComponentDestroy)({
  componentName: 'function',
  filesFn: _function.files
});
exports.tasks = tasks;
exports.handler = handler;
exports.command = command;