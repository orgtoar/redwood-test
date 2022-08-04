"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.ArrayLike_normalize = ArrayLike_normalize;
exports.iter = iter;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _from = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/from"));

async function ArrayLike_normalize(x) {
  if (x instanceof _promise.default) {
    return x;
  }

  if (x === null) {
    return [];
  }

  if (typeof x === 'undefined') {
    return [];
  }

  return [...x];
}

function iter(f) {
  return (0, _from.default)(f());
}