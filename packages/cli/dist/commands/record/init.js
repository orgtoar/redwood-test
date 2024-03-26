"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _record = require("@redwoodjs/record");
const handler = async () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'record'
  });
  await (0, _record.parseDatamodel)();
};
exports.handler = handler;