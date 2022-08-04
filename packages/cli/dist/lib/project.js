"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.sides = exports.isTypeScriptProject = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ = require(".");

const isTypeScriptProject = () => {
  const paths = (0, _.getPaths)();
  return _fs.default.existsSync(_path.default.join(paths.web.base, 'tsconfig.json')) || _fs.default.existsSync(_path.default.join(paths.api.base, 'tsconfig.json'));
};

exports.isTypeScriptProject = isTypeScriptProject;

const sides = () => {
  const paths = (0, _.getPaths)();
  let sides = [];

  if (_fs.default.existsSync(_path.default.join(paths.web.base, 'package.json'))) {
    sides = [...sides, 'web'];
  }

  if (_fs.default.existsSync(_path.default.join(paths.api.base, 'package.json'))) {
    sides = [...sides, 'api'];
  }

  return sides;
};

exports.sides = sides;