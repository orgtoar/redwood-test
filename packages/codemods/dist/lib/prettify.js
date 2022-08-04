"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _prettier = require("prettier");

var _getRWPaths = _interopRequireDefault(require("./getRWPaths"));

const getPrettierConfig = () => {
  try {
    return require(_path.default.join((0, _getRWPaths.default)().base, 'prettier.config.js'));
  } catch (e) {
    return undefined;
  }
};

const prettify = code => (0, _prettier.format)(code, {
  singleQuote: true,
  semi: false,
  ...getPrettierConfig(),
  parser: 'babel'
});

var _default = prettify;
exports.default = _default;