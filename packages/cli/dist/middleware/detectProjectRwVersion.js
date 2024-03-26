"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lib = require("../lib");
const detectRwVersion = argv => {
  if (!argv.rwVersion) {
    return {
      rwVersion: (0, _lib.getInstalledRedwoodVersion)()
    };
  }
  return {};
};
var _default = exports.default = detectRwVersion;