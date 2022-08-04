"use strict";

Object.defineProperty(exports, "__esModule", {
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

var _default = detectRwVersion;
exports.default = _default;