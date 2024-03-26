"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.forEachFunctionOn = forEachFunctionOn;
exports.nodeIs = void 0;
exports.sieve = sieve;
require("core-js/modules/es.array.push.js");
var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));
var _lodash = require("lodash");
const nodeIs = type => node => node.type === type;

// In this algorithm, we take N list-rule-pairs, of the form [[...elements], rule], where `rule` is
// a unary function accepting a result subarray and returning a position (possibly -1) indicating
// where an element of its list may be placed in the given subarray. Each list-rule-pair can be
// thought of as a category of elements that have particular ordering concerns.
// The algorithm returns a minimally-sized array of arrays, where each element occurs exactly once
// in one of the subarrays, and none of the ordering rules are violated.
// It is assumed that no rule prevents an element from being placed alone in its own subarray.
exports.nodeIs = nodeIs;
function sieve(...listRulePairs) {
  const result = [[]];
  for (const [list, rule] of listRulePairs) {
    elementLoop: for (const element of list) {
      for (const arr of result) {
        const position = rule(arr);
        if (position !== -1) {
          (0, _splice.default)(arr).call(arr, position, 0, element);
          continue elementLoop;
        }
      }
      // We haven't found an array appropriate to hold element. Assume that any element can
      // appear alone in a list, and create a new array holding that element:
      result.push([element]);
    }
  }
  return result;
}
function forEachFunctionOn(object, callback) {
  (0, _lodash.forOwn)(object, (value, key) => {
    if (typeof value === 'function') {
      callback(key, value);
    }
  });
}