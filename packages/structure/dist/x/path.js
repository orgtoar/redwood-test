"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.basenameNoExt = basenameNoExt;
exports.directoryNameResolver = directoryNameResolver;
exports.followsDirNameConvention = followsDirNameConvention;
exports.isCellFileName = isCellFileName;
exports.isLayoutFileName = isLayoutFileName;

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
  return filePath.endsWith(ending);
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
  f = (0, _path.normalize)(f);
  return basenameNoExt(f).endsWith('Layout');
}

function isCellFileName(f) {
  f = (0, _path.normalize)(f);
  return basenameNoExt(f).endsWith('Cell');
}