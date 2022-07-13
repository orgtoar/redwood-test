"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.basenameNoExt = basenameNoExt;
exports.directoryNameResolver = directoryNameResolver;
exports.followsDirNameConvention = followsDirNameConvention;
exports.isCellFileName = isCellFileName;
exports.isLayoutFileName = isLayoutFileName;

var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/ends-with"));

var _fs = require("fs");

var _path = require("path");

function directoryNameResolver(dirName) {
  dirName = (0, _path.normalize)(dirName);
  const parts = dirName.split(_path.sep);
  const pp = parts[parts.length - 1];
  parts.push(pp);
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  const pathNoExt = parts.join(_path.sep);

  for (const ext of extensions) {
    const path = pathNoExt + ext;

    if ((0, _fs.existsSync)(path)) {
      return path;
    }
  }
}

function followsDirNameConvention(filePath) {
  filePath = (0, _path.normalize)(filePath);
  const ending = basenameNoExt(filePath) + _path.sep + (0, _path.basename)(filePath);
  return (0, _endsWith.default)(filePath).call(filePath, ending);
}

function basenameNoExt(path) {
  path = (0, _path.normalize)(path);
  const parts = (0, _path.basename)(path).split('.');

  if (parts.length > 1) {
    parts.pop();
  }

  return parts.join('.');
}

function isLayoutFileName(f) {
  var _context;

  f = (0, _path.normalize)(f);
  return (0, _endsWith.default)(_context = basenameNoExt(f)).call(_context, 'Layout');
}

function isCellFileName(f) {
  var _context2;

  f = (0, _path.normalize)(f);
  return (0, _endsWith.default)(_context2 = basenameNoExt(f)).call(_context2, 'Cell');
}