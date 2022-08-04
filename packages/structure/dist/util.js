"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateRoutePath = validateRoutePath;

var _matchAll = _interopRequireDefault(require("core-js-pure/stable/instance/match-all.js"));

function validateRoutePath(path) {
  // copied from https://github.com/redwoodjs/redwood/blob/master/packages/router/src/util.js
  // Check that path begins with a slash.
  if (!path.startsWith('/')) {
    throw new Error(`Route path does not begin with a slash: "${path}"`);
  }

  if (path.indexOf(' ') >= 0) {
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