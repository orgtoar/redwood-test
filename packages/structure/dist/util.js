"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.validateRoutePath = validateRoutePath;

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _matchAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/match-all"));

function validateRoutePath(path) {
  // copied from https://github.com/redwoodjs/redwood/blob/master/packages/router/src/util.js
  // Check that path begins with a slash.
  if (!(0, _startsWith.default)(path).call(path, '/')) {
    throw new Error(`Route path does not begin with a slash: "${path}"`);
  }

  if ((0, _indexOf.default)(path).call(path, ' ') >= 0) {
    throw new Error(`Route path contains spaces: "${path}"`);
  } // Check for duplicate named params.


  const matches = (0, _matchAll.default)(path).call(path, /\{([^}]+)\}/g);
  const memo = {};

  for (const match of matches) {
    // Extract the param's name to make sure there aren't any duplicates
    const param = match[1].split(':')[0];

    if (memo[param]) {
      throw new Error(`Route path contains duplicate parameter: "${path}"`);
    } else {
      memo[param] = true;
    }
  }
}