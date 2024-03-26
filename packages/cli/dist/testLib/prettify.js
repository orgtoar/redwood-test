"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _path = _interopRequireDefault(require("path"));
var _prettier = require("prettier");
var _projectConfig = require("@redwoodjs/project-config");
const getPrettierConfig = () => {
  try {
    return require(_path.default.join((0, _projectConfig.getPaths)().base, 'prettier.config.js'));
  } catch (e) {
    return undefined;
  }
};
const prettify = (code, options = {}) => (0, _prettier.format)(code, {
  singleQuote: true,
  semi: false,
  ...getPrettierConfig(),
  parser: 'babel',
  ...options
});
var _default = exports.default = prettify;