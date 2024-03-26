"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.filesWithTemplateVars = exports.description = exports.command = void 0;
var _lib = require("../../../lib");
var _schemaHelpers = require("../../../lib/schemaHelpers");
var _service = require("../../generate/service/service");
var _helpers = require("../helpers");
// This function wraps files(), so we can pass templateVars. templateVars
// referenced in a file template must be defined, otherwise template rendering
// fails. This way we can pass stub values for templateVars and do not define
// fake builder flags for destroy command just to make templates work.
//
// Better solution would be to split file paths resolving and template
// rendering into separate functions. See more in this PR discussion:
// https://github.com/redwoodjs/redwood/pull/487#issue-411204396
const filesWithTemplateVars = templateVars => {
  return args => (0, _service.files)({
    ...args,
    ...templateVars
  });
};
exports.filesWithTemplateVars = filesWithTemplateVars;
const {
  command,
  description,
  handler,
  tasks
} = (0, _helpers.createYargsForComponentDestroy)({
  componentName: 'service',
  preTasksFn: _schemaHelpers.verifyModelName,
  filesFn: filesWithTemplateVars({
    ...(0, _lib.getDefaultArgs)(_service.builder),
    crud: true
  })
});
exports.tasks = tasks;
exports.handler = handler;
exports.description = description;
exports.command = command;