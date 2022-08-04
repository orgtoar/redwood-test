"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.description = exports.command = exports.builder = void 0;

var _directive = require("../../generate/directive/directive");

var _helpers = require("../helpers");

const description = 'Destroy a directive';
exports.description = description;
const {
  command,
  handler,
  builder,
  tasks
} = (0, _helpers.createYargsForComponentDestroy)({
  componentName: 'directive',
  filesFn: args => (0, _directive.files)({ ...args,
    type: 'validator'
  })
});
exports.tasks = tasks;
exports.builder = builder;
exports.handler = handler;
exports.command = command;