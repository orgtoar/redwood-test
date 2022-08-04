"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

var _getRWPaths = _interopRequireDefault(require("./getRWPaths"));

var _prettify = _interopRequireDefault(require("./prettify"));

const ts2js = file => {
  const result = (0, _core.transform)(file, {
    cwd: (0, _getRWPaths.default)().base,
    configFile: false,
    plugins: [['@babel/plugin-transform-typescript', {
      isTSX: true,
      allExtensions: true
    }]],
    retainLines: true
  });

  if (result !== null && result !== void 0 && result.code) {
    return (0, _prettify.default)(result.code);
  }

  return null;
};

var _default = ts2js;
exports.default = _default;