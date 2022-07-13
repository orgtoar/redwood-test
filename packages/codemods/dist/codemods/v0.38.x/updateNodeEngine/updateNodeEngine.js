"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.updateNodeEngine = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _fs = _interopRequireDefault(require("fs"));

var _getRootPackageJSON = _interopRequireDefault(require("../../../lib/getRootPackageJSON"));

const updateNodeEngine = () => {
  const [rootPackageJSON, rootPackageJSONPath] = (0, _getRootPackageJSON.default)();
  rootPackageJSON.engines.node = '>=14.17 <=16.x';

  _fs.default.writeFileSync(rootPackageJSONPath, (0, _stringify.default)(rootPackageJSON, null, 2) + '\n');
};

exports.updateNodeEngine = updateNodeEngine;