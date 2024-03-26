"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _ts2js = require("@redwoodjs/internal/dist/ts2js");
var _projectConfig = require("@redwoodjs/project-config");
const command = exports.command = 'ts-to-js';
const description = exports.description = '[DEPRECATED]\n' + 'Convert a TypeScript project to JavaScript';
const handler = () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'ts-to-js'
  });
  (0, _ts2js.convertTsProjectToJs)((0, _projectConfig.getPaths)().base);
  (0, _ts2js.convertTsScriptsToJs)((0, _projectConfig.getPaths)().base);
};
exports.handler = handler;