"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateNodeEngine = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _getRootPackageJSON = _interopRequireDefault(require("../../../lib/getRootPackageJSON"));

const updateNodeEngine = () => {
  const [rootPackageJSON, rootPackageJSONPath] = (0, _getRootPackageJSON.default)();
  rootPackageJSON.engines.node = '>=14.17 <=16.x';

  _fs.default.writeFileSync(rootPackageJSONPath, JSON.stringify(rootPackageJSON, null, 2) + '\n');
};

exports.updateNodeEngine = updateNodeEngine;