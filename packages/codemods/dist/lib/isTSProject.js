"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _getRWPaths = _interopRequireDefault(require("./getRWPaths"));

const isTSProject = _fastGlob.default.sync(`${(0, _getRWPaths.default)().base}/**/tsconfig.json`, {
  ignore: ['**/node_modules/**']
}).length > 0;
var _default = isTSProject;
exports.default = _default;